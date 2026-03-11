import { defineStore } from 'pinia';
import type { StyleItem } from '@/config/prompt';

export type AppStep = 'home' | 'styleSelect' | 'loading' | 'result';

// Re-export StyleItem for backward compatibility
export type { StyleItem } from '@/config/prompt';

export const usePetStore = defineStore('pet', {
  state: () => ({
    currentStep: 'home' as AppStep,
    originalImage: null as string | null,
    selectedStyle: null as StyleItem | null,
    gender: '' as string, // 性别：'male' | 'female' | ''
    customPrompt: '',
    isProcessing: false,
    resultImage: null as string | null,
    hasPaid: false,
  }),
  actions: {
    goTo(step: AppStep) {
      this.currentStep = step;
    },
    setOriginalImage(img: string | null) {
      this.originalImage = img;
    },
    selectStyle(style: StyleItem) {
      this.selectedStyle = style;
    },
    setGender(gender: string) {
      this.gender = gender;
    },
    setCustomPrompt(prompt: string) {
      this.customPrompt = prompt;
    },
    reset() {
      this.originalImage = null;
      this.selectedStyle = null;
      this.gender = '';
      this.customPrompt = '';
      this.isProcessing = false;
      this.resultImage = null;
      this.hasPaid = false;
      this.currentStep = 'home';
    }
  }
});
