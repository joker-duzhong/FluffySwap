import * as qiniu from "qiniu-js";
import { AssetInfo } from "./asset.service";
import { UserStore } from "@/store/user";
import { AppStore } from "@/store/app";
import { ElMessage } from "element-plus";
import { assetService } from "@/services/asset.service";

/** uuid */
export function getUuid(len: number = 17) {
  return "hxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    .replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    })
    .slice(0, len);
}

type UploadInfo = {
  type: string;
  name: string;
  format: string;
  md5: string;
  url: File;
  small?: File;
  snapshot?: File;
  size?: number;
};

/** 获取图片信息 */
export function getImageEl(src: string): Promise<HTMLImageElement> {
  // console.log("调用了  getImageEl ", src);
  return new Promise((resolve) => {
    // 创建一个新的图片对象
    const img = new Image();
    // 监听图片加载完成事件
    img.onload = function () {
      resolve(img);
    };
    img.src = src;
  });
}

/**
 * 将图像进行缩放处理，返回缩放后的图像数据
 * @param img 图像元素
 * @param maxWidthOrHeight 最大宽度或高度限制
 * @returns 缩放后的图像数据
 */
export async function ProportionalCompression(img: HTMLImageElement, width: number, height: number, maxWidthOrHeight: number): Promise<File> {
  let scaledWidth, scaledHeight;
  if (width >= height) {
    // 如果宽度大于等于高度，则以宽度为基准缩放
    const scale = maxWidthOrHeight / width;
    scaledWidth = maxWidthOrHeight;
    scaledHeight = height * scale;
  } else {
    // 如果高度大于宽度，则以高度为基准缩放
    const scale = maxWidthOrHeight / height;
    scaledWidth = width * scale;
    scaledHeight = maxWidthOrHeight;
  }
  // 创建缩放后的图像
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  ctx.drawImage(img, 0, 0, width, height, 0, 0, scaledWidth, scaledHeight);

  // 获取缩放后的图像的 base64 数据
  const dataURL = canvas.toDataURL("image/jpeg");
  const file = base64toFile(dataURL);
  return file;
}

/** 上传文件 */
export async function HUpload(files: File[]): Promise<AssetInfo[]> {
  if (!files?.length) {
    ElMessage.error("请先选择文件");
    return;
  }
  ElMessage.info({ message: "上传中", duration: 0 });
  await assetService.getConfig();
  const smallMax = 512; // 最长边限制
  // const snapshotMax = 1024; // 最长边限制
  const assets: AssetInfo[] = [];
  return new Promise<AssetInfo[]>((resolve, reject) => {
    files?.map(async (file, index) => {
      const temp = {} as UploadInfo;
      temp.url = file;
      temp.type = temp.format = file.type;
      temp.name = file.name;
      temp.size = file.size;
      if (file.type?.includes("image/")) {
        const tempUrl = URL.createObjectURL(file);
        const img = await getImageEl(tempUrl);
        if (img?.width) {
          const { width, height } = img;
          // img.setAttribute("crossOrigin", "Anonymous"); // 设置crossOrigin属性为Anonymous
          // 将图像转为封面图和快照，最长边限制为  smallMax 和 snapshotMax
          temp.small = await ProportionalCompression(img, width, height, smallMax);
          // temp.snapshot = await ProportionalCompression(img, width, height, snapshotMax);
        }
      }
      try {
        const asset = await Uploading(temp);
        console.log("asset>>>>>>>>>>", index, asset);
        assets.push(asset);
        if (assets?.length === files?.length) {
          ElMessage.closeAll();
          ElMessage.success("上传成功");
          resolve(assets);
        }
      } catch (error) {
        console.log("error", error);
        await assetService.getConfig();
        ElMessage.closeAll();
        ElMessage.error("上传失败，请再试一次吧");
        reject(new Error("上传失败，请再试一次吧"));
      }
    });
  });
}

/** 将处理完成的文件上传至七牛云 */
function Uploading(file: UploadInfo): Promise<AssetInfo> {
  return new Promise(async (resolve, reject) => {
    try {
      const asset = await uploadAsset(await upload(file?.url || file), file, (await upload(file?.small))?.key);
      resolve(asset);
    } catch (error) {
      reject(new Error(error));
    }
  });
}

/** 上传文件到七牛云 */
async function upload(file: File | UploadInfo): Promise<any> {
  if (!file) return await new Promise((resolve) => resolve(undefined));
  console.log("upload", file);
  const { token, region, bucket, domain } = AppStore().assetToken;
  const config = { useCdnDomain: !!domain, region, bucket };
  const putExtra = {
    fname: file?.name || getUuid(),
    params: {},
    mimeType: null,
  };
  const suffix = file?.name?.slice(file?.name.lastIndexOf(".")).toLowerCase();
  try {
    return await new Promise((resolve, reject) =>
      qiniu.upload((file as UploadInfo)?.url || (file as File), getUuid() + suffix, token, putExtra, config).subscribe({
        complete(res) {
          resolve(res);
        },
        error() {
          reject(new Error("上传失败，请再试一次吧"));
        },
      })
    );
  } catch {
    throw new Error("上传失败，请再试一次吧");
  }
}

/** 保存七牛云文件到数据库 */
async function uploadAsset(result: any, file?: UploadInfo, small?: string): Promise<AssetInfo> {
  console.log(result);
  if (!result?.key) return;
  const owner = UserStore().user?.uid;
  const { hash, key, format, size, md5, img } = result;
  return await assetService.add(file.name, format || file.type || file.format || "*", size || file.size, owner, key, small || key);
}
