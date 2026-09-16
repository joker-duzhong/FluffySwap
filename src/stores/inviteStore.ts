import { defineStore } from 'pinia'
import { aurakeyApi, type BindInviteResponse } from '@/services/aurakey'
import { useAuthStore } from './authStore'
import { normalizeInviteCode } from '@/utils/invite'

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
    receiveLoginInvite(inviteCode: unknown) {
      return this.setPendingInviteCode(inviteCode)
    },
    clearPendingInviteCode() {
      this.pendingInviteCode = ''
    },
    clearBoundInviteCode() {
      this.boundInviteCode = ''
      this.bindingInvite = false
    },
    async bindPendingInvite() {
      const inviteCode = this.pendingInviteCode
      const authStore = useAuthStore()

      if (!inviteCode || !authStore.hasPhone || this.bindingInvite || this.boundInviteCode === inviteCode) {
        return null
      }

      this.bindingInvite = true
      const epoch = authStore.sessionEpoch
      try {
        const result = await aurakeyApi.user.bindInvite(inviteCode)
        if (epoch !== authStore.sessionEpoch) return null
        this.boundInviteCode = inviteCode
        this.pendingInviteCode = ''
        return result as BindInviteResponse
      } finally {
        if (epoch === authStore.sessionEpoch) this.bindingInvite = false
      }
    },
  },
})
