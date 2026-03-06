<template>
  <view class="flex flex-col items-center justify-center min-h-screen bg-brand-primary px-8 relative overflow-hidden">
    
    <!-- Decorative background elements -->
    <view class="absolute top-0 right-[-10%] w-[120%] h-[70%] bg-white/10 rounded-full blur-[100px]"></view>
    <view class="absolute bottom-[-10%] left-[-20%] w-[100%] h-[60%] bg-indigo-400/20 rounded-full blur-[80px]"></view>

    <!-- Main Animation Container: Inspired by Design's minimalist aesthetic -->
    <view class="relative w-48 h-48 mb-12 flex items-center justify-center">
      
      <!-- Pulse rings that look like meditation waves -->
      <view class="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse-ring"></view>
      <view class="absolute inset-8 rounded-full border border-white/30 animate-pulse-ring" style="animation-delay: 0.5s"></view>
      
      <!-- Pet image in center (Zen Circle) -->
      <view class="z-10 w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl animate-float-mid">
        <image :src="petImage" mode="aspectFill" class="w-full h-full" />
      </view>
      
      <!-- Floating icons from design cards (random selection) -->
      <view class="absolute -top-4 -right-2 text-3xl animate-bounce-cute">✨</view>
      <view class="absolute -bottom-2 -left-4 text-3xl animate-wiggle">🎨</view>
    </view>
    
    <!-- Text Area -->
    <view class="text-center relative z-10">
      <text class="block text-3xl font-bold text-white mb-6 uppercase tracking-widest">AI 绘制中...</text>
      
      <!-- Tips -->
      <view class="h-16 overflow-hidden relative">
        <view class="animate-roll-text">
          <text v-for="(tip, idx) in tips" :key="idx" class="block text-white/70 text-sm leading-[4rem] text-center italic">
            {{ tip }}
          </text>
          <text class="block text-white/70 text-sm leading-[4rem] text-center italic">{{ tips[0] }}</text>
        </view>
      </view>
    </view>
    
    <!-- Progress Indicator -->
    <view class="mt-16 w-3/4 flex flex-col items-center gap-4">
      <view class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <view class="h-full bg-white rounded-full animate-shimmer-bar"></view>
      </view>
      <text class="text-white/40 text-[10px] uppercase tracking-[0.2em]">Cracking the DNA of Cuteness</text>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  petImage: string;
  styleName: string;
}>();

const tips = [
  `正在分析毛发细节...`,
  '正在应用风格化滤镜...',
  'AI 画师正在构图中...',
  '最后亿点点细节...',
];
</script>

<style scoped>
@keyframes rollText {
  0% { transform: translateY(0); }
  25% { transform: translateY(-4rem); }
  50% { transform: translateY(-8rem); }
  75% { transform: translateY(-12rem); }
  100% { transform: translateY(-16rem); }
}

.animate-roll-text {
  animation: rollText 12s infinite steps(1);
}

@keyframes pulseRing {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
}

.animate-pulse-ring {
  animation: pulseRing 3s ease-out infinite;
}

@keyframes shimmerBar {
  0% { width: 0%; }
  100% { width: 100%; }
}

.animate-shimmer-bar {
  animation: shimmerBar 10s ease-out forwards;
}

.animate-float-mid {
    animation: floatMid 4s ease-in-out infinite;
}

@keyframes floatMid {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

.animate-bounce-cute {
    animation: bounceCute 2s ease-in-out infinite;
}

@keyframes bounceCute {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.animate-wiggle {
    animation: wiggle 2.5s ease-in-out infinite;
}

@keyframes wiggle {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

</style>