# 七牛云通用上传模块

可独立复制的七牛云上传服务，支持 Vue / uni-app 等前端项目。

## 安装依赖

```bash
npm install qiniu-js
```

## 复制到新项目

将整个 `qiniu-upload` 文件夹复制到目标项目（如 `src/utils/qiniu-upload`），并安装 `qiniu-js`。

## 使用步骤

### 1. 配置（应用启动时）

```ts
import { setQiniuConfig } from "@/utils/qiniu-upload";

setQiniuConfig({
  apiBaseUrl: "https://your-api.com/api/v1",
  getConfigPath: "asset/config",   // 可选，默认 asset/config
  addAssetPath: "asset/add",       // 可选，默认 asset/add
  getOwner: () => "user-id",       // 可选，用于 owner 字段
  storageKey: "assetToken",        // 可选
  messageAdapter: {                // 可选，消息提示
    loading: (msg) => uni.showLoading({ title: msg }),
    closeLoading: () => uni.hideLoading(),
    success: (msg) => uni.showToast({ title: msg, icon: "success" }),
    error: (msg) => uni.showToast({ title: msg, icon: "none" }),
  },
});
```

### 2. 上传文件

```ts
import { HUpload } from "@/utils/qiniu-upload";

const files: File[] = [/* 从 input[type=file] 或拖拽获取 */];
const assets = await HUpload(files);
// assets[0].url 为上传后的资源 URL
```

## 环境说明

- **H5 / 浏览器**：完整支持，使用 `qiniu-js` 直传七牛
- **小程序**：`qiniu-js` 依赖浏览器 File API，小程序需另行实现（如使用 `uni.uploadFile` 直传七牛）
