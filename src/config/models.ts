import { TOKENS_PER_POINT } from '@/types/points';

export interface ModelOption {
  id: string;
  name: string;
  tokenCost: number;       // API 消耗的 token 数
  description?: string;
}

export const MODEL_LIST: ModelOption[] = [
  { id: 'Flux-2-Klein-9B-Base', name: 'Flux-2 Klein', tokenCost: 200 },
  { id: 'Flux-2-Turbo', name: 'Flux-2 Turbo', tokenCost: 200 },
  { id: 'Ideogram-v3', name: 'Ideogram v3', tokenCost: 2000 },
  { id: 'Imagen-4', name: 'Imagen 4', tokenCost: 200 },
  { id: 'Kling-Image-O1', name: 'Kling Image', tokenCost: 200 },
  { id: 'Nano-Banana', name: 'Nano Banana', tokenCost: 1000 },
  { id: 'Qwen-Image', name: 'Qwen Image', tokenCost: 200 },
  { id: 'Seedream-4.0', name: 'Seedream 4.0', tokenCost: 100 },
  { id: 'gemini-3.1-flash-image-preview:1k', name: 'Gemini 3.1 (1K)', tokenCost: 20000 },
  { id: 'gemini-3.1-flash-image-preview:2k', name: 'Gemini 3.1 (2K)', tokenCost: 40000 },
  { id: 'gemini-3.1-flash-image-preview:4k', name: 'Gemini 3.1 (4K)', tokenCost: 80000 },
  { id: 'grok-imagine-image', name: 'Grok Imagine', tokenCost: 200 },
  { id: 'midjourney', name: 'Midjourney', tokenCost: 5000 },
  { id: 'nano-banana-2', name: 'Nano Banana 2', tokenCost: 60000 },
  { id: 'nano-banana-2-2k', name: 'Nano Banana 2K', tokenCost: 120000 },
  { id: 'nano-banana-2-4k', name: 'Nano Banana 4K', tokenCost: 240000 },
  { id: 'playgroundv2.5', name: 'Playground v2.5', tokenCost: 200 },
  { id: 'playgroundv3', name: 'Playground v3', tokenCost: 200 },
  { id: 'recraftv3', name: 'Recraft v3', tokenCost: 200 },
  { id: 'removebackground', name: 'Remove BG', tokenCost: 200 },
  { id: 'topazlabs', name: 'Topaz Labs', tokenCost: 200 },
];

// 默认模型
export const DEFAULT_MODEL = 'grok-imagine-image';

/**
 * 计算模型消耗的点数（token -> 点数）
 * 2000 token = 1 点，向上取整
 */
export const getModelCost = (modelId: string): number => {
  const model = MODEL_LIST.find(m => m.id === modelId);
  if (!model) return 1;
  return Math.ceil(model.tokenCost / TOKENS_PER_POINT);
};

/**
 * 获取模型显示的消耗文本
 */
export const getModelCostText = (modelId: string): string => {
  const cost = getModelCost(modelId);
  return `${cost}点/次`;
};
