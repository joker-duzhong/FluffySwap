/**
 * 应用全局状态管理
 */
import { defineStore } from 'pinia'

export type TabName = 'discover' | 'create' | 'works' | 'profile'

export const useAppStore = defineStore('app', {
  state: () => ({
    currentTab: 'discover' as TabName,
    isCreating: false, // 是否正在创作（显示创作面板）
  }),
  actions: {
    setTab(tab: TabName) {
      this.currentTab = tab
    },
    showCreatePanel() {
      this.isCreating = true
    },
    hideCreatePanel() {
      this.isCreating = false
    },
  },
})
