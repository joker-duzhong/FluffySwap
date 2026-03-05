<template>
  <view class="min-h-screen bg-[#F9F9F9] flex flex-col relative overflow-hidden">
    
    <!-- Top Visual / Hero Section -->
    <view class="h-[50vh] w-full relative bg-surface-muted overflow-hidden">
      <!-- Background Gradient -->
      <view class="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#3a3a3a]"></view>
      
      <!-- Decorative Elements -->
      <view class="absolute top-[-20%] right-[-10%] w-[80%] h-[60%] bg-brand-orange/30 rounded-full blur-[80px] opacity-40 animate-pulse-slow"></view>
      <view class="absolute bottom-[20%] left-[-10%] w-[60%] h-[50%] bg-purple-500/20 rounded-full blur-[60px] opacity-30"></view>

      <!-- Navigation / Header (Floating) -->
      <view class="absolute top-12 left-0 right-0 px-6 flex justify-between items-center z-20">
        <view class="w-10 h-10 rounded-[14px] bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <text class="text-white text-lg">❮</text>
        </view>
        <text class="text-white font-semibold tracking-wide">Detail</text>
        <view class="w-10 h-10 rounded-[14px] bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <text class="text-white text-lg">♥</text>
        </view>
      </view>

      <!-- Main Visual Object -->
      <view class="absolute inset-0 flex items-center justify-center pb-20">
         <view class="w-[70%] aspect-[3/4] relative perspective-1000">
            <!-- Back glow -->
            <view class="absolute inset-4 bg-brand-orange blur-2xl opacity-40"></view>
            
            <!-- The Card -->
            <view class="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-[30px] border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
                <view class="w-full h-full relative">
                    <view class="absolute inset-0 bg-black/20"></view>
                    <view class="absolute inset-0 flex flex-col items-center justify-center">
                        <text class="text-8xl animate-float-mid filter drop-shadow-lg">🐱</text>
                        <view class="mt-4 px-4 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10">
                            <text class="text-white text-xs font-medium">Magic Portrait</text>
                        </view>
                    </view>
                    
                    <!-- Shine Effect -->
                    <view class="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/10 to-transparent rotate-45 pointer-events-none"></view>
                </view>
            </view>
         </view>
      </view>
    </view>

    <!-- Bottom Content Sheet -->
    <view class="flex-1 -mt-10 bg-white rounded-t-[40px] relative z-10 px-6 pt-8 pb-32 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex flex-col">
      
      <!-- Title & Rating Row -->
      <view class="flex justify-between items-start mb-6">
        <view>
            <text class="text-2xl font-bold text-[#2F2D2C] leading-tight block mb-1">AI 萌宠换脸秀</text>
            <text class="text-[#9B9B9B] text-xs font-medium">Cyberpunk, Renaissance & more</text>
        </view>
        <view class="flex items-center gap-1.5 pt-1">
            <text class="text-[#FBBE21] text-lg">★</text>
            <text class="text-[#2F2D2C] font-bold text-base">4.8</text>
            <text class="text-[#9B9B9B] text-xs">(230)</text>
        </view>
      </view>

      <!-- Divider -->
      <view class="h-[1px] bg-[#EAEAEA] w-full mb-6"></view>

      <!-- Description Section -->
      <view class="mb-6">
        <text class="text-[#2F2D2C] font-semibold text-base mb-3 block">Description</text>
        <text class="text-[#9B9B9B] text-sm leading-relaxed line-clamp-3">
          Transform your beloved pet into a masterpiece! Upload a clear photo of your furry friend, and let our AI generate stunning portraits in various artistic styles. It's magic!
        </text>
      </view>

      <!-- Upload / Interaction Section -->
      <view class="flex-1">
        <text class="text-[#2F2D2C] font-semibold text-base mb-4 block">Upload Photo</text>
        <view class="bg-[#F8F8F8] rounded-2xl p-1">
            <ImageUploader v-model:image="store.originalImage" />
        </view>
      </view>

    </view>

    <!-- Bottom Fixed Action Bar -->
    <view class="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#F1F1F1] px-8 py-5 pb-8 rounded-t-[30px] z-50 flex items-center justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <view class="flex flex-col">
            <text class="text-[#9B9B9B] text-xs font-medium mb-1">Price</text>
            <view class="flex items-baseline gap-1">
                <text class="text-brand-orange font-semibold text-lg">Free</text>
                <text class="text-[#9B9B9B] text-xs line-through">$4.53</text>
            </view>
        </view>

        <button 
            class="bg-brand-orangenge hover:bg-[#b06b3e] h-14 px-10 rounded-[20px] font-semibold text-base shadow-lg shadow-[#C67C4E]/40 active:scale-95 transition-all flex items-center gap-2 border-none"
            :class="!store.originalImage ? 'opacity-50 grayscale' : ''"
            @tap="$emit('next')"
        >
            <text>Start Now</text>
        </button>
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
.perspective-1000 {
  perspective: 1000px;
}
.animate-float-mid {
    animation: float 4s ease-in-out infinite;
}
.animate-pulse-slow {
    animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.6; }
}
</style>
