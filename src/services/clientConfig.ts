import { API_CONFIG } from "@/config";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "./apiError";
import { client } from "./uniClient";

const isPublicAuth = (url: string) => url.startsWith('/auth/identity/') || url === '/auth/sms/send' || url === '/auth/refresh';

export const configureClient = () => {
  client.setConfig({
    baseUrl: API_CONFIG.BASE_URL,
  });

  client.interceptors.request.use((config) => {
    const auth = useAuthStore();
    config.sessionEpoch = auth.sessionEpoch;
    config.headers = { ...config.headers };
    delete config.headers.Authorization;
    if (!isPublicAuth(config.url) && auth.authenticated && auth.token) config.headers.Authorization = `Bearer ${auth.token}`;
    return config;
  });

  client.interceptors.response.use(
    (response, config) => {
      if ((isPublicAuth(config.url) || config.headers?.Authorization) && config.sessionEpoch !== useAuthStore().sessionEpoch) throw new ApiError('登录状态已变化，请重试', 499);
      return response;
    },
    async (error, config) => {
      const auth = useAuthStore();
      if (config.sessionEpoch !== auth.sessionEpoch) throw new ApiError('登录状态已变化，请重试', 499);
      if (error.status !== 401 || isPublicAuth(config.url)) throw error;
      if (!config.retried && auth.authenticated && auth.refreshToken) {
        try {
          // 同时过期的请求共享刷新，迟到的 401 使用已经轮换的新凭据。
          if (config.headers?.Authorization === `Bearer ${auth.token}`) await auth.refreshSession();
          if (config.sessionEpoch !== auth.sessionEpoch) throw new ApiError('登录状态已变化', 499);
        } catch (refreshError) {
          if (config.sessionEpoch !== auth.sessionEpoch) throw refreshError;
          auth.clearAuth(true);
          uni.$emit('auth:login-required');
          throw refreshError;
        }
        return client.request({ ...config, retried: true });
      }
      auth.clearAuth(true);
      uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
      uni.$emit('auth:login-required');
      throw error;
    },
  );
};
