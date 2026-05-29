import { WECHAT_CONFIG } from '@/config'
import { useInviteStore } from '@/stores/inviteStore'
import {
  ENTRY_QUERY_KEYS,
  LOGIN_INVITE_ENTRY_TYPE,
  MINI_PROGRAM_ENTRY_PAGE_PATH,
  decodeEntryQueryPart,
  readEntryQueryValue,
} from '@/utils/miniProgramEntryShared'

const MINI_PROGRAM_ENTRY_PATH = MINI_PROGRAM_ENTRY_PAGE_PATH.replace(/^\//, '')

type MiniProgramEntryQuery = Record<string, unknown>

type LoginInviteEntryAction = {
  type: typeof LOGIN_INVITE_ENTRY_TYPE
  inviteCode: string
}

export type MiniProgramEntryAction = LoginInviteEntryAction

const toPlainString = (value: unknown) => {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''
  return String(value)
}

const parseQueryString = (queryString: string) => {
  const query: Record<string, string> = {}
  const normalized = queryString.replace(/^\?/, '')
  if (!normalized) return query

  normalized.split('&').forEach((part) => {
    if (!part) return
    const separatorIndex = part.indexOf('=')
    const rawKey = separatorIndex >= 0 ? part.slice(0, separatorIndex) : part
    const rawValue = separatorIndex >= 0 ? part.slice(separatorIndex + 1) : ''
    const key = decodeEntryQueryPart(rawKey)
    if (!key) return
    query[key] = decodeEntryQueryPart(rawValue)
  })

  return query
}

const extractQueryStringFromHref = (href: string) => {
  const normalizedHref = toPlainString(href).trim()
  const queryStart = normalizedHref.indexOf('?')
  if (queryStart < 0) return ''

  const hashStart = normalizedHref.indexOf('#', queryStart)
  return normalizedHref.slice(queryStart + 1, hashStart >= 0 ? hashStart : undefined)
}

const extractWebHrefFromRawQueryString = (queryString: string) => {
  const normalized = queryString.replace(/^\?/, '')
  const encodedKey = `${ENTRY_QUERY_KEYS.webHref}=`
  const keyStart = normalized.indexOf(encodedKey)
  if (keyStart < 0) return ''

  return decodeEntryQueryPart(normalized.slice(keyStart + encodedKey.length))
}

const getCurrentHref = () => {
  if (typeof window === 'undefined') return ''
  return window.location.href
}

export const getMiniProgramEnvVersion = () => {
  try {
    const envVersion = uni.getAccountInfoSync()?.miniProgram?.envVersion
    if (envVersion === 'develop' || envVersion === 'trial' || envVersion === 'release') {
      return envVersion
    }
  } catch {
    // ignore
  }

  return 'release'
}

export function buildMiniProgramRedirectUrl(href = getCurrentHref()): string {
  const queryStr = `${ENTRY_QUERY_KEYS.webHref}=${href}`
  const envVersion = getMiniProgramEnvVersion()

  return `weixin://dl/business/?appid=${WECHAT_CONFIG.APPID}&path=${MINI_PROGRAM_ENTRY_PATH}&query=${encodeURIComponent(queryStr)}&env_version=${envVersion}`
}

const resolveEntryActionFromQuery = (query?: MiniProgramEntryQuery | null): MiniProgramEntryAction | null => {
  const type = readEntryQueryValue(query, ENTRY_QUERY_KEYS.type)

  if (type === LOGIN_INVITE_ENTRY_TYPE) {
    const inviteCode = readEntryQueryValue(query, ENTRY_QUERY_KEYS.inviteCode)
    return inviteCode ? { type, inviteCode } : null
  }

  return null
}

export const parseMiniProgramEntryActionFromHref = (href?: unknown): MiniProgramEntryAction | null => {
  const rawHref = toPlainString(href).trim()
  if (!rawHref) return null

  const nestedWebHref = extractWebHrefFromRawQueryString(rawHref)
  if (nestedWebHref && nestedWebHref !== rawHref) {
    const nestedAction = parseMiniProgramEntryActionFromHref(nestedWebHref)
    if (nestedAction) return nestedAction
  }

  const queryString = extractQueryStringFromHref(rawHref) || rawHref
  if (!queryString) return null

  return resolveEntryActionFromQuery(parseQueryString(queryString))
}

export const parseMiniProgramEntryActionFromQuery = (query?: MiniProgramEntryQuery | null) => {
  const webHrefAction = parseMiniProgramEntryActionFromHref(readEntryQueryValue(query, ENTRY_QUERY_KEYS.webHref))
  if (webHrefAction) return webHrefAction

  return resolveEntryActionFromQuery(query)
}

export const parseMiniProgramEntryActionFromLaunchOptions = (
  options?: {
    query?: MiniProgramEntryQuery
  } | null,
) => parseMiniProgramEntryActionFromQuery(options?.query)

export const dispatchMiniProgramEntryAction = (action: MiniProgramEntryAction | null) => {
  if (!action) return false

  if (action.type === LOGIN_INVITE_ENTRY_TYPE) {
    return useInviteStore().receiveLoginInvite(action.inviteCode)
  }

  return false
}

export const handleMiniProgramEntryQuery = (query?: MiniProgramEntryQuery | null) => {
  return dispatchMiniProgramEntryAction(parseMiniProgramEntryActionFromQuery(query))
}

export const handleMiniProgramEntryLaunchOptions = (
  options?: {
    query?: MiniProgramEntryQuery
  } | null,
) => {
  return dispatchMiniProgramEntryAction(parseMiniProgramEntryActionFromLaunchOptions(options))
}
