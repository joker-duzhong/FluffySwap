import { defineStore } from 'pinia'
import { aurakeyApi, type BindInviteResponse } from '@/services/aurakey'
import { useAuthStore } from './authStore'
import { extractInviteCodeFromLaunchOptions, extractInviteCodeFromQuery, normalizeInviteCode } from '@/utils/invite'

export const useInviteStore = defineStore('invite', {
  state: () => ({
    pendingInviteCode: '',
    bindingInvite: false,
    boundInviteCode: '',
  }),
  getters: {
    hasPendingInvite: (state) => Boolean(state.pendingInviteCode),
  },
  actions: {
    setPendingInviteCode(inviteCode: unknown) {
      const normalizedInviteCode = normalizeInviteCode(inviteCode)
      if (!normalizedInviteCode) return false

      const authStore = useAuthStore()
      if (authStore.hasPhone) return false

      this.pendingInviteCode = normalizedInviteCode
      return true
    },
    captureInviteFromQuery(query?: Record<string, unknown> | null) {
      return this.setPendingInviteCode(extractInviteCodeFromQuery(query))
    },
    captureInviteFromLaunchOptions(
      options?: {
        query?: Record<string, unknown>
        scene?: string | number
      } | null,
    ) {
      return this.setPendingInviteCode(extractInviteCodeFromLaunchOptions(options))
    },
    clearPendingInviteCode() {
      this.pendingInviteCode = ''
    },
    clearBoundInviteCode() {
      this.boundInviteCode = ''
    },
    discardPendingInviteForBoundUser() {
      const authStore = useAuthStore()
      if (authStore.hasPhone) {
        this.pendingInviteCode = ''
      }
    },
    async bindPendingInvite() {
      const inviteCode = this.pendingInviteCode
      const authStore = useAuthStore()

      if (!inviteCode || !authStore.hasPhone || this.bindingInvite || this.boundInviteCode === inviteCode) {
        return null
      }

      this.bindingInvite = true
      try {
        const result = await aurakeyApi.user.bindInvite(inviteCode)
        this.boundInviteCode = inviteCode
        this.pendingInviteCode = ''
        return result as BindInviteResponse
      } finally {
        this.bindingInvite = false
      }
    },
  },
})
