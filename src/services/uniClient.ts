/**
 * uni-app 适配的 HTTP 客户端
 * 用于替代生成的 SDK 客户端，适配微信小程序环境
 */

interface RequestConfig {
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

class UniClient {
  private baseUrl: string = ''
  private defaultHeaders: Record<string, string> = {}
  private requestInterceptor?: (config: RequestConfig) => RequestConfig
  private responseInterceptor?: {
    onFulfilled?: (response: any) => any
    onRejected?: (error: any) => any
  }

  setConfig(config: { baseUrl?: string; headers?: Record<string, string> }) {
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
        onFulfilled?: (response: any) => any,
        onRejected?: (error: any) => any
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

  private async request<T = any>(config: RequestConfig): Promise<Response<T>> {
    try {
      // 应用请求拦截器
      if (this.requestInterceptor) {
        config = this.requestInterceptor(config)
      }

      const url = this.buildUrl(config.url, config.params)
      const headers = { ...this.defaultHeaders, ...config.headers }

      return new Promise((resolve, reject) => {
        uni.request({
          url,
          method: config.method || 'GET',
          data: config.data,
          header: headers,
          timeout: 60000,
          success: (res) => {
            if (res.statusCode >= 400) {
              const error = {
                response: res,
                message: `HTTP ${res.statusCode}`,
              }
              if (this.responseInterceptor?.onRejected) {
                try {
                  reject(this.responseInterceptor.onRejected(error))
                } catch (interceptorError) {
                  reject(interceptorError)
                }
              } else {
                reject(error)
              }
              return
            }

            const response = {
              data: res.data as T,
              response: res,
            }

            // 应用响应拦截器
            if (this.responseInterceptor?.onFulfilled) {
              try {
                const interceptedResponse = this.responseInterceptor.onFulfilled(response)
                resolve(interceptedResponse as Response<T>)
              } catch (error) {
                if (this.responseInterceptor?.onRejected) {
                  this.responseInterceptor.onRejected(error)
                }
                reject(error)
              }
            } else {
              resolve(response)
            }
          },
          fail: (error) => {
            if (this.responseInterceptor?.onRejected) {
              const result = this.responseInterceptor.onRejected(error)
              reject(result)
            } else {
              reject(error)
            }
          },
        })
      })
    } catch (error) {
      return { error }
    }
  }

  async GET<T = any>(url: string, options?: { params?: { query?: Record<string, any>; path?: Record<string, any> } }): Promise<Response<T>> {
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
    })
  }

  async POST<T = any>(url: string, options?: { body?: any; params?: { path?: Record<string, any> } }): Promise<Response<T>> {
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
    })
  }

  async PUT<T = any>(url: string, options?: { body?: any; params?: { path?: Record<string, any> } }): Promise<Response<T>> {
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
