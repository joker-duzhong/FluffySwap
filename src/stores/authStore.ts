/**
 * 用户认证状态管理
 */
import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '@/config'
import { ASSETS } from '@/config/assets'
import { useInviteStore } from './inviteStore'

export interface UserProfile {
  user_id: string
  nickname?: string | null
  avatar?: string | null
  phone?: string | null
  openid?: string | null
  balance: number
  is_vip: boolean
  type: string
  vip_expire_time?: number | null
}

const normalizeProfile = (profile: Partial<UserProfile> & { id?: string }) => ({
  ...profile,
  user_id: profile.user_id || profile.id || '',
  nickname: profile.nickname || 'UserName_111',
  avatar: profile.avatar || ASSETS.defaultAvatar,
  phone: profile.phone || null,
  openid: profile.openid || null,
  balance: Number(profile.balance || 0),
  is_vip: Boolean(profile.is_vip),
  type: profile.type || '普通会员',
  vip_expire_time: typeof profile.vip_expire_time === 'number' ? profile.vip_expire_time : null,
}) as UserProfile

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    userProfile: null as UserProfile | null,
    isLoggedIn: false,
    profileLoading: false,
  }),
  getters: {
    hasPhone: (state) => !!state.userProfile?.phone,
    isVip: (state) => state.userProfile?.is_vip || false,
    balance: (state) => state.userProfile?.balance || 0,
    membershipType: (state) => state.userProfile?.type || '普通会员',
    vipExpireTime: (state) => state.userProfile?.vip_expire_time || null,
  },
  actions: {
    setProfileLoading(loading: boolean) {
      this.profileLoading = loading
    },
    setToken(token: string) {
      this.token = token
      uni.setStorageSync(STORAGE_KEYS.TOKEN, token)
    },
    setUserProfile(profile: UserProfile) {
      const normalizedProfile = normalizeProfile(profile)
      this.userProfile = normalizedProfile
      this.isLoggedIn = Boolean(normalizedProfile.phone)
      uni.setStorageSync(STORAGE_KEYS.USER_INFO, normalizedProfile)
    },
    clearAuth() {
      const inviteStore = useInviteStore()
      this.token = ''
      this.userProfile = null
      this.isLoggedIn = false
      this.profileLoading = false
      inviteStore.clearBoundInviteCode()
      uni.removeStorageSync(STORAGE_KEYS.TOKEN)
      uni.removeStorageSync(STORAGE_KEYS.USER_INFO)
    },
    loadFromStorage() {
      const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
      const userInfo = uni.getStorageSync(STORAGE_KEYS.USER_INFO)
      if (token) {
        this.token = token
      }
      if (userInfo) {
        this.userProfile = normalizeProfile(userInfo)
      }
      this.isLoggedIn = Boolean(this.userProfile?.phone)
    },
    updateBalance(balance: number) {
      if (this.userProfile) {
        this.userProfile.balance = balance
        uni.setStorageSync(STORAGE_KEYS.USER_INFO, this.userProfile)
      }
    },
    updateProfilePatch(patch: Partial<UserProfile>) {
      if (!this.userProfile) return
      this.userProfile = normalizeProfile({ ...this.userProfile, ...patch })
      this.isLoggedIn = Boolean(this.userProfile.phone)
      uni.setStorageSync(STORAGE_KEYS.USER_INFO, this.userProfile)
    },
  },
})
