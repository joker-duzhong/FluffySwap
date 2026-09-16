/** 用户身份、临时验证票据与业务会话。 */
import { defineStore } from 'pinia'
import { AUTH_SCOPE, AUTH_SESSION_VERSION, STORAGE_KEYS, WECHAT_CONFIG } from '@/config'
import { ASSETS } from '@/config/assets'
import { aurakeyApi, type AuthenticatedIdentity, type IdentityResponse, type PlatformUser, type UserProfile } from '@/services/aurakey'
import { ApiError, errorMessage } from '@/services/apiError'
import { useInviteStore } from './inviteStore'
import { useHistoryStore } from './historyStore'
import { useTaskStore } from './taskStore'
import { useGalleryStore } from './galleryStore'

export type { UserProfile } from '@/services/aurakey'

let identityPromise: Promise<IdentityResponse | null> | null = null
let refreshPromise: Promise<void> | null = null
let refreshEpoch = -1

const normalizeProfile = (profile: UserProfile): UserProfile => ({
  ...profile,
  nickname: profile.nickname || 'AuraKey 用户',
  avatar: profile.avatar || ASSETS.defaultAvatar,
  phone: profile.phone || null,
  balance: Number(profile.balance || 0),
  is_vip: Boolean(profile.is_vip),
  type: profile.type || '普通会员',
})

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    refreshToken: '',
    appScope: '',
    userId: '',
    userProfile: null as UserProfile | null,
    authenticated: false,
    profileLoading: false,
    identityBusy: false,
    loginTicket: '',
    ticketExpiresAt: '',
    identityError: '',
    retryAt: 0,
    sessionEpoch: 0,
  }),
  getters: {
    isLoggedIn: (state) => state.authenticated && state.appScope === AUTH_SCOPE && Boolean(state.token && state.userId && state.userProfile?.phone),
    phoneRequired: (state) => Boolean(state.loginTicket),
    hasPhone: (state) => state.authenticated && Boolean(state.userProfile?.phone),
    isVip: (state) => state.userProfile?.is_vip || false,
    balance: (state) => state.userProfile?.balance || 0,
    membershipType: (state) => state.userProfile?.type || '普通会员',
    vipExpireTime: (state) => state.userProfile?.vip_expire_time || null,
  },
  actions: {
    setProfileLoading(loading: boolean) {
      this.profileLoading = loading
    },
    persistSession() {
      uni.setStorageSync(STORAGE_KEYS.SESSION, {
        version: AUTH_SESSION_VERSION,
        appScope: this.appScope,
        userId: this.userId,
        accessToken: this.token,
        refreshToken: this.refreshToken,
      })
      uni.setStorageSync(STORAGE_KEYS.TOKEN, this.token)
      uni.setStorageSync(STORAGE_KEYS.REFRESH_TOKEN, this.refreshToken)
    },
    setUserProfile(profile: UserProfile) {
      if (!this.authenticated || profile.user_id !== this.userId) return
      this.userProfile = normalizeProfile(profile)
      uni.setStorageSync(STORAGE_KEYS.USER_INFO, this.userProfile)
    },
    clearAuth(preserveInvite = false) {
      this.sessionEpoch += 1
      this.token = ''
      this.refreshToken = ''
      this.appScope = ''
      this.userId = ''
      this.userProfile = null
      this.authenticated = false
      this.profileLoading = false
      this.loginTicket = ''
      this.ticketExpiresAt = ''
      useHistoryStore().reset()
      useTaskStore().reset()
      useGalleryStore().reset()
      const invite = useInviteStore()
      invite.clearBoundInviteCode()
      if (!preserveInvite) invite.clearPendingInviteCode()
      for (const key of [STORAGE_KEYS.TOKEN, STORAGE_KEYS.REFRESH_TOKEN, STORAGE_KEYS.SESSION, STORAGE_KEYS.USER_INFO, STORAGE_KEYS.LAST_PROMPT]) {
        uni.removeStorageSync(key)
      }
    },
    loadFromStorage() {
      const session = uni.getStorageSync(STORAGE_KEYS.SESSION)
      if (!session || session.version !== AUTH_SESSION_VERSION || session.appScope !== AUTH_SCOPE ||
          typeof session.accessToken !== 'string' || !session.accessToken ||
          typeof session.refreshToken !== 'string' || !session.refreshToken ||
          typeof session.userId !== 'string' || !session.userId) {
        this.clearAuth(true)
        return
      }
      this.token = session.accessToken
      this.refreshToken = session.refreshToken
      this.appScope = session.appScope
      this.userId = session.userId
      // 缓存不作为登录证明，启动仍用新的微信 code 验证身份。
      this.authenticated = false
    },
    updateBalance(balance: number) {
      if (this.userProfile) this.setUserProfile({ ...this.userProfile, balance })
    },
    updateProfilePatch(patch: Partial<UserProfile>) {
      if (this.userProfile) this.setUserProfile({ ...this.userProfile, ...patch, user_id: this.userId })
    },
    updatePlatformUser(user: PlatformUser) {
      if (user.id !== this.userId) return
      this.updateProfilePatch({ nickname: user.nickname, avatar: user.avatar?.url || null, phone: user.phone })
    },
    async refreshProfile(): Promise<void> {
      if (!this.authenticated) return
      const epoch = this.sessionEpoch
      const profile = await aurakeyApi.user.profile()
      if (epoch === this.sessionEpoch) this.setUserProfile(profile)
    },
    async acceptIdentity(result: AuthenticatedIdentity, bindInvite: boolean): Promise<void> {
      if (result.status !== 'AUTHENTICATED' || result.app_scope !== AUTH_SCOPE ||
          !result.access_token || !result.refresh_token || !result.user?.id ||
          !result.user.phone || result.user.needs_phone_binding) {
        this.clearAuth(true)
        throw new ApiError('登录信息不适用于当前小程序，请重新登录', 403)
      }
      if (this.userId && this.userId !== result.user.id) this.clearAuth(true)
      this.token = result.access_token
      this.refreshToken = result.refresh_token
      this.appScope = result.app_scope
      this.userId = result.user.id
      this.authenticated = true
      this.loginTicket = ''
      this.ticketExpiresAt = ''
      this.persistSession()
      this.setUserProfile({
        user_id: result.user.id, nickname: result.user.nickname, avatar: result.user.avatar?.url,
        phone: result.user.phone, balance: 0, is_vip: false, type: '普通会员',
      })
      this.profileLoading = true
      const epoch = this.sessionEpoch
      try {
        if (bindInvite) {
          try {
            await useInviteStore().bindPendingInvite()
          } catch (error) {
            if (epoch === this.sessionEpoch) uni.showToast({ title: errorMessage(error, '邀请码绑定失败，可在邀请页重试'), icon: 'none' })
          }
        } else {
          useInviteStore().clearPendingInviteCode()
        }
        await this.refreshProfile()
      } catch (error) {
        if (epoch === this.sessionEpoch) uni.showToast({ title: errorMessage(error, '资料暂未加载，请稍后刷新'), icon: 'none' })
      } finally {
        if (epoch === this.sessionEpoch) this.profileLoading = false
      }
    },
    checkRetry() {
      if (Date.now() < this.retryAt) throw new ApiError('请求过于频繁，请等待后重试', 429, Math.ceil((this.retryAt - Date.now()) / 1000))
    },
    handleIdentityError(error: unknown) {
      if (error instanceof ApiError && error.status === 499) return
      this.identityError = errorMessage(error, '验证失败，请重试')
      if (error instanceof ApiError && error.status === 429) this.retryAt = Date.now() + Math.max(error.retryAfter, 1) * 1000
      if (error instanceof ApiError && (error.status === 410 || error.status === 409 || error.status >= 500 || error.status === 0)) {
        this.loginTicket = ''
        this.ticketExpiresAt = ''
        this.identityError += ' 请重新进行微信登录。'
      }
    },
    async startIdentity(force = false): Promise<IdentityResponse | null> {
      if (identityPromise) return identityPromise
      if (this.identityBusy) return null
      if (!force && this.loginTicket && Date.parse(this.ticketExpiresAt) > Date.now()) return null
      this.checkRetry()
      this.clearAuth(true)
      this.identityBusy = true
      this.identityError = ''
      const epoch = this.sessionEpoch
      identityPromise = (async () => {
        try {
          const login = await new Promise<UniApp.LoginRes>((resolve, reject) => {
            uni.login({ provider: 'weixin', success: resolve, fail: () => reject(new ApiError('微信登录失败，请重试')) })
          })
          if (epoch !== this.sessionEpoch) throw new ApiError('登录操作已取消', 499)
          if (!login.code) throw new ApiError('未取得微信登录凭据，请重试')
          const result = await aurakeyApi.auth.miniappLogin(WECHAT_CONFIG.APPID, login.code)
          if (epoch !== this.sessionEpoch) throw new ApiError('登录操作已取消', 499)
          if (result.status === 'PHONE_REQUIRED') {
            if (!result.login_ticket || !Number.isFinite(Date.parse(result.expires_at))) throw new ApiError('登录响应无效，请重新登录')
            this.loginTicket = result.login_ticket
            this.ticketExpiresAt = result.expires_at
          } else {
            await this.acceptIdentity(result, false)
          }
          return result
        } catch (error) {
          if (epoch === this.sessionEpoch) this.handleIdentityError(error)
          throw error
        } finally {
          identityPromise = null
          this.identityBusy = false
        }
      })()
      return identityPromise
    },
    requireTicket(acceptedTerms: boolean): string {
      if (!acceptedTerms) throw new ApiError('请先阅读并同意用户协议和隐私政策', 400)
      this.checkRetry()
      if (!this.loginTicket || Date.parse(this.ticketExpiresAt) <= Date.now()) {
        this.loginTicket = ''
        this.ticketExpiresAt = ''
        throw new ApiError('本次验证已过期，请重新进行微信登录', 410)
      }
      return this.loginTicket
    },
    async completePhone(phoneCode: string, acceptedTerms: boolean): Promise<void> {
      await this.completeIdentity((ticket) => aurakeyApi.auth.completeMiniappPhone(ticket, phoneCode, true), acceptedTerms)
    },
    async completeSms(phone: string, code: string, acceptedTerms: boolean): Promise<void> {
      await this.completeIdentity((ticket) => aurakeyApi.auth.completeSms(ticket, phone, code, true), acceptedTerms)
    },
    async completeIdentity(complete: (ticket: string) => Promise<AuthenticatedIdentity>, acceptedTerms: boolean): Promise<void> {
      if (this.identityBusy) throw new ApiError('正在验证，请稍候', 400)
      this.identityError = ''
      const ticket = this.requireTicket(acceptedTerms)
      this.identityBusy = true
      const epoch = this.sessionEpoch
      try {
        const result = await complete(ticket)
        if (epoch !== this.sessionEpoch) throw new ApiError('登录操作已取消', 499)
        await this.acceptIdentity(result, true)
      } catch (error) {
        if (epoch === this.sessionEpoch) this.handleIdentityError(error)
        throw error
      } finally {
        this.identityBusy = false
      }
    },
    async refreshSession(): Promise<void> {
      if (refreshPromise && refreshEpoch === this.sessionEpoch) return refreshPromise
      const original = this.refreshToken
      const epoch = this.sessionEpoch
      if (!original || this.appScope !== AUTH_SCOPE) throw new ApiError('登录已过期，请重新登录', 401)
      refreshEpoch = epoch
      refreshPromise = (async () => {
        try {
          const result = await aurakeyApi.auth.refresh(original)
          if (epoch !== this.sessionEpoch || this.refreshToken !== original) throw new ApiError('登录状态已变化', 499)
          if (!result.access_token || !result.refresh_token) throw new ApiError('登录已过期，请重新登录', 401)
          this.token = result.access_token
          this.refreshToken = result.refresh_token
          this.persistSession()
        } finally {
          if (refreshEpoch === epoch) refreshPromise = null
        }
      })()
      return refreshPromise
    },
  },
})
