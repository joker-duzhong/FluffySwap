import { client } from "./uniClient";
import type { AurakeySystemConfig } from "@/config";

export interface ApiEnvelope<T> {
  code?: number;
  message?: string;
  data?: T;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  page_size?: number;
  pages?: number;
}

export interface GalleryCategory {
  id: string;
  name: string;
  sort?: number;
}

export interface AuthorInfo {
  user_id?: string;
  nickname?: string | null;
  avatar?: string | null;
}

export interface GalleryItem {
  id: string;
  thumb_url: string;
  aspect_ratio: string;
  author: AuthorInfo;
  like_count: number;
  is_liked: boolean;
  view_count: number;
  prompt: string;
}

export interface GalleryDetail extends GalleryItem {
  image_url: string;
  prompt: string;
  model_name: string;
}

export interface TaskHistoryItem {
  task_id: string;
  image_url: string | null;
  prompt: string;
  status: "pending" | "processing" | "success" | "failed" | string;
  progress?: number | null;
  failed_reason?: string | null;
  cost: number;
  model_name?: string;
  aspect_ratio?: string;
  created_at?: string;
}

export interface TaskModelOption {
  model_id: string;
  name: string;
  cost: number;
  is_vip_only?: boolean;
  status?: string;
}

export interface TaskOptions {
  models: TaskModelOption[];
  aspect_ratios: string[];
}

export interface TaskGeneratePayload {
  prompt: string;
  model_name: string;
  aspect_ratio: string;
  is_public: boolean;
}

export interface TaskGenerateResponse {
  task_id: string;
  frozen_points?: number;
  balance_after: number;
}

export interface TaskStatusResponse {
  task_id: string;
  status: "pending" | "processing" | "success" | "failed" | string;
  progress: number;
  image_url?: string | null;
  failed_reason?: string | null;
}

export interface UserProfile {
  user_id: string;
  nickname?: string | null;
  avatar?: string | null;
  phone?: string | null;
  openid?: string | null;
  balance: number;
  is_vip: boolean;
  type: string;
  vip_expire_time?: number | null;
}

export interface UserUpdatePayload {
  nickname?: string | null;
  avatar?: string | null;
}

export interface UploadTokenResponse {
  token: string;
  domain: string;
}

export interface ConfirmUploadPayload {
  name: string;
  url: string;
  thumb_url?: string | null;
  size: number;
  type: string;
  hash: string;
}

export interface ResourceResponse {
  id: string;
  name: string;
  url: string;
  thumb_url?: string | null;
  size: number;
  type: string;
  hash: string;
}

export interface InviteInfo {
  invite_code: string;
  invited_count: number;
  total_reward_points: number;
  rule_text: string;
}

export interface BindInviteResponse {
  is_success: boolean;
  reward_points: number;
}

export interface ProductItem {
  id: string;
  type: "point_pack" | "vip" | string;
  name: string;
  price: number;
  original_price?: number | null;
  point_amount: number;
  bonus_amount: number;
  tag?: string | null;
  vip_type?: string | null;
  vip_level?: number;
  valid_days?: number | null;
}

export interface ProductsResponse {
  items: ProductItem[];
  openid?: string | null;
}

export interface OrderCreateResponse {
  order_no: string;
  pay_params: Record<string, any>;
}

export interface OrderStatusResponse {
  status: string;
}

export interface AssetLogItem {
  id: string;
  type: number | string;
  amount: number;
  balance_after: number;
  description: string;
  created_at?: string;
  createdAt?: string;
}

export interface SignInResponse {
  reward_points: number;
  continuous_days?: number;
}

export interface UserEntitlement {
  vip_expire_time?: number | null;
  remaining_points: number;
  is_vip: boolean;
  vip_type?: string;
  vip_level?: number;
}

export interface PurchaseOrderItem {
  order_no: string;
  status: string;
  amount: number;
  pay_method: string;
  product_id: string;
  product_name: string;
  product_type: string;
  point_amount?: number;
  bonus_amount?: number;
  granted_points?: number;
  remaining_points?: number;
  vip_type?: string | null;
  vip_level?: number;
  valid_days?: number | null;
  entitlement_start_at?: number | null;
  entitlement_expire_at?: number | null;
  created_at: number;
  paid_at?: number | null;
  is_effective?: boolean;
}

