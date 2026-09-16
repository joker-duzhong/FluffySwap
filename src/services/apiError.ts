export class ApiError extends Error {
  constructor(message: string, public status = 0, public retryAfter = 0) {
    super(message)
    this.name = 'ApiError'
  }
}

export const errorMessage = (error: unknown, fallback = '请求失败，请重试') =>
  error instanceof Error ? error.message : fallback

export const retryAfterSeconds = (value: unknown): number => {
  if (typeof value !== 'string' && typeof value !== 'number') return 0
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, Math.ceil(seconds))
  const date = Date.parse(String(value))
  return Number.isFinite(date) ? Math.max(0, Math.ceil((date - Date.now()) / 1000)) : 0
}
