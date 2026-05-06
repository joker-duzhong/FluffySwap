/**
 * 用户认证状态管理
 */
import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '@/config'

export interface UserProfile {
  user_id: string
  nickname?: string | null
  avatar?: string | null
  phone?: string
  openid?: string | null
  balance: number
  is_vip: boolean
  type: string
  vip_expire_time?: number
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    userProfile: null as UserProfile | null,
    isLoggedIn: false,
  }),
  getters: {
    hasPhone: (state) => !!state.userProfile?.phone,
    isVip: (state) => state.userProfile?.is_vip || false,
    balance: (state) => state.userProfile?.balance || 0,
  },
  actions: {
    setToken(token: string) {
      this.token = token
      this.isLoggedIn = true
      uni.setStorageSync(STORAGE_KEYS.TOKEN, token)
    },
    setUserProfile(profile: UserProfile) {
      const normalizedProfile = {
        ...profile,
        nickname: profile.nickname || 'AI 魔法师',
        avatar: profile.avatar || '/static/default-avatar.png',
        type: profile.type || '普通会员',
      }
      this.userProfile = normalizedProfile
      uni.setStorageSync(STORAGE_KEYS.USER_INFO, normalizedProfile)
    },
    clearAuth() {
      this.token = ''
      this.userProfile = null
      this.isLoggedIn = false
      uni.removeStorageSync(STORAGE_KEYS.TOKEN)
      uni.removeStorageSync(STORAGE_KEYS.USER_INFO)
    },
    loadFromStorage() {
      const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
      const userInfo = uni.getStorageSync(STORAGE_KEYS.USER_INFO)
      if (token) {
        this.token = token
        this.isLoggedIn = true
      }
      if (userInfo) {
        this.userProfile = userInfo
      }
    },
    updateBalance(balance: number) {
      if (this.userProfile) {
        this.userProfile.balance = balance
        uni.setStorageSync(STORAGE_KEYS.USER_INFO, this.userProfile)
      }
    },
  },
})