export type AurakeySystemConfigUpdate = Partial<AurakeySystemConfig>;

const ensureOk = <T>(payload: unknown, fallbackMessage: string): T => {
  const envelope = payload as ApiEnvelope<T>;
  if (typeof envelope?.code === "number" && envelope.code !== 200) {
    throw new Error(envelope.message || fallbackMessage);
  }
  if (envelope && Object.prototype.hasOwnProperty.call(envelope, "data")) {
    return envelope.data as T;
  }
  return payload as T;
};

const normalizeList = <T>(payload: unknown): PaginatedData<T> => {
  const data = ensureOk<any>(payload, "加载失败");
  if (Array.isArray(data)) {
    return { items: data };
  }
  if (Array.isArray(data?.items)) {
    return data as PaginatedData<T>;
  }
  if (Array.isArray(data?.data?.items)) {
    return data.data as PaginatedData<T>;
  }
  return { items: [] };
};

const normalizeCategories = (payload: unknown): GalleryCategory[] => {
  const data = ensureOk<any>(payload, "加载分类失败");
  const rawItems = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
  return rawItems
    .map((item: any, index: number) => ({
      id: String(item.id ?? item.category_id ?? item.name ?? index),
      name: String(item.name ?? item.title ?? ""),
      sort: typeof item.sort === "number" ? item.sort : index,
    }))
    .filter((item: GalleryCategory) => item.name)
    .sort((a: GalleryCategory, b: GalleryCategory) => (a.sort || 0) - (b.sort || 0));
};

