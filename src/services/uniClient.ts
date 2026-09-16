/**
 * uni-app 适配的 HTTP 客户端
 * 用于替代生成的 SDK 客户端，适配微信小程序环境
 */

import { ApiError, retryAfterSeconds } from './apiError'

export interface RequestConfig {
  retried?: boolean
  sessionEpoch?: number
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD'
  data?: any
  params?: Record<string, any>
  headers?: Record<string, string>
}

interface Response<T = any> {
  data?: T
  error?: any
  response?: any
}

type ClientConfig = {
  baseUrl?: string
  headers?: Record<string, string>
}

class UniClient {
  private baseUrl: string = ''
  private defaultHeaders: Record<string, string> = {}
  private requestInterceptor?: (config: RequestConfig) => RequestConfig
  private responseInterceptor?: {
    onFulfilled?: (response: any, config: RequestConfig) => any
    onRejected?: (error: ApiError, config: RequestConfig) => any
  }

  setConfig(config: ClientConfig) {
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl
    }
    if (config.headers) {
      this.defaultHeaders = { ...this.defaultHeaders, ...config.headers }
    }
  }

  interceptors = {
    request: {
      use: (interceptor: (config: RequestConfig) => RequestConfig) => {
        this.requestInterceptor = interceptor
      },
    },
    response: {
      use: (
        onFulfilled?: (response: any, config: RequestConfig) => any,
        onRejected?: (error: ApiError, config: RequestConfig) => any
      ) => {
        this.responseInterceptor = { onFulfilled, onRejected }
      },
    },
  }

  private buildUrl(url: string, params?: Record<string, any>): string {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`
    if (!params || Object.keys(params).length === 0) {
      return fullUrl
    }
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&')
    return `${fullUrl}?${queryString}`
  }

  async request<T = any>(config: RequestConfig): Promise<Response<T>> {
    if (this.requestInterceptor) config = this.requestInterceptor(config)
    const url = this.buildUrl(config.url, config.params)
    const headers = { ...this.defaultHeaders, ...config.headers }
    try {
      const res = await new Promise<UniApp.RequestSuccessCallbackResult>((resolve, reject) => {
        uni.request({
          url,
          method: config.method || 'GET',
          data: config.data,
          header: headers,
          timeout: 60000,
          success: resolve,
          fail: () => reject(new ApiError('网络连接失败，请检查网络后重试')),
        })
      })
      const payload = res.data as { code?: number; message?: string; detail?: unknown } | null
      const status = res.statusCode >= 400 ? res.statusCode : payload?.code
      if (typeof status === 'number' && status !== 200 && status !== 201 && status !== 204) {
        const retryHeader = Object.entries(res.header || {}).find(([key]) => key.toLowerCase() === 'retry-after')?.[1]
        throw new ApiError(payload?.message || (typeof payload?.detail === 'string' ? payload.detail : '请求失败，请重试'), status, retryAfterSeconds(retryHeader))
      }
      const response = { data: res.data as T, response: res }
      return this.responseInterceptor?.onFulfilled
        ? await this.responseInterceptor.onFulfilled(response, config)
        : response
    } catch (error) {
      const normalized = error instanceof ApiError ? error : new ApiError('请求失败，请重试')
      if (this.responseInterceptor?.onRejected) return await this.responseInterceptor.onRejected(normalized, config)
      throw normalized
    }
  }

  async GET<T = any>(url: string, options?: { params?: { query?: Record<string, any>; path?: Record<string, any> }; headers?: Record<string, string> }): Promise<Response<T>> {
    // 处理路径参数
    let finalUrl = url
    if (options?.params?.path) {
      Object.entries(options.params.path).forEach(([key, value]) => {
        finalUrl = finalUrl.replace(`{${key}}`, String(value))
      })
    }

    return this.request<T>({
      url: finalUrl,
      method: 'GET',
      params: options?.params?.query,
      headers: options?.headers,
    })
  }

  async POST<T = any>(url: string, options?: { body?: any; params?: { path?: Record<string, any> }; headers?: Record<string, string> }): Promise<Response<T>> {
    // 处理路径参数
    let finalUrl = url
    if (options?.params?.path) {
      Object.entries(options.params.path).forEach(([key, value]) => {
        finalUrl = finalUrl.replace(`{${key}}`, String(value))
      })
    }

    return this.request<T>({
      url: finalUrl,
      method: 'POST',
      data: options?.body,
      headers: options?.headers,
    })
  }

  async PUT<T = any>(url: string, options?: { body?: any; params?: { path?: Record<string, any> }; headers?: Record<string, string> }): Promise<Response<T>> {
    // 处理路径参数
    let finalUrl = url
    if (options?.params?.path) {
      Object.entries(options.params.path).forEach(([key, value]) => {
        finalUrl = finalUrl.replace(`{${key}}`, String(value))
      })
    }

    return this.request<T>({
      url: finalUrl,
      method: 'PUT',
      data: options?.body,
      headers: options?.headers,
    })
  }

  async DELETE<T = any>(url: string, options?: { params?: { path?: Record<string, any> } }): Promise<Response<T>> {
    // 处理路径参数
    let finalUrl = url
    if (options?.params?.path) {
      Object.entries(options.params.path).forEach(([key, value]) => {
        finalUrl = finalUrl.replace(`{${key}}`, String(value))
      })
    }

    return this.request<T>({
      url: finalUrl,
      method: 'DELETE',
    })
  }
}

export const client = new UniClient()
