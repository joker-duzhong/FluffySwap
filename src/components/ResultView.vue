<template>
  <view class="min-h-screen bg-brand-primary flex flex-col relative overflow-hidden pb-12">
    
    <!-- Background Decorative Elements -->
    <view class="absolute inset-0 pointer-events-none">
      <view class="absolute top-0 right-[-10%] w-[120%] h-[70%] bg-white/10 rounded-full blur-[100px]"></view>
      <view class="absolute bottom-[-10%] left-[-20%] w-[100%] h-[60%] bg-indigo-400/20 rounded-full blur-[80px]"></view>
    </view>

    <!-- Top Bar -->
    <view class="pt-16 px-8 flex items-center justify-between mb-8 z-10">
      <view @tap="$emit('goHome')" class="w-10 h-10 rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center active:scale-90 transition-transform backdrop-blur-sm">
        <text class="text-white text-sm">←</text>
      </view>
      <text class="text-white font-bold tracking-widest text-xs uppercase opacity-80">作品详情</text>
      <view class="w-10"></view>
    </view>
    
    <!-- Title Area (Design Theme) -->
    <view class="px-8 mb-8 animate-fade-in z-10 text-center">
        <text class="text-3xl font-bold text-white block mb-1 drop-shadow-md">萌宠变身成功</text>
        <text class="text-white/80 text-sm font-light uppercase tracking-widest">{{ styleName }} 风格</text>
    </view>
    
    <!-- Result Image Card (Integrated Aesthetic) -->
    <view class="px-8 mb-10 animate-fade-in flex-1 z-10 flex flex-col justify-center">
      <view class="w-full aspect-square relative rounded-[32px] overflow-hidden shadow-2xl border-[6px] border-white/20 bg-black/20 group">
          <!-- Main Result -->
          <image :src="resultImage || defaultImg" mode="aspectFill" class="w-full h-full" />
          
          <!-- Watermark Overlay (Minimal) -->
          <view v-if="!hasPaid" class="absolute inset-x-0 bottom-4 flex items-center justify-center pointer-events-none">
            <text class="text-white/40 text-[10px] tracking-[0.5em] uppercase font-black">AI 萌宠换脸秀</text>
          </view>
      </view>
    </view>
    
    <!-- Actions (Button Style from Design) -->
    <view class="px-8 space-y-4 z-10">
      
      <!-- Primary Action -->
      <button 
        class="bg-white w-full h-14 rounded-full font-bold text-sm tracking-widest text-brand-primary shadow-lg active:scale-95 transition-all flex items-center justify-center border-none"
        @tap="$emit('saveHD')"
      >
        <text class="mr-2">📥</text> 保存高清大图
      </button>
      
      <!-- Secondary Action -->
      <button 
        class="bg-white/20 border border-white/30 w-full h-14 rounded-full font-semibold text-sm tracking-widest text-white active:scale-95 transition-all flex items-center justify-center backdrop-blur-md"
        @tap="$emit('share')"
      >
        <text class="mr-2">🌈</text> 分享给朋友
      </button>
      
      <view class="pt-4 flex justify-center" @tap="$emit('goHome')">
        <text class="text-white/60 text-[10px] uppercase tracking-widest font-bold border-b border-white/20 pb-1">再玩一次</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  resultImage?: string;
  originalImage?: string;
  styleName?: string;
  hasPaid?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  resultImage: '',
  originalImage: '',
  styleName: 'Unknown',
  hasPaid: false,
});

const defaultImg = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYIrlSJt1LdAFrSBBwy2ZrE8pKkcZ3tlUt9A&s";
defineEmits(['saveHD', 'share', 'goHome']);
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.8s ease-out forwards;
}
@keyframes fadeIn {
    0% { opacity: 0; transform: translateY(10px); }
    100% { opacity: 1; transform: translateY(0); }
}
</style>