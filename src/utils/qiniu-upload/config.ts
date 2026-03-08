/** 七牛上传配置 - 使用前必须调用 setConfig */
import type { QiniuUploadConfig } from "./types";

let config: QiniuUploadConfig = {
  apiBaseUrl: "",
  getConfigPath: "asset/config",
  addAssetPath: "asset/add",
  storageKey: "assetToken",
};

export function setQiniuConfig(c: Partial<QiniuUploadConfig>) {
  config = { ...config, ...c };
}

export function getQiniuConfig() {
  return config;
}
