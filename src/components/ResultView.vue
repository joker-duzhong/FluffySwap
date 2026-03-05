<template>
  <view class="min-h-screen flex flex-col pb-10 relative overflow-hidden">
    
    <!-- Decorative elements -->
    <view class="absolute top-0 right-0 w-60 h-60 blob-orange rounded-full opacity-40"></view>
    <view class="absolute bottom-40 left-0 w-40 h-40 blob-lavender rounded-full opacity-30"></view>

    <!-- Top Bar -->
    <view class="flex items-center justify-between px-5 pt-14 pb-4 relative z-10">
      <view @tap="$emit('goHome')" class="w-10 h-10 rounded-2xl bg-white shadow-card flex items-center justify-center active:scale-90 transition-transform">
        <text class="text-ink text-lg">←</text>
      </view>
      <text class="text-ink font-extrabold text-lg">变身完成</text>
      <view class="w-10"></view>
    </view>
    
    <!-- Celebration Title -->
    <view class="text-center px-6 mb-6 animate-fade-in-up relative z-10">
      <text class="text-3xl mb-2 block">🎉</text>
      <text class="block text-2xl font-extrabold text-ink tracking-tight">当当！生成完毕！</text>
      <text class="block text-ink-secondary text-sm mt-2">{{ styleName }} · 专属魔法作品</text>
    </view>
    
    <!-- Result Image Card -->
    <view class="px-5 mb-6 animate-fade-in-up relative z-10" style="animation-delay: 0.15s">
      <view class="card-base overflow-hidden shadow-card-hover">
        <!-- Main Result -->
        <view class="w-full aspect-[3/4] relative bg-surface-muted">
          <image :src="resultImage" mode="aspectFill" class="w-full h-full" />
          
          <!-- Watermark -->
          <view v-if="!hasPaid" class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <view class="transform rotate-[-25deg] opacity-15">
              <text class="text-white text-4xl font-black tracking-[0.3em] drop-shadow-lg">FluffySwap</text>
            </view>
          </view>
          
          <!-- Style badge -->
          <view class="absolute bottom-3 left-3 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full">
            <text class="text-white text-xs font-bold">{{ styleName }}</text>
          </view>
        </view>
        
        <!-- Before / After comparison strip -->
        <view class="p-4 flex items-center gap-4 border-t border-ink/5">
          <view class="w-14 h-14 rounded-2xl overflow-hidden shadow-card flex-shrink-0 border-2 border-white">
            <image :src="originalImage" mode="aspectFill" class="w-full h-full" />
          </view>
          <view class="flex-1">
            <text class="block text-ink font-bold text-sm">原图对比</text>
            <text class="block text-ink-tertiary text-xs mt-0.5">左边是原始萌照哦 →</text>
          </view>
          <view class="text-2xl animate-wiggle">🐾</view>
        </view>
      </view>
    </view>
    
    <!-- Action Buttons -->
    <view class="px-5 space-y-3 mt-auto animate-fade-in-up relative z-10" style="animation-delay: 0.3s">
      
      <!-- Primary: Save HD -->
      <view class="btn-primary" @tap="$emit('saveHD')">
        <text class="text-xl mr-2">💾</text>
        <text>保存高清大图</text>
      </view>
      
      <!-- Secondary: Share -->
      <view class="btn-secondary" @tap="$emit('share')">
        <text class="text-xl mr-2">📱</text>
        <text>分享到小红书</text>
      </view>
      
      <!-- Tertiary: Redo -->
      <view class="flex items-center justify-center py-4" @tap="$emit('goHome')">
        <text class="text-ink-tertiary text-sm font-medium">不满意？再来一次 🔄</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  resultImage: string;
  originalImage: string;
  styleName: string;
  hasPaid: boolean;
}>();

defineEmits(['saveHD', 'share', 'goHome']);
</script>
