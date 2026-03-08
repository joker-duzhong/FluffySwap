import { DEFAULT_MODEL } from '@/config/models';

const STORAGE_KEY = 'fluffySwap_model';

/** 检测是否为 H5 环境 */
const isH5 = (): boolean => {
  // @ts-ignore
  return typeof document !== 'undefined';
};

/** 获取用户选择的模型 */
export const getSelectedModel = (): string => {
  try {
    if (isH5()) {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_MODEL;
    } else {
      return uni.getStorageSync(STORAGE_KEY) || DEFAULT_MODEL;
    }
  } catch (e) {
    console.warn('Get model failed:', e);
    return DEFAULT_MODEL;
  }
};

/** 保存用户选择的模型 */
export const setSelectedModel = (modelId: string): void => {
  try {
    if (isH5()) {
      localStorage.setItem(STORAGE_KEY, modelId);
    } else {
      uni.setStorageSync(STORAGE_KEY, modelId);
    }
  } catch (e) {
    console.error('Set model failed:', e);
  }
};
