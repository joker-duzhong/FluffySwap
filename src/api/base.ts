/**
 * HTTP 请求基类
 * 统一处理请求配置、拦截器、错误处理
 */

const API_BASE_URL = 'https://api.lxyy.fun';

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: Record<string, string>;
  needAuth?: boolean;
}

class BaseRequest {
  private baseURL: string;
  private tokenKey = 'fluffySwap_token';

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    try {
      // @ts-ignore
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(this.tokenKey);
      }
      return uni.getStorageSync(this.tokenKey);
    } catch {
      return null;
    }
  }

  private setToken(token: string): void {
    try {
      // @ts-ignore
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.tokenKey, token);
      } else {
        uni.setStorageSync(this.tokenKey, token);
      }
    } catch (e) {
      console.error('Save token failed:', e);
    }
  }

  public clearToken(): void {
    try {
      // @ts-ignore
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.tokenKey);
      } else {
        uni.removeStorageSync(this.tokenKey);
      }
    } catch (e) {
      console.error('Clear token failed:', e);
    }
  }

  async request<T = any>(config: RequestConfig): Promise<T> {
    const { url, method = 'GET', data, header = {}, needAuth = false } = config;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...header,
    };

    if (needAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const res = await uni.request({
        url: `${this.baseURL}${url}`,
        method,
        data,
        header: headers,
      });

      if (res.statusCode === 401) {
        this.clearToken();
        uni.showToast({ title: '登录已过期', icon: 'none' });
        throw new Error('Unauthorized');
      }

      if (res.statusCode !== 200) {
        throw new Error(`HTTP ${res.statusCode}`);
      }

      const apiRes = res.data as ApiResponse<T>;

      if (apiRes.code !== 200) {
        throw new Error(apiRes.message || '请求失败');
      }

      return apiRes.data;
    } catch (error: any) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  saveToken(token: string): void {
    this.setToken(token);
  }
}

export const http = new BaseRequest(API_BASE_URL);
