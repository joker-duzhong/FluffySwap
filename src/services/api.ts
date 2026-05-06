/**
 * API 服务封装层
 * 基于生成的 SDK 客户端进行二次封装
 */

import { client } from './uniClient'
import { STORAGE_KEYS } from '@/config'

// 配置客户端
export const configureClient = () => {
  // 设置 baseURL
  client.setConfig({
    baseUrl: import.meta.env.DEV
      ? 'http://localhost:8000/api/v1'
      : 'https://api.lxyy.fun/api/v1',
  })

  // 请求拦截器：添加 token
  client.interceptors.request.use((config) => {
    const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // 响应拦截器：处理错误
  client.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      // 401 未授权，清除 token 并跳转登录
      if (error.response?.status === 401) {
        uni.removeStorageSync(STORAGE_KEYS.TOKEN)
        uni.removeStorageSync(STORAGE_KEYS.USER_INFO)
        uni.showToast({ title: '登录已过期', icon: 'none' })
        uni.navigateTo({ url: '/pages/login/login' })
      }
      return Promise.reject(error)
    }
  )
}

// 导出客户端
export { client }

// 导出常用的 API 方法（可选，方便使用）
export const api = {
  // 认证相关
  auth: {
    miniappLogin: (appid: string, code: string) =>
      client.POST('/auth/miniapp/login', {
        body: { appid, code },
      }),
    miniappGetPhone: (appid: string, code: string) =>
      client.POST('/auth/miniapp/phone', {
        body: { appid, code },
      }),
    getCurrentUser: () => client.GET('/auth/me'),
  },

  // 画廊相关
  gallery: {
    getList: (page: number, pageSize: number) =>
      client.GET('/aurakey/gallery/list', {
        params: { query: { page, pageSize } },
      }),
    getDetail: (id: string) =>
      client.GET('/aurakey/gallery/{id}', {
        params: { path: { id } },
      }),
    like: (id: string) =>
      client.POST('/aurakey/gallery/{id}/like', {
        params: { path: { id } },
      }),
  },

  // 任务相关
  task: {
    getOptions: () => client.GET('/aurakey/task/options'),
    generate: (prompt: string, modelName: string, aspectRatio: string) =>
      client.POST('/aurakey/task/generate', {
        body: { prompt, model_name: modelName, aspect_ratio: aspectRatio },
      }),
    getStatus: (taskId: string) =>
      client.GET('/aurakey/task/status/{task_id}', {
        params: { path: { task_id: taskId } },
      }),
  },

  // 用户相关
  user: {
    getProfile: () => client.GET('/aurakey/user/profile'),
    getHistory: (page: number, pageSize: number) =>
      client.GET('/aurakey/user/history', {
        params: { query: { page, pageSize } },
      }),
    deleteHistory: (taskId: string) =>
      client.DELETE('/aurakey/user/history/{task_id}', {
        params: { path: { task_id: taskId } },
      }),
    publishToGallery: (taskId: string) =>
      client.POST('/aurakey/user/history/{task_id}/publish', {
        params: { path: { task_id: taskId } },
      }),
    signIn: () => client.POST('/aurakey/user/sign-in'),
    getInviteInfo: () => client.GET('/aurakey/user/invite-info'),
    bindInvite: (inviteCode: string) =>
      client.POST('/aurakey/user/bind-invite', {
        body: { invite_code: inviteCode },
      }),
  },

  // 商品相关
  store: {
    getProducts: () => client.GET('/aurakey/store/products'),
  },

  // 订单相关
  order: {
    create: (productId: string, openid: string) =>
      client.POST('/aurakey/order/create', {
        body: { product_id: productId, openid },
      }),
    getStatus: (orderNo: string) =>
      client.GET('/aurakey/order/status/{order_no}', {
        params: { path: { order_no: orderNo } },
      }),
  },

  // 资产相关
  asset: {
    getLogs: (page: number, pageSize: number) =>
      client.GET('/aurakey/asset/logs', {
        params: { query: { page, pageSize } },
      }),
  },
}
