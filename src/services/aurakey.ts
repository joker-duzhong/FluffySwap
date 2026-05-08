import { client } from './uniClient'

export interface ApiEnvelope<T> {
  code?: number
  message?: string
  data?: T
}

export interface PaginatedData<T> {
  items: T[]
  total?: number
  page?: number
  pageSize?: number
  page_size?: number
  pages?: number
}

export interface GalleryCategory {
  id: string
  name: string
  sort?: number
}

export interface AuthorInfo {
  user_id?: string
  nickname?: string | null
  avatar?: string | null
}

export interface GalleryItem {
  id: string
  thumb_url: string
  aspect_ratio: string
  author: AuthorInfo
  like_count: number
  is_liked: boolean
  view_count: number
}

export interface GalleryDetail extends GalleryItem {
  image_url: string
  prompt: string
  model_name: string
}

export interface TaskHistoryItem {
  task_id: string
  image_url: string | null
  prompt: string
  status: 'pending' | 'processing' | 'success' | 'failed' | string
  cost: number
  model_name?: string
  aspect_ratio?: string
  created_at?: string
}

export interface TaskModelOption {
  model_id: string
  name: string
  cost: number
  is_vip_only?: boolean
  status?: string
}

export interface TaskOptions {
  models: TaskModelOption[]
  aspect_ratios: string[]
}

export interface TaskGeneratePayload {
  prompt: string
  model_name: string
  aspect_ratio: string
}

export interface TaskGenerateResponse {
  task_id: string
  frozen_points?: number
  balance_after: number
}

export interface TaskStatusResponse {
  task_id: string
  status: 'pending' | 'processing' | 'success' | 'failed' | string
  progress: number
  image_url?: string | null
  failed_reason?: string | null
}

export interface UserProfile {
  user_id: string
  nickname?: string | null
  avatar?: string | null
  phone?: string | null
  openid?: string | null
  balance: number
  is_vip: boolean
  type: string
  vip_expire_time?: number | null
}

export interface InviteInfo {
  invite_code: string
  invited_count: number
  total_reward_points: number
  rule_text: string
}

export interface BindInviteResponse {
  is_success: boolean
  reward_points: number
}

export interface ProductItem {
  id: string
  type: 'point_pack' | 'vip' | string
  name: string
  price: number
  original_price?: number | null
  point_amount: number
  bonus_amount: number
  tag?: string | null
}

export interface OrderCreateResponse {
  order_no: string
  pay_params: Record<string, any>
}

export interface OrderStatusResponse {
  status: string
}

export interface AssetLogItem {
  id: string
  type: number | string
  amount: number
  balance_after: number
  description: string
  created_at?: string
  createdAt?: string
}

export interface SignInResponse {
  reward_points: number
  continuous_days?: number
}

const ensureOk = <T>(payload: unknown, fallbackMessage: string): T => {
  const envelope = payload as ApiEnvelope<T>
  if (typeof envelope?.code === 'number' && envelope.code !== 200) {
    throw new Error(envelope.message || fallbackMessage)
  }
  if (envelope && Object.prototype.hasOwnProperty.call(envelope, 'data')) {
    return envelope.data as T
  }
  return payload as T
}

const normalizeList = <T>(payload: unknown): PaginatedData<T> => {
  const data = ensureOk<any>(payload, '加载失败')
  if (Array.isArray(data)) {
    return { items: data }
  }
  if (Array.isArray(data?.items)) {
    return data as PaginatedData<T>
  }
  if (Array.isArray(data?.data?.items)) {
    return data.data as PaginatedData<T>
  }
  return { items: [] }
}

const normalizeCategories = (payload: unknown): GalleryCategory[] => {
  const data = ensureOk<any>(payload, '加载分类失败')
  const rawItems = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
  return rawItems
    .map((item: any, index: number) => ({
      id: String(item.id ?? item.category_id ?? item.name ?? index),
      name: String(item.name ?? item.title ?? ''),
      sort: typeof item.sort === 'number' ? item.sort : index,
    }))
    .filter((item: GalleryCategory) => item.name)
    .sort((a: GalleryCategory, b: GalleryCategory) => (a.sort || 0) - (b.sort || 0))
}

