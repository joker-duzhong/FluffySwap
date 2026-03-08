/**
 * 本项目对七牛上传的初始化配置
 * 其他项目复制 qiniu-upload 文件夹后，在此修改配置或新建 init 文件
 */
import { setQiniuConfig } from "./config";

/** uni-app 消息适配器 */
const uniMessageAdapter = {
  loading: (msg?: string) => {
    uni.showLoading({ title: msg || "上传中" });
  },
  closeLoading: () => {
    uni.hideLoading();
  },
  success: (msg: string) => {
    uni.showToast({ title: msg, icon: "success" });
  },
  error: (msg: string) => {
    uni.showToast({ title: msg, icon: "none" });
  },
};

export function initQiniuUpload() {
  setQiniuConfig({
    apiBaseUrl: "https://back.zaiwenai.com/api/v1",
    getConfigPath: "asset/config",
    addAssetPath: "asset/add",
    getOwner: () => {
      // 如有用户 store，在此返回用户 ID
      return "";
    },
    messageAdapter: uniMessageAdapter,
    storageKey: "assetToken",
  });
}
