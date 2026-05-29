export const MINI_PROGRAM_ENTRY_PAGE_PATH = '/pages/index/index'
export const LOGIN_INVITE_ENTRY_TYPE = 'login_invite'

export const ENTRY_QUERY_KEYS = {
  type: 'type',
  webHref: 'web_href',
  inviteCode: 'invite_code',
} as const

const toPlainString = (value: unknown) => {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''
  return String(value)
}

export const decodeEntryQueryPart = (value: string) => {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '))
  } catch {
    return value
  }
}

export const readEntryQueryValue = (query: Record<string, unknown> | null | undefined, key: string) => {
  if (!query) return ''

  for (const [rawKey, rawValue] of Object.entries(query)) {
    if (decodeEntryQueryPart(rawKey) === key) {
      return decodeEntryQueryPart(toPlainString(rawValue).trim())
    }
  }

  return ''
}
