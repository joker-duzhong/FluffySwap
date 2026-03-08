/**
 * 七牛云通用上传模块
 *
 * 使用方法：
 * 1. npm install qiniu-js
 * 2. 在应用启动时调用 setQiniuConfig 配置
 * 3. 调用 HUpload(files) 上传
 *
 * 复制到其他项目：直接复制整个 qiniu-upload 文件夹，并安装 qiniu-js 依赖
 */
export * from "./types";
export { setQiniuConfig, getQiniuConfig } from "./config";
import { assetService } from "./asset.service";
export * from "./asset.service";
export * from "./h-upload";
export { assetService } from "./asset.service";
export {
  HUpload,
  uploadFileToQiniuOnly,
  urlToFile,
  blobUrlToFile,
  ensureOnlineUrl,
  getUuid,
  getImageEl,
  ProportionalCompression,
} from "./h-upload";

/** 从 AssetInfo 获取可访问的完整 URL（若 url 仅为 key 则拼接 domain） */
export function getAssetFullUrl(asset: { url: string }): string {
  if (asset.url.startsWith("http")) return asset.url;
  try {
    const token = assetService.getAssetToken();
    const domain = token?.domain || "";
    const base = domain.startsWith("http") ? domain : `https://${domain}`;
    return `${base.replace(/\/$/, "")}/${asset.url}`;
  } catch {
    return asset.url;
  }
}
