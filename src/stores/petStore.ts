import { defineStore } from 'pinia';

export type AppStep = 'home' | 'styleSelect' | 'loading' | 'result';

export interface StyleItem {
  id: number;
  name: string;
  description: string;
  suitable_for: string;
  prompt: string;
  negative_prompt: string;
}

export const usePetStore = defineStore('pet', {
  state: () => ({
    currentStep: 'home' as AppStep,
    originalImage: null as string | null,
    selectedStyle: null as StyleItem | null,
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
    reset() {
      this.originalImage = null;
      this.selectedStyle = null;
      this.customPrompt = '';
      this.isProcessing = false;
      this.resultImage = null;
      this.hasPaid = false;
      this.currentStep = 'home';
    }
  }
});
