/**
 * 历史作品状态管理
 */
import { defineStore } from "pinia";
import { aurakeyApi, type PaginatedData, type TaskHistoryItem } from "@/services/aurakey";

export type HistoryItem = TaskHistoryItem;

const POLL_INTERVAL = 2000;
const RUNNING_STATUS = new Set(["pending", "processing"]);
const TERMINAL_STATUS = new Set(["success", "failed"]);

let pollTimer: ReturnType<typeof setInterval> | null = null;
const notifiedTaskIds = new Set<string>();

interface LoadHistoryOptions {
  reset?: boolean;
  silent?: boolean;
}

const isRunningStatus = (status?: string) => Boolean(status && RUNNING_STATUS.has(status));

const isTerminalStatus = (status?: string) => Boolean(status && TERMINAL_STATUS.has(status));

const getItemProgress = (item?: TaskHistoryItem | null) => {
  return typeof item?.progress === "number" ? item.progress : 0;
};

const showTaskResultToast = (item: TaskHistoryItem) => {
  if (notifiedTaskIds.has(item.task_id)) return;
  notifiedTaskIds.add(item.task_id);

  if (item.status === "success") {
    uni.showToast({ title: "作品已生成", icon: "success" });
  }
  if (item.status === "failed") {
    uni.showToast({ title: item.failed_reason || "生成失败", icon: "none" });
  }
};

export const useHistoryStore = defineStore("history", {
  state: () => ({
    items: [] as TaskHistoryItem[],
    currentPage: 1,
    pageSize: 30,
    total: 0,
    hasMore: true,
    loading: false,
    pollingTaskId: "",
    pollingProgress: 0,
    polling: false,
  }),
  getters: {
    hasRunningTask: (state) => state.items.some((item) => isRunningStatus(item.status)),
    runningItem: (state) => state.items.find((item) => isRunningStatus(item.status)) || null,
    isRunningItem: (state) => {
      return (taskId: string) => {
        return state.items.some((item) => item.task_id === taskId && isRunningStatus(item.status));
      };
    },
  },
  actions: {
    setItems(items: TaskHistoryItem[]) {
      this.items = this.withTrackedItem(items);
      this.syncPollingState();
    },
    appendItems(items: TaskHistoryItem[]) {
      this.items = this.mergeItems(this.items, items);
      this.syncPollingState();
    },
    removeItem(taskId: string) {
      this.removeItems([taskId]);
    },
    removeItems(taskIds: string[]) {
      const idSet = new Set(taskIds);
      const removedCount = this.items.filter((item) => idSet.has(item.task_id)).length;
      this.items = this.items.filter((item) => !idSet.has(item.task_id));
      this.total = Math.max(0, this.total - removedCount);
      this.syncPollingState();
    },
    async deleteItems(taskIds: string[]) {
      for (const taskId of taskIds) {
        await aurakeyApi.user.deleteHistory(taskId);
      }
      this.removeItems(taskIds);
    },
    async loadHistory(options: LoadHistoryOptions = {}) {
      const reset = Boolean(options.reset);
      if (this.loading || (!this.hasMore && !reset)) return;

      if (!options.silent) this.loading = true;

      try {
        const page = reset ? 1 : this.currentPage;
        const data = await aurakeyApi.user.history(page, this.pageSize);
        this.applyHistoryPage(data, page);
      } finally {
        if (!options.silent) this.loading = false;
      }
    },
    trackSubmittedTask(taskId: string, fallback: Partial<TaskHistoryItem> = {}) {
      if (!taskId) return;

      this.pollingTaskId = taskId;
      this.pollingProgress = Math.max(getItemProgress(fallback as TaskHistoryItem), this.pollingProgress || 0);
      this.items = this.withTrackedItem(this.items, {
        task_id: taskId,
        resource: fallback.resource,
        prompt: fallback.prompt || "生成中",
        status: fallback.status || "processing",
        progress: fallback.progress ?? null,
        cost: fallback.cost || 0,
        model_name: fallback.model_name,
        aspect_ratio: fallback.aspect_ratio,
        reference_images_ids: fallback.reference_images_ids,
        reference_images: fallback.reference_images,
        created_at: fallback.created_at,
      });
      this.startListPolling();
      void this.pollHistory().catch(() => undefined);
    },
    startListPolling() {
      if (pollTimer) return;
      pollTimer = setInterval(() => {
        void this.pollHistory().catch(() => undefined);
      }, POLL_INTERVAL);
    },
    stopListPolling() {
      if (!pollTimer) return;
      clearInterval(pollTimer);
      pollTimer = null;
      this.polling = false;
    },
    async pollHistory() {
      if (this.polling) return;

      this.polling = true;
      try {
        const data = await aurakeyApi.user.history(1, this.pageSize);
        this.applyHistoryPage(data, 1);
      } finally {
        this.polling = false;
      }
    },
    applyHistoryPage(data: PaginatedData<TaskHistoryItem>, page: number) {
      const trackedTaskId = this.pollingTaskId;
      const previousTrackedItem = this.items.find((item) => item.task_id === trackedTaskId);
      const wasTrackedRunning = isRunningStatus(previousTrackedItem?.status);
      const nextItems = data.items || [];
      this.items = page === 1 ? this.withTrackedItem(nextItems) : this.mergeItems(this.items, nextItems);
      this.currentPage = page + 1;
      this.total = data.total || this.items.length;
      this.hasMore = nextItems.length >= this.pageSize;
      const currentTrackedItem = this.items.find((item) => item.task_id === trackedTaskId);
      if (wasTrackedRunning && currentTrackedItem && isTerminalStatus(currentTrackedItem.status)) {
        showTaskResultToast(currentTrackedItem);
      }
      this.syncPollingState();
    },
    mergeItems(currentItems: TaskHistoryItem[], nextItems: TaskHistoryItem[]) {
      const merged = currentItems.slice();
      nextItems.forEach((nextItem) => {
        const index = merged.findIndex((item) => item.task_id === nextItem.task_id);
        if (index >= 0) merged[index] = { ...merged[index], ...nextItem };
        else merged.push(nextItem);
      });
      return merged;
    },
    withTrackedItem(items: TaskHistoryItem[], trackedItem?: TaskHistoryItem) {
      const item = trackedItem || this.items.find((historyItem) => historyItem.task_id === this.pollingTaskId);
      if (!this.pollingTaskId || !item || items.some((historyItem) => historyItem.task_id === this.pollingTaskId)) {
        return items;
      }
      return [item, ...items];
    },
    syncPollingState() {
      const currentTrackedItem = this.items.find((item) => item.task_id === this.pollingTaskId);
      const runningItem = currentTrackedItem && isRunningStatus(currentTrackedItem.status) ? currentTrackedItem : this.items.find((item) => isRunningStatus(item.status));

      if (runningItem) {
        this.pollingTaskId = runningItem.task_id;
        this.pollingProgress = getItemProgress(runningItem);
        this.startListPolling();
        return;
      }

      this.pollingTaskId = "";
      this.pollingProgress = 0;
      this.stopListPolling();
    },
    reset() {
      this.items = [];
      this.currentPage = 1;
      this.hasMore = true;
      this.total = 0;
      this.pollingTaskId = "";
      this.pollingProgress = 0;
      this.stopListPolling();
    },
  },
});
