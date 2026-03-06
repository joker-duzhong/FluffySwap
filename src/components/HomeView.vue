<template>
  <view class="min-h-screen bg-brand-primary relative overflow-hidden flex flex-col">
    
    <!-- Background Decorative Elements (Fixed) -->
    <view class="absolute inset-0 pointer-events-none">
      <view class="absolute top-0 right-[-10%] w-[120%] h-[70%] bg-white/10 rounded-full blur-[100px]"></view>
      <view class="absolute bottom-[-10%] left-[-20%] w-[100%] h-[60%] bg-indigo-400/20 rounded-full blur-[80px]"></view>
    </view>

    <!-- Main Content Flow -->
    <view class="flex-1 flex flex-col z-10 w-full h-full">
      
      <!-- Logo/Title Area -->
      <view class="pt-16 pb-4 flex flex-col items-center shrink-0">
        <view class="flex items-center gap-2 mb-2">
            <text class="text-white font-black tracking-widest text-sm italic">FLUFFY</text>
            <view class="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <text class="text-brand-primary text-[10px]">★</text>
            </view>
            <text class="text-white font-black tracking-widest text-sm italic">SWAP</text>
        </view>
      </view>

      <!-- Main Visual Object (Flexible Center) -->
      <view class="flex-1 flex flex-col items-center justify-center min-h-[300px] shrink-0">
         <view class="w-[60vw] max-w-[280px] aspect-square relative flex items-center justify-center">
            <!-- Background Circles -->
            <view class="absolute w-full h-full bg-indigo-400/30 rounded-full scale-100"></view>
            <view class="absolute w-[85%] h-[85%] bg-indigo-500/30 rounded-full scale-100"></view>
            
            <!-- Mascot -->
            <view class="z-10 flex flex-col items-center">
                <text class="text-[100px] animate-bounce-cute filter drop-shadow-2xl">🐱</text>
            </view>
         </view>

         <view class="mt-6 text-center px-10">
            <text class="text-white font-bold text-3xl mb-2 block">AI 萌宠换脸秀</text>
            <text class="text-white/80 text-base font-light block">Magic Portrait for Pets</text>
            <text class="text-white/60 text-sm mt-3 block leading-relaxed px-2">
              一键生成多种艺术风格，让你的爱宠变身超萌主角！
            </text>
         </view>
      </view>

      <!-- UI Interaction Section -->
      <view class="px-8 pb-10 pt-4 flex flex-col gap-5 shrink-0">
          <!-- Integrated Uploader style -->
          <view class="bg-white/10 backdrop-blur-md rounded-[38px] p-2 border border-white/20">
              <ImageUploader v-model:image="store.originalImage" />
          </view>

          <button 
              class="bg-[#EBEAEC] w-full h-16 rounded-[38px] font-semibold text-sm tracking-widest text-brand-primary shadow-2xl active:scale-95 transition-all flex items-center justify-center border-none"
              :class="!store.originalImage ? 'opacity-80 grayscale pointer-events-none' : ''"
              @tap="$emit('next')"
          >
              立即开始
          </button>
      </view>

    </view>
  </view>
</template>

<script setup lang="ts">
import ImageUploader from '@/components/ImageUploader.vue';
import { usePetStore } from '@/stores/petStore';

const store = usePetStore();
defineEmits(['next']);
</script>

<style scoped>
.animate-bounce-cute {
    animation: bounceCute 2s ease-in-out infinite;
}
@keyframes bounceCute {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
</style>