export const aurakeyApi = {
  system: {
    config: async () => {
      const res = await client.GET("/aurakey/system/config");
      return ensureOk<AurakeySystemConfig>(res.data, "加载系统配置失败");
    },
  },

  auth: {
    miniappLogin: async (appid: string, code: string) => {
      const res = await client.POST("/auth/miniapp/login", { body: { appid, code } });
      return ensureOk<TokenResponse>(res.data, "登录失败");
    },
    bindMiniappPhone: async (appid: string, code: string) => {
      const res = await client.POST("/auth/miniapp/phone", { body: { appid, code } });
      return ensureOk<UserProfile>(res.data, "绑定手机号失败");
    },
    bindPhone: async (phone: string, code: string) => {
      const res = await client.POST("/auth/phone/bind", { body: { phone, code } });
      return ensureOk<UserProfile>(res.data, "绑定手机号失败");
    },
    updateMe: async (payload: UserUpdatePayload) => {
      const res = await client.PUT("/auth/me", { body: payload });
      return ensureOk<UserProfile>(res.data, "更新资料失败");
    },
    getCurrentUser: async () => {
      const res = await client.GET("/auth/me");
      return ensureOk<UserProfile>(res.data, "加载用户失败");
    },
    ensureSession: async (appid: string, code: string) => {
      const tokenRes = await aurakeyApi.auth.miniappLogin(appid, code);
      const profile = await aurakeyApi.user.profile();
      return { token: tokenRes, profile };
    },
  },

  categories: {
    list: async () => {
      const res = await client.GET("/aurakey/gallery/categories");
      return normalizeCategories(res.data);
    },
  },

  gallery: {
    list: async (page: number, pageSize: number) => {
      const res = await client.GET("/aurakey/gallery/list", {
        params: { query: { page, pageSize } },
      });
      return normalizeList<GalleryItem>(res.data);
    },
    detail: async (id: string) => {
      const res = await client.GET("/aurakey/gallery/{id}", {
        params: { path: { id } },
      });
      return ensureOk<GalleryDetail>(res.data, "加载详情失败");
    },
    like: async (id: string) => {
      const res = await client.POST("/aurakey/gallery/{id}/like", {
        params: { path: { id } },
      });
      return ensureOk<{ is_liked: boolean; like_count: number }>(res.data, "操作失败");
    },
  },

  task: {
    options: async () => {
      const res = await client.GET("/aurakey/task/options");
      return ensureOk<TaskOptions>(res.data, "加载模型失败");
    },
    generate: async (payload: TaskGeneratePayload) => {
      const res = await client.POST("/aurakey/task/generate-stream", { body: payload });
      return ensureOk<TaskGenerateResponse>(res.data, "提交任务失败");
    },
    status: async (taskId: string) => {
      const res = await client.GET("/aurakey/task/status/{task_id}", {
        params: { path: { task_id: taskId } },
      });
      return ensureOk<TaskStatusResponse>(res.data, "查询任务失败");
    },
  },

  user: {
    profile: async () => {
      const res = await client.GET("/aurakey/user/profile");
      return ensureOk<UserProfile>(res.data, "加载用户失败");
    },
    entitlement: async () => {
      const res = await client.GET("/aurakey/user/entitlement");
      return ensureOk<UserEntitlement>(res.data, "加载权益失败");
    },
    history: async (page: number, pageSize: number) => {
      const res = await client.GET("/aurakey/user/history", {
        params: { query: { page, pageSize } },
      });
      return normalizeList<TaskHistoryItem>(res.data);
    },
    deleteHistory: async (taskId: string) => {
      const res = await client.DELETE("/aurakey/user/history/{task_id}", {
        params: { path: { task_id: taskId } },
      });
      return ensureOk<unknown>(res.data, "删除失败");
    },
    publishHistory: async (taskId: string) => {
      const res = await client.POST("/aurakey/user/history/{task_id}/publish", {
        params: { path: { task_id: taskId } },
      });
      return ensureOk<unknown>(res.data, "发布失败");
    },
    signIn: async () => {
      const res = await client.POST("/aurakey/user/sign-in");
      return ensureOk<SignInResponse>(res.data, "签到失败");
    },
    inviteInfo: async () => {
      const res = await client.GET("/aurakey/user/invite-info");
      return ensureOk<InviteInfo>(res.data, "加载邀请信息失败");
    },
    bindInvite: async (inviteCode: string) => {
      const res = await client.POST("/aurakey/user/bind-invite", {
        body: { invite_code: inviteCode },
      });
      return ensureOk<BindInviteResponse>(res.data, "绑定失败");
    },
  },

  store: {
    products: async () => {
      const res = await client.GET("/aurakey/products");
      const data = ensureOk<ProductItem[] | ProductsResponse>(res.data, "加载商品失败");
      return Array.isArray(data) ? { items: data, openid: null } : { items: data.items || [], openid: data.openid || null };
    },
  },

  order: {
    create: async (productId: string, openid: string) => {
      const res = await client.POST("/aurakey/order/create", {
        body: { product_id: productId, openid },
      });
      return ensureOk<OrderCreateResponse>(res.data, "创建订单失败");
    },
    status: async (orderNo: string) => {
      const res = await client.GET("/aurakey/order/status/{order_no}", {
        params: { path: { order_no: orderNo } },
      });
      return ensureOk<OrderStatusResponse>(res.data, "查询订单失败");
    },
    list: async (page: number, pageSize: number) => {
      const res = await client.GET("/aurakey/orders", {
        params: { query: { page, pageSize } },
      });
      return normalizeList<PurchaseOrderItem>(res.data);
    },
  },

  asset: {
    logs: async (page: number, pageSize: number) => {
      const res = await client.GET("/aurakey/asset/logs", {
        params: { query: { page, pageSize } },
      });
      return normalizeList<AssetLogItem>(res.data);
    },
  },

  storage: {
    uploadToken: async () => {
      const res = await client.GET("/storage/upload-token");
      return ensureOk<UploadTokenResponse>(res.data, "获取上传凭证失败");
    },
    confirmUpload: async (payload: ConfirmUploadPayload, appKey = "aurakey") => {
      const res = await client.POST("/storage/confirm-upload", {
        body: payload,
        headers: { app: appKey },
      });
      return ensureOk<ResourceResponse>(res.data, "确认上传失败");
    },
  },

  admin: {
    systemConfig: {
      get: async () => {
        const res = await client.GET("/aurakey/admin/system/config");
        return ensureOk<AurakeySystemConfig>(res.data, "加载系统配置失败");
      },
      update: async (payload: AurakeySystemConfigUpdate) => {
        const res = await client.PUT("/aurakey/admin/system/config", { body: payload });
        return ensureOk<AurakeySystemConfig>(res.data, "保存系统配置失败");
      },
    },
  },
};
