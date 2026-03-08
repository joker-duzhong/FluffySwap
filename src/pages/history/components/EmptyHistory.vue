<template>
  <view class="flex-1 flex flex-col items-center justify-center px-10 z-10">
    <text class="text-8xl mb-6 animate-bounce-cute">📭</text>
    <text class="text-white font-bold text-xl mb-2">还没有作品</text>
    <text class="text-white/60 text-sm text-center leading-relaxed">
      快去生成你的第一张萌宠艺术照吧！
    </text>
    <button
      class="mt-8 bg-white/20 border border-white/30 px-8 h-10 leading-10 rounded-full font-semibold text-sm text-white active:scale-95 transition-all backdrop-blur-md"
      @tap="goHome"
    >
      立即开始
    </button>
  </view>
</template>

<script setup lang="ts">
const goHome = () => {
  uni.navigateTo({ url: '/pages/index/index' });
};
</script>

<style scoped>
.animate-bounce-cute {
  animation: bounceCute 2s ease-in-out infinite;
}
@keyframes bounceCute {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
