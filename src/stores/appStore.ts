/**
 * 应用全局状态管理
 */
import { defineStore } from 'pinia'
import { DEFAULT_AURAKEY_SYSTEM_CONFIG, type AurakeySystemConfig } from '@/config'

export type TabName = 'template' | 'profile'

const mergeSystemConfig = (config?: Partial<AurakeySystemConfig> | null): AurakeySystemConfig => ({
  ...DEFAULT_AURAKEY_SYSTEM_CONFIG,
  ...config,
  custom: {
    ...DEFAULT_AURAKEY_SYSTEM_CONFIG.custom,
    ...(config?.custom || {}),
  },
})

export const useAppStore = defineStore('app', {
  state: () => ({
    currentTab: 'template' as TabName,
    systemConfig: mergeSystemConfig(),
    systemConfigLoaded: false,
    systemConfigLoading: false,
    appInitializing: true,
  }),
  getters: {
    rechargeTag: (state) => String(state.systemConfig.custom.recharge_tag || '').trim().replace(/^[,，]+/, ''),
    rechargeSubtitle: (state) => String(state.systemConfig.custom.recharge_subtitle || ''),
    inviteRewardPoints: (state) => state.systemConfig.invite_reward_points,
  },
  actions: {
    setTab(tab: TabName) {
      this.currentTab = tab
    },
    setSystemConfig(config?: Partial<AurakeySystemConfig> | null) {
      this.systemConfig = mergeSystemConfig(config)
      this.systemConfigLoaded = true
    },
    setSystemConfigLoading(loading: boolean) {
      this.systemConfigLoading = loading
    },
    setAppInitializing(initializing: boolean) {
      this.appInitializing = initializing
    },
  },
})
