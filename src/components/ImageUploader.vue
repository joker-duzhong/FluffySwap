<template>
  <view class="w-full">
    <!-- Empty State: Upload Area -->
    <view 
      v-if="!image"
      class="w-full h-24 rounded-[30px] border-[2px] border-dashed border-white/40 flex items-center px-6 gap-4 transition-all duration-300 active:scale-[0.98] active:bg-white/5 box-border"
      @tap="chooseImage"
    >
      <view class="w-12 h-12 rounded-full bg-indigo-200/20 backdrop-blur-md flex items-center justify-center shrink-0">
        <text class="text-2xl">📸</text>
      </view>
      <view class="flex flex-col flex-1 min-w-0">
          <text class="text-white font-bold text-sm tracking-wide">上传爱宠照片</text>
          <text class="text-white/60 text-[10px] uppercase tracking-widest mt-0.5 truncate">让它变身超级明星</text>
      </view>
    </view>
    
    <!-- Filled State -->
    <view v-else class="w-full h-24 rounded-[30px] overflow-hidden relative shadow-lg group flex items-center px-4 bg-white/20 backdrop-blur-lg border border-white/30 box-border">
        <image :src="image" mode="aspectFill" class="w-14 h-14 rounded-2xl shrink-0" />
        
        <view class="ml-4 flex-1 min-w-0">
            <text class="text-white font-bold text-sm">照片已上传</text>
            <text class="text-white/60 text-[10px] uppercase tracking-widest mt-0.5 truncate" @tap="chooseImage">点击更换照片</text>
        </view>
      
        <!-- Delete Button -->
        <view 
            @tap.stop="removeImage" 
            class="w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center active:scale-90 transition-transform"
        >
            <text class="text-white text-sm font-light">✕</text>
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