const INVITE_QUERY_KEY = 'invite_code'
const INDEX_PAGE_PATH = '/pages/index/index'

const toPlainString = (value: unknown) => {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''
  return String(value)
}

export const normalizeInviteCode = (value: unknown) => {
  const normalized = toPlainString(value).trim()
  return normalized ? normalized.slice(0, 64) : ''
}

export const extractInviteCodeFromQuery = (query?: Record<string, unknown> | null) => {
  if (!query) return ''
  return normalizeInviteCode(query[INVITE_QUERY_KEY])
}

export const extractInviteCodeFromScene = (scene?: string | null) => {
  const rawScene = normalizeInviteCode(scene)
  if (!rawScene) return ''

  try {
    const decodedScene = decodeURIComponent(rawScene)
    const sceneParts = decodedScene.split('&')
    const invitePair = sceneParts.find((item) => item.startsWith(`${INVITE_QUERY_KEY}=`))
    if (invitePair) {
      return normalizeInviteCode(invitePair.slice(INVITE_QUERY_KEY.length + 1))
    }
    return normalizeInviteCode(decodedScene)
  } catch {
    return rawScene
  }
}

export const extractInviteCodeFromLaunchOptions = (
  options?: {
    query?: Record<string, unknown>
    scene?: string | number
  } | null,
) => {
  const inviteCodeFromQuery = extractInviteCodeFromQuery(options?.query)
  if (inviteCodeFromQuery) return inviteCodeFromQuery

  return extractInviteCodeFromScene(options?.query?.scene ? toPlainString(options.query.scene) : toPlainString(options?.scene))
}

export const buildInvitePagePath = (inviteCode: string) => {
  const normalized = normalizeInviteCode(inviteCode)
  if (!normalized) return INDEX_PAGE_PATH
  return `${INDEX_PAGE_PATH}?${INVITE_QUERY_KEY}=${encodeURIComponent(normalized)}`
}

export const buildInviteTimelineQuery = (inviteCode: string) => {
  const normalized = normalizeInviteCode(inviteCode)
  return normalized ? `${INVITE_QUERY_KEY}=${encodeURIComponent(normalized)}` : ''
}

export const buildInviteQrValue = (inviteCode: string) => buildInvitePagePath(inviteCode)
