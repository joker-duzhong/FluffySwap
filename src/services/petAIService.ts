// AI Image Generation Service
import { getSelectedModel } from '@/utils/model-service';

interface GenerateResult {
  imageUrl: string;
  success: boolean;
  status: string;
}

interface SubmitResult {
  taskId: string;
  success: boolean;
  status: string;
}

interface PaymentResult {
  success: boolean;
}

// TODO: Replace with your actual API Key
const API_KEY = 'sk-8029ce973d75a8278c9bc10b244356e8faf5f254df7c27000bfb65db813904db';
const API_BASE_URL = 'https://back.zaiwenai.com/api/v1/ai/images';

export const petAIService = {
  /**
   * 提交生成任务，返回 task_id
   */
  async submitTask(sourceImage: string, style: any): Promise<SubmitResult> {
    const modelName = getSelectedModel();
    console.log('Submitting task with model:', modelName, 'style:', style.name);

    if (!API_KEY) {
      console.warn('API Key is missing');
      return { taskId: '', success: false, status: 'missing_api_key' };
    }

    try {
      const promptText = style.prompt || `A cute pet in ${style.name} style`;

      const payload: any = {
        model: modelName,
        prompt: promptText,
        ratio: '1:1',
        translate: true
      };

      // Filter local URLs
      const isLocal = sourceImage && (
        sourceImage.startsWith('blob:') ||
        sourceImage.startsWith('file:') ||
        sourceImage.includes('localhost') ||
        sourceImage.includes('127.0.0.1')
      );

      if (sourceImage && !isLocal && (sourceImage.startsWith('http://') || sourceImage.startsWith('https://'))) {
        payload.image_url = sourceImage;
      } else if (isLocal) {
        console.warn('Local image detected. Generation will be prompt-only.');
      }

      const generateRes = await uni.request({
        url: `${API_BASE_URL}/generations`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        data: payload
      });

      if (generateRes.statusCode !== 200) {
        console.error('API Generation Error:', generateRes.data);
        throw new Error(`Generation API returned status: ${generateRes.statusCode}`);
      }

      const genData = generateRes.data as any;
      const taskId = genData?.info?.task_id || genData?.task_id;

      if (!taskId) {
        throw new Error('No task_id returned from API');
      }

      return { taskId, success: true, status: 'submitted' };

    } catch (error) {
      console.error('Submit Task Error:', error);
      return { taskId: '', success: false, status: 'failure' };
    }
  },

  /**
   * 轮询单次结果
   * @returns 返回当前状态，不阻塞
   */
  async pollOnce(taskId: string): Promise<GenerateResult> {
    try {
      const fetchRes = await uni.request({
        url: `${API_BASE_URL}/fetch`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        data: { task_id: taskId }
      });

      if (fetchRes.statusCode !== 200) {
        return { imageUrl: '', success: false, status: 'error' };
      }

      const data = fetchRes.data as any;
      const info = data.info;

      if (info && info.status) {
        const status = info.status;
        console.log(`Polling task ${taskId}: ${status}`);

        if (status === 'SUCCESS') {
          const images = info.imageUrl;
          if (Array.isArray(images) && images.length > 0) {
            return { imageUrl: images[0], success: true, status: 'success' };
          }
          return { imageUrl: '', success: false, status: 'no_image' };
        } else if (status === 'FAILURE') {
          return { imageUrl: '', success: false, status: 'failed' };
        }
        // IN_PROGRESS
        return { imageUrl: '', success: false, status: 'processing' };
      }

      return { imageUrl: '', success: false, status: 'unknown' };
    } catch (err) {
      console.error('Polling error:', err);
      return { imageUrl: '', success: false, status: 'error' };
    }
  },

  /**
   * 完整的生成流程（提交 + 轮询直到完成）
   * 用于兼容旧代码
   */
  async generateFaceSwap(sourceImage: string, style: any): Promise<GenerateResult> {
    const modelName = getSelectedModel();
    console.log('Generating image with model:', modelName, 'style:', style.name);

    if (!API_KEY) {
      console.warn('API Key is missing in src/services/petAIService.ts');
      return {
        imageUrl: '',
        success: false,
        status: 'missing_api_key'
      };
    }

    try {
      const promptText = style.prompt || `A cute pet in ${style.name} style`;

      const payload: any = {
        model: modelName,
        prompt: promptText,
        ratio: '1:1',
        translate: true
      };

      const isLocal = sourceImage && (
        sourceImage.startsWith('blob:') ||
        sourceImage.startsWith('file:') ||
        sourceImage.includes('localhost') ||
        sourceImage.includes('127.0.0.1')
      );

      if (sourceImage && !isLocal && (sourceImage.startsWith('http://') || sourceImage.startsWith('https://'))) {
        payload.image_url = sourceImage;
      } else if (isLocal) {
        console.warn('Local image detected. Skipping image_url for remote API. Generation will be prompt-only.');
      }

      const generateRes = await uni.request({
        url: `${API_BASE_URL}/generations`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        data: payload
      });

      if (generateRes.statusCode !== 200) {
        console.error('API Generation Error:', generateRes.data);
        throw new Error(`Generation API returned status: ${generateRes.statusCode}`);
      }

      const genData = generateRes.data as any;
      const taskId = genData?.info?.task_id || genData?.task_id;

      if (!taskId) {
        throw new Error('No task_id returned from API');
      }

      return await this.pollResult(taskId);

    } catch (error) {
      console.error('Generate Face Swap Error:', error);
      return {
        imageUrl: '',
        success: false,
        status: 'failure'
      };
    }
  },

  /**
   * 轮询直到完成
   */
  async pollResult(taskId: string): Promise<GenerateResult> {
    const MAX_ATTEMPTS = 60;
    const POLL_INTERVAL = 2000;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));

      try {
        const fetchRes = await uni.request({
          url: `${API_BASE_URL}/fetch`,
          method: 'POST',
          header: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          data: { task_id: taskId }
        });

        if (fetchRes.statusCode !== 200) {
          continue;
        }

        const data = fetchRes.data as any;
        const info = data.info;

        if (info && info.status) {
          const status = info.status;
          console.log(`Polling task ${taskId}: ${status}`);

          if (status === 'SUCCESS') {
            const images = info.imageUrl;

            if (Array.isArray(images) && images.length > 0) {
              return {
                imageUrl: images[0],
                success: true,
                status: 'success'
              };
            } else {
              throw new Error('Success status but no image URL found');
            }
          } else if (status === 'FAILURE') {
            console.error('Task failed:', info.msg || 'Unknown reason');
            return {
              imageUrl: '',
              success: false,
              status: 'failure'
            };
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }

    return {
      imageUrl: '',
      success: false,
      status: 'timeout'
    };
  },

  /**
   * Mock payment processing.
   */
  async processPayment(): Promise<PaymentResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1000);
    });
  }
};
