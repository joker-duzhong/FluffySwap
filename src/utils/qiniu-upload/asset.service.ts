/** 七牛云资源服务 - 独立可配置，无项目依赖 */
import type { AssetInfo, AssetToken } from "./types";
import { getQiniuConfig } from "./config";

type RequestMethod = "GET" | "POST";

async function request<T>(url: string, data: Record<string, unknown>, method: RequestMethod = "POST"): Promise<{ data: T }> {
  const fullUrl = url.startsWith("http") ? url : `${getQiniuConfig().apiBaseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;

  // uni-app 环境
  if (typeof uni !== "undefined" && uni.request) {
    const res = await new Promise<UniApp.RequestSuccessCallbackResult>((resolve, reject) => {
      uni.request({
        url: fullUrl,
        method,
        data: method === "GET" ? undefined : data,
        header: { "Content-Type": "application/json" },
        success: resolve,
        fail: reject,
      });
    });
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const body = res.data as { data?: T };
      return { data: (body?.data ?? body) as T };
    }
    throw new Error((res.data as { message?: string })?.message || "Request failed");
  }

  // 浏览器 fetch
  const res = await fetch(fullUrl, {
    method,
    headers: { "Content-Type": "application/json" },
    body: method === "GET" ? undefined : JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || "Request failed");
  return { data: json?.data ?? json };
}

export class AssetService {
  /** 获取上传所需配置 */
  async getConfig(): Promise<void> {
    const cfg = getQiniuConfig();
    const path = cfg.getConfigPath || "asset/config";
    const url = `${cfg.apiBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;

    try {
      const res = await request<AssetToken>(url, {}, "GET");
      const key = cfg.storageKey || "assetToken";
      if (typeof uni !== "undefined" && uni.setStorageSync) {
        uni.setStorageSync(key, res.data);
      } else if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, JSON.stringify(res.data));
      }
    } catch {
      // 静默失败，可重试
    }
  }

  /** 保存七牛云文件到数据库 */
  async add(
    name: string,
    format: string,
    size: number,
    owner: string,
    url_id: string,
    thumbnail?: string,
    remark?: string
  ): Promise<AssetInfo> {
    const cfg = getQiniuConfig();
    const path = cfg.addAssetPath || "asset/add";
    const url = `${cfg.apiBaseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
    const data = { name, format, size, owner, url: url_id, thumbnail, remark };
    const res = await request<AssetInfo>(url, data);
    return res.data;
  }

  /** 从 storage 读取 token（用于上传） */
  getAssetToken(): AssetToken | null {
    const cfg = getQiniuConfig();
    const key = cfg.storageKey || "assetToken";
    try {
      if (typeof uni !== "undefined" && uni.getStorageSync) {
        const v = uni.getStorageSync(key);
        return v ? (typeof v === "string" ? JSON.parse(v) : v) : null;
      }
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(key) : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

export const assetService = new AssetService();
