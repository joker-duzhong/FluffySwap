/**
 * 认证服务层
 * 处理小程序登录、手机号绑定等认证相关业务
 */

import { http } from './base';

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserInfo {
  id: string;
  nickname?: string;
  avatar?: string;
  openid?: string;
  phone?: string;
  source: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MiniappLoginParams {
  appid: string;
  code: string;
}

export interface MiniappPhoneParams {
  appid: string;
  code: string;
}

class AuthService {
  /**
   * 小程序登录
   * @param params appid 和 wx.login() 获取的 code
   */
  async miniappLogin(params: MiniappLoginParams): Promise<Token> {
    return http.request<Token>({
      url: '/api/v1/auth/miniapp/login',
      method: 'POST',
      data: params,
    });
  }

  /**
   * 获取手机号
   * @param params appid 和 getPhoneNumber 返回的 code
   */
  async miniappGetPhone(params: MiniappPhoneParams): Promise<UserInfo> {
    return http.request<UserInfo>({
      url: '/api/v1/auth/miniapp/phone',
      method: 'POST',
      data: params,
      needAuth: true,
    });
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<UserInfo> {
    return http.request<UserInfo>({
      url: '/api/v1/auth/me',
      method: 'GET',
      needAuth: true,
    });
  }

  /**
   * 保存 token
   */
  saveToken(token: Token): void {
    http.saveToken(token.access_token);
  }

  /**
   * 清除 token
   */
  clearToken(): void {
    http.clearToken();
  }
}

export const authService = new AuthService();
