/**
 * 用户认证状态管理
 */
import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '@/config'

export interface UserProfile {
  user_id: string
  nickname: string
  avatar: string
  phone?: string
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
      this.userProfile = profile
      uni.setStorageSync(STORAGE_KEYS.USER_INFO, profile)
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
