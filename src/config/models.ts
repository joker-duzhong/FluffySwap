export interface ModelOption {
  id: string;
  name: string;
  points: number;
  description?: string;
}

export const MODEL_LIST: ModelOption[] = [
  { id: 'Flux-2-Klein-9B-Base', name: 'Flux-2-Klein-9B-Base', points: 200 },
  { id: 'Flux-2-Turbo', name: 'Flux-2-Turbo', points: 200 },
  { id: 'Ideogram-v3', name: 'Ideogram-v3', points: 2000 },
  { id: 'Imagen-4', name: 'Imagen-4', points: 200 },
  { id: 'Kling-Image-O1', name: 'Kling-Image-O1', points: 200 },
  { id: 'Nano-Banana', name: 'Nano-Banana', points: 1000 },
  { id: 'Qwen-Image', name: 'Qwen-Image', points: 200 },
  { id: 'Seedream-4.0', name: 'Seedream-4.0', points: 100 },
  { id: 'gemini-3.1-flash-image-preview:1k', name: 'Gemini 3.1 Flash (1K)', points: 20000 },
  { id: 'gemini-3.1-flash-image-preview:2k', name: 'Gemini 3.1 Flash (2K)', points: 40000 },
  { id: 'gemini-3.1-flash-image-preview:4k', name: 'Gemini 3.1 Flash (4K)', points: 80000 },
  { id: 'grok-imagine-image', name: 'Grok Imagine', points: 200 },
  { id: 'midjourney', name: 'Midjourney', points: 5000 },
  { id: 'nano-banana-2', name: 'Nano Banana 2', points: 60000 },
  { id: 'nano-banana-2-2k', name: 'Nano Banana 2 (2K)', points: 120000 },
  { id: 'nano-banana-2-4k', name: 'Nano Banana 2 (4K)', points: 240000 },
  { id: 'playgroundv2.5', name: 'Playground v2.5', points: 200 },
  { id: 'playgroundv3', name: 'Playground v3', points: 200 },
  { id: 'recraftv3', name: 'Recraft v3', points: 200 },
  { id: 'removebackground', name: 'Remove Background', points: 200 },
  { id: 'topazlabs', name: 'Topaz Labs', points: 200 },
];

// 默认模型
export const DEFAULT_MODEL = 'grok-imagine-image';
