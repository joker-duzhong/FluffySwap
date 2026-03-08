/** 七牛云上传通用类型定义 */

export type AssetToken = {
  token: string;
  region: RegionEnum;
  bucket: string;
  domain: string;
};

export enum RegionEnum {
  z0 = "z0",
  z1 = "z1",
  z2 = "z2",
  na0 = "na0",
  as0 = "as0",
  cnEast2 = "cn-east-2",
}

export interface AssetInfo {
  id: string;
  name: string;
  format: string;
  size: number;
  creator: string;
  created: number;
  status: AssetStatus;
  url: string;
  owner?: string;
  thumbnail?: string;
  remark?: string;
  prompt?: string;
}

export enum AssetStatus {
  Default = 0,
  Wicked = 1,
  Public = 2,
}

/** 消息/提示适配器 - 可注入 uni.showToast、ElMessage 或自定义 */
export interface MessageAdapter {
  loading?: (msg?: string) => void;
  closeLoading?: () => void;
  success?: (msg: string) => void;
  error?: (msg: string) => void;
}

/** 七牛上传配置 - 使用时需设置 */
export interface QiniuUploadConfig {
  /** API 基础地址，如 https://your-api.com/api/v1 */
  apiBaseUrl: string;
  /** 获取上传 token 的路径，如 asset/config */
  getConfigPath?: string;
  /** 保存资源到数据库的路径，如 asset/add */
  addAssetPath?: string;
  /** 获取当前用户 ID（用于 owner 字段） */
  getOwner?: () => string;
  /** 消息提示适配器 */
  messageAdapter?: MessageAdapter;
  /** 自定义 storage key，默认 assetToken */
  storageKey?: string;
}
