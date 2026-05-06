/**
 * 历史作品状态管理
 */
import { defineStore } from 'pinia'

export interface HistoryItem {
  task_id: string
  image_url: string | null
  prompt: string
  status: string
  cost: number
  model_name?: string
  aspect_ratio?: string
  created_at?: string
}

export const useHistoryStore = defineStore('history', {
  state: () => ({
    items: [] as HistoryItem[],
    currentPage: 1,
    pageSize: 20,
    total: 0,
    hasMore: true,
    loading: false,
  }),
  actions: {
    setItems(items: HistoryItem[]) {
      this.items = items
    },
    appendItems(items: HistoryItem[]) {
      this.items.push(...items)
    },
    removeItem(taskId: string) {
      this.items = this.items.filter((item) => item.task_id !== taskId)
      this.total--
    },
    reset() {
      this.items = []
      this.currentPage = 1
      this.hasMore = true
    },
  },
})
