<template>
  <view class="phone-shell">

    <!-- ========== State 1: Home ========== -->
    <view v-if="store.currentStep === 'home'">
      <HomeView @next="goToStyleSelect" />
    </view>

    <!-- ========== State 2: Style Select ========== -->
    <view v-else-if="store.currentStep === 'styleSelect'">
      <StyleSelectView :styles="styleList" :selectedId="store.selectedStyle?.id ?? null" @select="onStyleSelect"
        @confirm="handleGenerate" @back="store.goTo('home')" />
    </view>

    <!-- ========== State 3: Loading ========== -->
    <view v-else-if="store.currentStep === 'loading'">
      <LoadingState :petImage="store.originalImage!" :styleName="store.selectedStyle?.name || ''" />
    </view>

    <!-- ========== State 4: Result ========== -->
    <view v-else-if="store.currentStep === 'result'">
      <ResultView :resultImage="store.resultImage!" :originalImage="store.originalImage!"
        :styleName="store.selectedStyle?.name || ''" :hasPaid="store.hasPaid" @saveHD="handleSaveHD"
        @share="handleShare" @goHome="handleReset" />
    </view>

  </view>
</template>

<script setup lang="ts">
import HomeView from '@/components/HomeView.vue';
import StyleSelectView from '@/components/StyleSelectView.vue';
import LoadingState from '@/components/LoadingState.vue';
import ResultView from '@/components/ResultView.vue';
import { usePetStore } from '@/stores/petStore';
import type { StyleItem } from '@/stores/petStore';
import { petAIService } from '@/services/petAIService';
import { prompts } from '@/config/prompt';

const store = usePetStore();
const styleList = prompts as StyleItem[];

// Navigation
const goToStyleSelect = () => {
  if (!store.originalImage) {
    uni.showToast({ title: '请先上传宠物照片', icon: 'none' });
    return;
  }
  store.goTo('styleSelect');
};

const onStyleSelect = (style: StyleItem) => {
  store.selectStyle(style);
};

// Generation
const handleGenerate = async () => {
  if (!store.originalImage || !store.selectedStyle) return;

  store.goTo('loading');

  try {
    const result = await petAIService.generateFaceSwap(
      store.originalImage,
      store.selectedStyle
    );
    if (result.success) {
      store.resultImage = result.imageUrl;
      store.goTo('result');
    } else {
      uni.showToast({ title: '生成失败: ' + (result.status || '请重试'), icon: 'none' });
      store.goTo('styleSelect');
    }
  } catch (e) {
    uni.showToast({ title: '生成失败，请重试', icon: 'none' });
    store.goTo('styleSelect');
  }
};

// Result actions
const handleSaveHD = async () => {
  if (!store.hasPaid) {
    uni.showLoading({ title: '解锁中...' });
    const res = await petAIService.processPayment();
    uni.hideLoading();
    if (res.success) {
      store.hasPaid = true;
      uni.showToast({ title: '解锁成功！已保存', icon: 'success' });
    }
  } else {
    uni.showToast({ title: '已保存到相册', icon: 'success' });
  }
};

const handleShare = () => {
  uni.showToast({ title: '已复制分享链接', icon: 'success' });
};

const handleReset = () => {
  store.reset();
};
</script>

<style lang="scss">
@import "@/styles/global.scss";
</style>