export const aurakeyApi = {
  auth: {
    miniappLogin: async (appid: string, code: string) => {
      const res = await client.POST('/auth/miniapp/login', { body: { appid, code } })
      return ensureOk<{ access_token: string }>(res.data, '登录失败')
    },
    getCurrentUser: async () => {
      const res = await client.GET('/auth/me')
      return ensureOk<UserProfile>(res.data, '加载用户失败')
    },
  },

  categories: {
    list: async () => {
      const res = await client.GET('/aurakey/gallery/categories')
      return normalizeCategories(res.data)
    },
  },

  gallery: {
    list: async (page: number, pageSize: number) => {
      const res = await client.GET('/aurakey/gallery/list', {
        params: { query: { page, pageSize } },
      })
      return normalizeList<GalleryItem>(res.data)
    },
    detail: async (id: string) => {
      const res = await client.GET('/aurakey/gallery/{id}', {
        params: { path: { id } },
      })
      return ensureOk<GalleryDetail>(res.data, '加载详情失败')
    },
    like: async (id: string) => {
      const res = await client.POST('/aurakey/gallery/{id}/like', {
        params: { path: { id } },
      })
      return ensureOk<{ is_liked: boolean; like_count: number }>(res.data, '操作失败')
    },
  },

  task: {
    options: async () => {
      const res = await client.GET('/aurakey/task/options')
      return ensureOk<TaskOptions>(res.data, '加载模型失败')
    },
    generate: async (payload: TaskGeneratePayload) => {
      const res = await client.POST('/aurakey/task/generate', { body: payload })
      return ensureOk<TaskGenerateResponse>(res.data, '提交任务失败')
    },
    status: async (taskId: string) => {
      const res = await client.GET('/aurakey/task/status/{task_id}', {
        params: { path: { task_id: taskId } },
      })
      return ensureOk<TaskStatusResponse>(res.data, '查询任务失败')
    },
  },

  user: {
    profile: async () => {
      const res = await client.GET('/aurakey/user/profile')
      return ensureOk<UserProfile>(res.data, '加载用户失败')
    },
    history: async (page: number, pageSize: number) => {
      const res = await client.GET('/aurakey/user/history', {
        params: { query: { page, pageSize } },
      })
      return normalizeList<TaskHistoryItem>(res.data)
    },
    deleteHistory: async (taskId: string) => {
      const res = await client.DELETE('/aurakey/user/history/{task_id}', {
        params: { path: { task_id: taskId } },
      })
      return ensureOk<unknown>(res.data, '删除失败')
    },
    publishHistory: async (taskId: string) => {
      const res = await client.POST('/aurakey/user/history/{task_id}/publish', {
        params: { path: { task_id: taskId } },
      })
      return ensureOk<unknown>(res.data, '发布失败')
    },
    signIn: async () => {
      const res = await client.POST('/aurakey/user/sign-in')
      return ensureOk<SignInResponse>(res.data, '签到失败')
    },
    inviteInfo: async () => {
      const res = await client.GET('/aurakey/user/invite-info')
      return ensureOk<InviteInfo>(res.data, '加载邀请信息失败')
    },
    bindInvite: async (inviteCode: string) => {
      const res = await client.POST('/aurakey/user/bind-invite', {
        body: { invite_code: inviteCode },
      })
      return ensureOk<BindInviteResponse>(res.data, '绑定失败')
    },
  },

  store: {
    products: async () => {
      const res = await client.GET('/aurakey/products')
      const data = ensureOk<ProductItem[] | { items: ProductItem[] }>(res.data, '加载商品失败')
      return Array.isArray(data) ? data : data.items || []
    },
  },

  order: {
    create: async (productId: string, openid: string) => {
      const res = await client.POST('/aurakey/order/create', {
        body: { product_id: productId, openid },
      })
      return ensureOk<OrderCreateResponse>(res.data, '创建订单失败')
    },
    status: async (orderNo: string) => {
      const res = await client.GET('/aurakey/order/status/{order_no}', {
        params: { path: { order_no: orderNo } },
      })
      return ensureOk<OrderStatusResponse>(res.data, '查询订单失败')
    },
  },

  asset: {
    logs: async (page: number, pageSize: number) => {
      const res = await client.GET('/aurakey/asset/logs', {
        params: { query: { page, pageSize } },
      })
      return normalizeList<AssetLogItem>(res.data)
    },
  },
}
