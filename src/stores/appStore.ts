/**
 * 应用全局状态管理
 */
import { defineStore } from 'pinia'

export type TabName = 'template' | 'profile'

export const useAppStore = defineStore('app', {
  state: () => ({
    currentTab: 'template' as TabName,
  }),
  actions: {
    setTab(tab: TabName) {
      this.currentTab = tab
    },
  },
})
