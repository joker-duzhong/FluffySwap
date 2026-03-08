import type { PendingTask, TaskStorage, TaskStatus } from '@/types/task';

const STORAGE_KEY = 'fluffySwap_pendingTask';

/** 检测是否为 H5 环境 */
const isH5 = (): boolean => {
  // @ts-ignore
  return typeof document !== 'undefined';
};

class TaskService {
  private storage: TaskStorage;

  constructor() {
    this.storage = this.load();
  }

  /** 从本地存储加载 */
  private load(): TaskStorage {
    try {
      let raw: string | null = null;

      if (isH5()) {
        raw = localStorage.getItem(STORAGE_KEY);
      } else {
        const data = uni.getStorageSync(STORAGE_KEY);
        raw = data ? (typeof data === 'string' ? data : JSON.stringify(data)) : null;
      }

      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Task load failed:', e);
    }
    return { currentTask: null, version: 1 };
  }

  /** 保存到本地存储 */
  private persist(): void {
    try {
      const data = JSON.stringify(this.storage);

      if (isH5()) {
        localStorage.setItem(STORAGE_KEY, data);
      } else {
        uni.setStorageSync(STORAGE_KEY, data);
      }
    } catch (e) {
      console.error('Task persist failed:', e);
    }
  }

  /** 保存新任务 */
  saveTask(task: Omit<PendingTask, 'createdAt' | 'status'>): PendingTask {
    const newTask: PendingTask = {
      ...task,
      createdAt: Date.now(),
      status: 'pending'
    };
    this.storage.currentTask = newTask;
    this.persist();
    return newTask;
  }

  /** 更新任务状态 */
  updateStatus(status: TaskStatus): void {
    if (this.storage.currentTask) {
      this.storage.currentTask.status = status;
      this.persist();
    }
  }

  /** 获取当前任务 */
  getTask(): PendingTask | null {
    return this.storage.currentTask;
  }

  /** 检查是否有未完成的任务 */
  hasPendingTask(): boolean {
    const task = this.storage.currentTask;
    if (!task) return false;
    // pending 或 processing 状态算未完成
    return task.status === 'pending' || task.status === 'processing';
  }

  /** 清除任务 */
  clearTask(): void {
    this.storage.currentTask = null;
    this.persist();
  }
}

export const taskService = new TaskService();
