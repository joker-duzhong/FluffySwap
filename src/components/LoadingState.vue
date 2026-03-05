<template>
  <view class="flex flex-col items-center justify-center min-h-screen px-8 relative overflow-hidden">
    
    <!-- Decorative blobs -->
    <view class="absolute top-0 right-0 w-72 h-72 blob-orange rounded-full opacity-60 animate-float-slow"></view>
    <view class="absolute bottom-20 left-0 w-56 h-56 blob-lavender rounded-full opacity-50" style="animation: floatSlow 8s ease-in-out infinite reverse"></view>

    <!-- Main Animation Container -->
    <view class="relative w-48 h-48 mb-12 animate-fade-in">
      
      <!-- Pulse rings -->
      <view class="absolute inset-0 rounded-full border-2 border-brand-orange/20 animate-pulse-ring"></view>
      <view class="absolute inset-0 rounded-full border-2 border-brand-lavender/15 animate-pulse-ring" style="animation-delay: 0.7s"></view>
      
      <!-- Spinning orbit -->
      <view class="absolute inset-[-12px] rounded-full border-[3px] border-transparent border-t-brand-orange/60 border-r-brand-lavender/30 animate-spin-slow"></view>
      
      <!-- Pet image in center -->
      <view class="absolute inset-3 rounded-full overflow-hidden shadow-float border-4 border-white">
        <image :src="petImage" mode="aspectFill" class="w-full h-full" />
      </view>
      
      <!-- Floating emoji decorations -->
      <view class="absolute -top-4 -right-2 text-2xl animate-float-mid">✨</view>
      <view class="absolute -bottom-2 -left-4 text-2xl animate-wiggle">🪄</view>
      <view class="absolute top-1/2 -right-6 text-lg animate-bounce-cute" style="animation-delay: 0.3s">🎨</view>
    </view>
    
    <!-- Text Area -->
    <view class="text-center space-y-4 relative z-10 animate-fade-in" style="animation-delay: 0.3s">
      <text class="block text-2xl font-extrabold text-ink tracking-tight">魔法生成中…</text>
      
      <!-- Rolling tips -->
      <view class="h-12 overflow-hidden relative">
        <view class="animate-roll-text">
          <text v-for="(tip, idx) in tips" :key="idx" class="block text-ink-secondary text-sm leading-[3rem] text-center">
            {{ tip }}
          </text>
          <!-- Repeat first for seamless loop -->
          <text class="block text-ink-secondary text-sm leading-[3rem] text-center">{{ tips[0] }}</text>
        </view>
      </view>
    </view>
    
    <!-- Bottom progress hint -->
    <view class="mt-16 flex flex-col items-center gap-3 animate-fade-in" style="animation-delay: 0.6s">
      <view class="w-48 h-1.5 bg-brand-orange/10 rounded-full overflow-hidden">
        <view class="h-full bg-gradient-to-r from-brand-orange to-brand-peach rounded-full animate-shimmer-bar"></view>
      </view>
      <text class="text-ink-tertiary text-xs">大约需要 10 秒，请耐心等待哦 💛</text>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  petImage: string;
  styleName: string;
}>();

const tips = [
  `🎨 正在为小主调制 ${props.styleName} 风格…`,
  '🐾 正在分析宠物的可爱基因…',
  '✨ 正在注入魔法粒子…',
  '🪄 正在精修五官细节…',
  '💫 快好了，马上揭晓！',
];
</script>

<style lang="scss" scoped>
@keyframes rollText {
  0% { transform: translateY(0); }
  18% { transform: translateY(0); }
  20% { transform: translateY(-3rem); }
  38% { transform: translateY(-3rem); }
  40% { transform: translateY(-6rem); }
  58% { transform: translateY(-6rem); }
  60% { transform: translateY(-9rem); }
  78% { transform: translateY(-9rem); }
  80% { transform: translateY(-12rem); }
  98% { transform: translateY(-12rem); }
  100% { transform: translateY(-15rem); }
}

.animate-roll-text {
  animation: rollText 12s infinite;
}

@keyframes shimmerBar {
  0% { width: 5%; }
  50% { width: 70%; }
  80% { width: 85%; }
  100% { width: 95%; }
}

.animate-shimmer-bar {
  animation: shimmerBar 10s ease-out forwards;
}
</style>
