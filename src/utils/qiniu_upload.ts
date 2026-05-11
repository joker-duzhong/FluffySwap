import { aurakeyApi, type ResourceResponse } from '@/services/aurakey'

export interface QiniuUploadOptions {
  filePath: string
  appKey?: string
  directory?: string
  fileName?: string
  mimeType?: string
  size?: number
}

export interface QiniuUploadedResource {
  resource: ResourceResponse
  url: string
  key: string
  hash: string
}

interface QiniuUploadResult {
  key: string
  hash: string
}

const DEFAULT_APP_KEY = 'aurakey'
const DEFAULT_UPLOAD_HOST = 'https://upload.qiniup.com'
const DEFAULT_MIME_TYPE = 'image/png'

const trimSlash = (value: string) => value.replace(/^\/+|\/+$/g, '')

const buildObjectKey = (directory = 'uploads', fileName?: string) => {
  const safeDirectory = trimSlash(directory || 'uploads')
  const safeFileName = fileName || `${Date.now()}-${Math.random().toString(36).slice(2)}.png`
  return `${safeDirectory}/${safeFileName}`
}

const uploadFileToQiniu = (filePath: string, key: string, token: string) =>
  new Promise<QiniuUploadResult>((resolve, reject) => {
    uni.uploadFile({
      url: DEFAULT_UPLOAD_HOST,
      filePath,
      name: 'file',
      formData: {
        token,
        key,
      },
      success: (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error('文件上传失败'))
          return
        }

        try {
          const data = JSON.parse(res.data || '{}')
          resolve({
            key: data.key || key,
            hash: data.hash || data.etag || key,
          })
        } catch (error) {
          reject(error)
        }
      },
      fail: reject,
    })
  })

export const uploadQiniuFile = async (options: QiniuUploadOptions): Promise<QiniuUploadedResource> => {
  if (!options.filePath) {
    throw new Error('请选择要上传的文件')
  }

  const tokenInfo = await aurakeyApi.storage.uploadToken()
  const key = buildObjectKey(options.directory, options.fileName)
  const uploadResult = await uploadFileToQiniu(options.filePath, key, tokenInfo.token)
  const resource = await aurakeyApi.storage.confirmUpload(
    {
      name: uploadResult.key,
      url: uploadResult.key,
      size: options.size || 0,
      type: options.mimeType || DEFAULT_MIME_TYPE,
      hash: uploadResult.hash,
    },
    options.appKey || DEFAULT_APP_KEY,
  )

  return {
    resource,
    url: resource.url || `${tokenInfo.domain.replace(/\/$/, '')}/${uploadResult.key}`,
    key: uploadResult.key,
    hash: uploadResult.hash,
  }
}

export const uploadAvatar = (filePath: string) =>
  uploadQiniuFile({
    filePath,
    directory: 'avatar',
    mimeType: DEFAULT_MIME_TYPE,
  })
