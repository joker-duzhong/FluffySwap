// AI Image Generation Service

interface GenerateResult {
  imageUrl: string;
  success: boolean;
  status: string;
}

interface PaymentResult {
  success: boolean;
}

// TODO: Replace with your actual API Key
const API_KEY = 'sk-8029ce973d75a8278c9bc10b244356e8faf5f254df7c27000bfb65db813904db'; 
const API_BASE_URL = 'https://back.zaiwenai.com/api/v1/ai/images';

// Model configuration
// Options: Flux-2-Klein-9B-Base, Flux-2-Turbo, Ideogram-v3, Kling-Image-O1, etc.
const MODEL_NAME = 'grok-imagine-image'; 

export const petAIService = {
  /**
   * Generation of face swap image integration.
   * Calls the third-party API.
   */
  async generateFaceSwap(sourceImage: string, style: any): Promise<GenerateResult> {
    console.log('Generating image with style:', style.name);

    if (!API_KEY) {
      console.warn('API Key is missing in src/services/petAIService.ts');
      // For now, fail gracefully or throw error
      // Since the user asked to make it REAL, we return failure if no key.
      return {
        imageUrl: '',
        success: false,
        status: 'missing_api_key'
      };
    }

    try {
      // 1. Prepare Payload
      // Use style.prompt if available, otherwise construct one
      const promptText = style.prompt || `A cute pet in ${style.name} style`;
      
      const payload: any = {
        model: MODEL_NAME,
        prompt: promptText,
        ratio: '1:1',
        translate: true
      };

      // Handle Reference Image
      // Filter out local blob/file/localhost URLs because the remote API cannot access them.
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

      // 2. Initiate Generation Request
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
      // task_id is inside "info" object based on recent response structure
      const taskId = genData?.info?.task_id || genData?.task_id; 

      if (!taskId) {
        throw new Error('No task_id returned from API');
      }

      // 3. Poll for Result
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
   * Polls the API for the result of a task.
   */
  async pollResult(taskId: string): Promise<GenerateResult> {
    const MAX_ATTEMPTS = 60; // 60 seconds max
    const POLL_INTERVAL = 2000; // 2 seconds

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        // Wait before polling
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
            
            // Expected structure:
            // { "info": { "imageUrl": ["..."], "status": "SUCCESS", ... }, ... }
            const info = data.info;

            if (info && info.status) {
                const status = info.status;
                console.log(`Polling task ${taskId}: ${status}`);

                if (status === 'SUCCESS') {
                    // Extract image URL
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
                    // Fail
                    console.error('Task failed:', info.msg || 'Unknown reason');
                    return {
                        imageUrl: '',
                        success: false,
                        status: 'failure'
                    };
                }
                // If IN_PROGRESS or others, continue polling
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
