<template>
  <view class="w-full">
    <!-- Empty State: Upload Area -->
    <view 
      v-if="!image"
      class="w-full aspect-[4/3] rounded-3xl border-[3px] border-dashed border-brand-orange/30 bg-surface-muted flex flex-col items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] active:bg-brand-orange/5"
      @tap="chooseImage"
    >
      <!-- Cute Cat Icon -->
      <view class="w-20 h-20 rounded-full bg-white shadow-card flex items-center justify-center animate-float-slow">
        <text class="text-4xl">🐱</text>
      </view>
      <text class="text-ink font-bold text-base mt-1">点击上传萌宠照片</text>
      <text class="text-ink-tertiary text-xs">支持拍照或从相册选择 · 正脸效果最佳</text>
    </view>
    
    <!-- Filled State: Preview -->
    <view v-else class="w-full aspect-[4/3] rounded-3xl overflow-hidden relative shadow-card group">
      <image :src="image" mode="aspectFill" class="w-full h-full" />
      
      <!-- Gradient overlay at bottom -->
      <view class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent"></view>
      
      <!-- Delete Button -->
      <view 
        @tap="removeImage" 
        class="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur flex items-center justify-center active:scale-90 transition-transform"
      >
        <text class="text-white text-lg font-light">✕</text>
      </view>
      
      <!-- Re-select hint -->
      <view class="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <text class="text-xs">📷</text>
        <text class="text-ink-secondary text-xs font-semibold" @tap="chooseImage">重新选择</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  image: string | null;
}>();

const emit = defineEmits(['update:image']);

const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      emit('update:image', res.tempFilePaths[0]);
    }
  });
};

const removeImage = () => {
  emit('update:image', null);
};
</script>
