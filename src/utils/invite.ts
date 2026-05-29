import { ENTRY_QUERY_KEYS, LOGIN_INVITE_ENTRY_TYPE, MINI_PROGRAM_ENTRY_PAGE_PATH } from '@/utils/miniProgramEntryShared'

const INVITE_REDIRECT_BASE_URL = 'https://tool.lxyy.fun/miniapp/h5/aurakey/redirect'

const toPlainString = (value: unknown) => {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''
  return String(value)
}

export const normalizeInviteCode = (value: unknown) => {
  const normalized = toPlainString(value).trim()
  return normalized ? normalized.slice(0, 64) : ''
}

export const buildInvitePagePath = (inviteCode: string) => {
  const normalized = normalizeInviteCode(inviteCode)
  if (!normalized) return MINI_PROGRAM_ENTRY_PAGE_PATH
  return `${MINI_PROGRAM_ENTRY_PAGE_PATH}?${ENTRY_QUERY_KEYS.type}=${LOGIN_INVITE_ENTRY_TYPE}&${ENTRY_QUERY_KEYS.inviteCode}=${encodeURIComponent(normalized)}`
}

export const buildInviteTimelineQuery = (inviteCode: string) => {
  const normalized = normalizeInviteCode(inviteCode)
  return normalized ? `${ENTRY_QUERY_KEYS.type}=${LOGIN_INVITE_ENTRY_TYPE}&${ENTRY_QUERY_KEYS.inviteCode}=${encodeURIComponent(normalized)}` : ''
}

export const buildInviteRedirectUrl = (inviteCode: string) => {
  const normalized = normalizeInviteCode(inviteCode)
  if (!normalized) return INVITE_REDIRECT_BASE_URL
  return `${INVITE_REDIRECT_BASE_URL}?${ENTRY_QUERY_KEYS.type}=${LOGIN_INVITE_ENTRY_TYPE}&${ENTRY_QUERY_KEYS.inviteCode}=${encodeURIComponent(normalized)}`
}

export const buildInviteQrValue = (inviteCode: string) => buildInviteRedirectUrl(inviteCode)
