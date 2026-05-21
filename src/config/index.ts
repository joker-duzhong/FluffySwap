/**
 * 应用配置文件
 * 统一管理所有配置项
 */

const LOCAL_API_BASE_URL = "http://localhost:8000/api/v1";
const PRODUCTION_API_BASE_URL = "https://api.lxyy.fun/api/v1";

const getApiBaseUrl = () => {
  // try {
  //   const accountInfo = uni.getAccountInfoSync();
  //   return accountInfo.miniProgram.envVersion === "develop" ? LOCAL_API_BASE_URL : PRODUCTION_API_BASE_URL;
  // } catch {
  //   return PRODUCTION_API_BASE_URL;
  // }

  return PRODUCTION_API_BASE_URL;
};

// API 配置
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000,
};

// 微信小程序配置
export const WECHAT_CONFIG = {
  APPID: "wxb26e7039ef603dca",
};

// 存储 key 配置
export const STORAGE_KEYS = {
  TOKEN: "aurakey_token",
  USER_INFO: "aurakey_user_info",
  LAST_PROMPT: "aurakey_last_prompt",
};

export interface AurakeySystemCustomConfig extends Record<string, unknown> {
  miniapp_check_version?: string;
  recharge_tag?: string;
  recharge_subtitle?: string;
  invite_poster_bg?: string;
  miniapp_share_cover?: string;
}

export interface AurakeySystemConfig {
  register_reward_points: number;
  daily_sign_in_reward_points: number;
  invite_reward_points: number;
  default_vip_valid_days: number;
  default_point_pack_valid_days: number | null;
  daily_free_points_reset_hour: number;
  custom: AurakeySystemCustomConfig;
}

export const DEFAULT_AURAKEY_SYSTEM_CONFIG: AurakeySystemConfig = {
  register_reward_points: 10,
  daily_sign_in_reward_points: 10,
  invite_reward_points: 50,
  default_vip_valid_days: 30,
  default_point_pack_valid_days: null,
  daily_free_points_reset_hour: 24,
  custom: {
    miniapp_check_version: "1.0.1",
    recharge_tag: "限时7折",
    recharge_subtitle: "早期限时活动专享7折优惠，补充灵感值，让高清度排版引擎持续为你工作。",
  },
};

// UI 主题配置
export const THEME_CONFIG = {
  // 背景色
  BG_PRIMARY: "#0A0A0A",
  BG_SECONDARY: "#121212",
  BG_CARD: "rgba(255, 255, 255, 0.05)",

  // 强调色（电光蓝渐变荧光紫）
  ACCENT_START: "#00D4FF",
  ACCENT_END: "#B537FF",
  ACCENT_GRADIENT: "linear-gradient(135deg, #00D4FF 0%, #B537FF 100%)",

  // 文字颜色
  TEXT_PRIMARY: "#FFFFFF",
  TEXT_SECONDARY: "rgba(255, 255, 255, 0.6)",
  TEXT_TERTIARY: "rgba(255, 255, 255, 0.3)",

  // 圆角
  RADIUS_SM: "8rpx",
  RADIUS_MD: "16rpx",
  RADIUS_LG: "24rpx",
  RADIUS_XL: "32rpx",

  // 毛玻璃效果
  GLASS_BG: "rgba(255, 255, 255, 0.08)",
  GLASS_BLUR: "20rpx",
};

// 生成等待页动态提示语
export const LOADING_TIPS = ["正在构建画面结构...", "正在补充光影细节...", "正在渲染色彩层次...", "正在优化画面质感...", "AI 小贴士：更具体的形容词出图效果更好哦", 'AI 小贴士：可以尝试添加风格关键词，如"赛博朋克"、"水彩画"', "AI 小贴士：描述光线和氛围能让画面更有感染力"];

// 宽高比选项
export const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1", icon: "□" },
  { value: "3:4", label: "3:4", icon: "▭" },
  { value: "4:3", label: "4:3", icon: "▬" },
  { value: "16:9", label: "16:9", icon: "▬" },
];

// 分享海报配置
export const SHARE_POSTER_CONFIG = {
  WIDTH: 750,
  HEIGHT: 1334,
  PADDING: 40,
  QR_SIZE: 120,
};
