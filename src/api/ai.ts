/**
 * AI 图像生成服务
 */

import { getSelectedModel } from '@/utils/model-service';
import type { StyleItem } from '@/config/prompt';

export interface GenerateParams {
  sourceImage: string;
  style: StyleItem;
  gender?: string;
  customPrompt?: string;
}

export interface SubmitTaskResult {
  taskId: string;
  success: boolean;
  status: string;
}

export interface PollResult {
  imageUrl: string;
  success: boolean;
  status: string;
}

const AI_API_KEY = 'sk-8029ce973d75a8278c9bc10b244356e8faf5f254df7c27000bfb65db813904db';
const AI_BASE_URL = 'https://back.zaiwenai.com/api/v1/ai/images';

class AIService {
  async submitTask(params: GenerateParams): Promise<SubmitTaskResult> {
    const { sourceImage, style, gender, customPrompt } = params;
    const modelName = getSelectedModel();

    let promptText = style.prompt || `A cute pet in ${style.name} style`;

    if (gender || customPrompt) {
      const additions: string[] = [];
      if (gender) {
        additions.push(`human gender: ${gender === 'male' ? 'male' : 'female'}`);
      }
      if (customPrompt?.trim()) {
        additions.push(customPrompt.trim());
      }
      if (additions.length > 0) {
        promptText = `${promptText}, ${additions.join(', ')}`;
      }
    }

    const isLocal = sourceImage && (
      sourceImage.startsWith('blob:') ||
      sourceImage.startsWith('file:') ||
      sourceImage.includes('localhost') ||
      sourceImage.includes('127.0.0.1')
    );

    const payload: any = {
      model: modelName,
      prompt: promptText,
      ratio: '1:1',
      translate: true
    };

    if (sourceImage && !isLocal && (sourceImage.startsWith('http://') || sourceImage.startsWith('https://'))) {
      payload.image_url = sourceImage;
    }


    try {
      const res = await uni.request({
        url: `${AI_BASE_URL}/generations`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        data: payload
      });

      if (res.statusCode !== 200) {
        throw new Error(`API returned ${res.statusCode}`);
      }

      const data = res.data as any;
      const taskId = data?.info?.task_id || data?.task_id;

      if (!taskId) {
        throw new Error('No task_id returned');
      }

      return { taskId, success: true, status: 'submitted' };
    } catch (error) {
      console.error('Submit task error:', error);
      return { taskId: '', success: false, status: 'failure' };
    }
  }

  async pollOnce(taskId: string): Promise<PollResult> {
    try {
      const res = await uni.request({
        url: `${AI_BASE_URL}/fetch`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        data: { task_id: taskId }
      });

      if (res.statusCode !== 200) {
        return { imageUrl: '', success: false, status: 'error' };
      }

      const data = res.data as any;
      const info = data.info;

      if (info?.status === 'SUCCESS') {
        const images = info.imageUrl;
        if (Array.isArray(images) && images.length > 0) {
          return { imageUrl: images[0], success: true, status: 'success' };
        }
        return { imageUrl: '', success: false, status: 'no_image' };
      }

      if (info?.status === 'FAILURE') {
        return { imageUrl: '', success: false, status: 'failed' };
      }

      return { imageUrl: '', success: false, status: 'processing' };
    } catch (error) {
      console.error('Poll error:', error);
      return { imageUrl: '', success: false, status: 'error' };
    }
  }
}

export const aiService = new AIService();
export const petAIService = aiService; // 兼容旧代码
