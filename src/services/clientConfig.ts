import { STORAGE_KEYS } from '@/config'
import { client } from './uniClient'

export const configureClient = () => {
  client.setConfig({
    baseUrl: import.meta.env.DEV
      ? 'http://localhost:8000/api/v1'
      : 'https://api.lxyy.fun/api/v1',
  })

  client.interceptors.request.use((config) => {
    const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.statusCode || error.response?.status
      if (status === 401) {
        uni.removeStorageSync(STORAGE_KEYS.TOKEN)
        uni.removeStorageSync(STORAGE_KEYS.USER_INFO)
        uni.showToast({ title: '登录已过期', icon: 'none' })
        uni.navigateTo({ url: '/pages/login/login' })
      }
      return Promise.reject(error)
    }
  )
}
