/** 七牛云上传核心逻辑 - 无项目依赖，通过 config 注入 */
import type { AssetInfo } from "./types";
import { assetService } from "./asset.service";
import { getQiniuConfig } from "./config";

/** uuid */
export function getUuid(len = 17): string {
  return "hxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    .replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })
    .slice(0, len);
}

function base64toFile(dataURL: string, filename = "image.jpg"): File {
  const arr = dataURL.split(",");
  const mime = (arr[0].match(/:(.*?);/)?.[1] || "image/jpeg") as string;
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

type UploadInfo = {
  type: string;
  name: string;
  format: string;
  md5?: string;
  url: File;
  small?: File;
  snapshot?: File;
  size?: number;
};

/** 获取图片信息 */
export function getImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** 按比例压缩图片 */
export async function ProportionalCompression(
  img: HTMLImageElement,
  width: number,
  height: number,
  maxWidthOrHeight: number
): Promise<File> {
  let scaledWidth: number;
  let scaledHeight: number;
  if (width >= height) {
    const scale = maxWidthOrHeight / width;
    scaledWidth = maxWidthOrHeight;
    scaledHeight = height * scale;
  } else {
    const scale = maxWidthOrHeight / height;
    scaledWidth = width * scale;
    scaledHeight = maxWidthOrHeight;
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");
  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  ctx.drawImage(img, 0, 0, width, height, 0, 0, scaledWidth, scaledHeight);
  const dataURL = canvas.toDataURL("image/jpeg");
  return base64toFile(dataURL);
}

/** 上传文件到七牛云（H5，动态加载 qiniu-js 以兼容小程序构建） */
async function uploadToQiniu(file: File | UploadInfo, token: string, region: string, bucket: string, domain: string): Promise<any> {
  const { upload } = await import("qiniu-js");
  const config = { useCdnDomain: !!domain, region: region as any, bucket };
  const putExtra = { fname: file?.name || getUuid(), params: {} };
  const f = (file as UploadInfo)?.url ?? (file as File);
  const suffix = (file?.name ?? "").slice((file?.name ?? "").lastIndexOf(".")).toLowerCase() || "";
  const key = getUuid() + (suffix || ".bin");

  return new Promise((resolve, reject) => {
    upload(f, key, token, putExtra, config).subscribe({
      complete(res) {
        resolve(res);
      },
      error() {
        reject(new Error("上传失败，请再试一次"));
      },
    });
  });
}

/** 保存七牛云文件到数据库 */
async function saveAsset(result: any, file: UploadInfo, smallKey?: string): Promise<AssetInfo> {
  if (!result?.key) throw new Error("Upload result missing key");
  const cfg = getQiniuConfig();
  const owner = cfg.getOwner?.() ?? "";
  const { format, size } = result;
  return assetService.add(
    file.name,
    format || file.type || file.format || "*",
    size ?? file.size ?? 0,
    owner,
    result.key,
    smallKey ?? result.key
  );
}

async function uploadSingle(file: UploadInfo): Promise<AssetInfo> {
  const tokenData = assetService.getAssetToken();
  if (!tokenData?.token) {
    await assetService.getConfig();
    const again = assetService.getAssetToken();
    if (!again?.token) throw new Error("获取上传配置失败");
  }
  const { token, region, bucket, domain } = assetService.getAssetToken()!;

  const mainResult = await uploadToQiniu(file.url, token, region, bucket, domain);
  let smallKey: string | undefined;
  if (file.small) {
    const smallResult = await uploadToQiniu(file.small, token, region, bucket, domain);
    smallKey = smallResult?.key;
  }
  return saveAsset(mainResult, file, smallKey);
}

/**
 * 仅上传到七牛云，不保存数据库，返回域名+key 的在线地址
 */
export async function uploadFileToQiniuOnly(file: File): Promise<string> {
  await assetService.getConfig();
  const tokenData = assetService.getAssetToken();
  if (!tokenData?.token) throw new Error("获取上传配置失败");
  const { token, region, bucket, domain } = tokenData;
  const result = await uploadToQiniu(file, token, region, bucket, domain);
  if (!result?.key) throw new Error("上传失败");
  const base = domain?.startsWith("http") ? domain : `https://${domain || ""}`.replace(/\/$/, "");
  return `${base}/${result.key}`;
}

/** 是否小程序环境（无 document/DOM，需用 uni.uploadFile） */
const isMp =
  typeof uni !== "undefined" &&
  typeof uni.uploadFile === "function" &&
  typeof document === "undefined";

const REGION_UPLOAD_URL: Record<string, string> = {
  z0: "https://upload.qiniup.com",
  z1: "https://upload-z1.qiniup.com",
  z2: "https://upload-z2.qiniup.com",
  na0: "https://upload-na0.qiniup.com",
  as0: "https://upload-as0.qiniup.com",
  "cn-east-2": "https://upload-cn-east-2.qiniup.com",
};

/** 小程序：用 uni.uploadFile 将临时文件上传到七牛 */
async function uploadTempFileByMp(filePath: string): Promise<string> {
  await assetService.getConfig();
  const tokenData = assetService.getAssetToken();
  if (!tokenData?.token) throw new Error("获取上传配置失败");
  const { token, region, domain } = tokenData;
  const uploadUrl = REGION_UPLOAD_URL[region] || REGION_UPLOAD_URL.z0;
  const suffix = (filePath.includes(".") ? filePath.slice(filePath.lastIndexOf(".")).toLowerCase() : "") || ".jpg";
  const key = getUuid() + suffix;

  const res = await new Promise<UniApp.UploadFileSuccessCallbackResult>((resolve, reject) => {
    uni.uploadFile({
      url: uploadUrl,
      filePath,
      name: "file",
      formData: { token, key },
      success: (r) => {
        if (r.statusCode >= 200 && r.statusCode < 300) resolve(r);
        else reject(new Error("上传失败"));
      },
      fail: reject,
    });
  });

  const body = JSON.parse(res.data || "{}");
  const resultKey = body.key || key;
  const base = domain?.startsWith("http") ? domain : `https://${domain || ""}`.replace(/\/$/, "");
  return `${base}/${resultKey}`;
}

/** 将任意可访问的图片 URL 转为 File（仅 H5） */
export async function urlToFile(url: string, filename = "image.jpg"): Promise<File> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}

/** @deprecated 请用 urlToFile */
export const blobUrlToFile = urlToFile;

/** 内存缓存：文件 hash -> 七牛在线地址，重复图片不再上传（仅 H5） */
const uploadCache = new Map<string, string>();

async function fileHash(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buf);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** H5：fetch -> File -> hash 缓存 -> 七牛上传 */
async function ensureOnlineUrlH5(imageUrl: string): Promise<string> {
  const file = await urlToFile(imageUrl);
  const hash = await fileHash(file);
  const cached = uploadCache.get(hash);
  if (cached) return cached;
  const url = await uploadFileToQiniuOnly(file);
  uploadCache.set(hash, url);
  return url;
}

/**
 * 确保参考图为在线地址：统一上传七牛
 * H5：fetch -> File -> hash 缓存 -> qiniu-js
 * 小程序：uni.uploadFile 直传临时路径
 */
export async function ensureOnlineUrl(imageUrl: string): Promise<string> {
  if (isMp) return uploadTempFileByMp(imageUrl);
  return ensureOnlineUrlH5(imageUrl);
}

/**
 * 批量上传文件到七牛云
 * 需要先通过 setQiniuConfig 配置 apiBaseUrl、getOwner 等
 */
export async function HUpload(files: File[]): Promise<AssetInfo[]> {
  const cfg = getQiniuConfig();
  const msg = cfg.messageAdapter;

  if (!files?.length) {
    msg?.error?.("请先选择文件");
    return [];
  }

  msg?.loading?.("上传中");
  await assetService.getConfig();

  const smallMax = 512;
  const assets: AssetInfo[] = [];
  const total = files.length;
  let done = 0;

  for (const file of files) {
    const temp: UploadInfo = {
      url: file,
      type: file.type,
      format: file.type,
      name: file.name,
      size: file.size,
    };

    if (file.type?.includes("image/")) {
      try {
        const tempUrl = URL.createObjectURL(file);
        const img = await getImageEl(tempUrl);
        URL.revokeObjectURL(tempUrl);
        if (img?.width) {
          temp.small = await ProportionalCompression(img, img.width, img.height, smallMax);
        }
      } catch {
        // 非图片或加载失败，跳过缩略图
      }
    }

    try {
      const asset = await uploadSingle(temp);
      assets.push(asset);
    } catch (error) {
      await assetService.getConfig();
      msg?.closeLoading?.();
      msg?.error?.("上传失败，请再试一次");
      throw error;
    }

    done++;
    if (done === total) {
      msg?.closeLoading?.();
      msg?.success?.("上传成功");
      return assets;
    }
  }

  msg?.closeLoading?.();
  return assets;
}
