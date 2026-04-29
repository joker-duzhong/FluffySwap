<template>
  <view class="phone-shell">
    <view class="min-h-screen bg-brand-primary relative overflow-hidden flex flex-col">

      <!-- Background Decorative Elements -->
      <view class="absolute inset-0 pointer-events-none">
        <view class="absolute top-0 right-[-10%] w-[120%] h-[70%] bg-white/10 rounded-full blur-[100px]"></view>
        <view class="absolute bottom-[-10%] left-[-20%] w-[100%] h-[60%] bg-indigo-400/20 rounded-full blur-[80px]"></view>
      </view>

      <!-- Content -->
      <view class="flex-1 flex flex-col z-10 px-8 pt-20 pb-10">

        <!-- Logo Area -->
        <view class="flex flex-col items-center mb-16">
          <view class="flex items-center gap-2 mb-4">
            <text class="text-white font-black tracking-widest text-lg italic">FLUFFY</text>
            <view class="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <text class="text-brand-primary text-xs">★</text>
            </view>
            <text class="text-white font-black tracking-widest text-lg italic">SWAP</text>
          </view>
          <text class="text-white/80 text-sm">AI 萌宠变身秀</text>
        </view>

        <!-- Main Content -->
        <view class="flex-1 flex flex-col justify-center">
          <view class="text-center mb-12">
            <text class="text-6xl mb-6 block">🎨</text>
            <text class="text-white font-bold text-2xl mb-3 block">欢迎使用</text>
            <text class="text-white/70 text-sm block leading-relaxed px-4">
              授权手机号后即可开始创作<br/>让你的爱宠变身艺术大片
            </text>
          </view>

          <!-- Phone Authorization Button -->
          <view class="px-4">
            <button
              v-if="!isLoading"
              class="w-full h-14 bg-white rounded-[28px] flex items-center justify-center shadow-2xl active:scale-95 transition-all border-none"
              open-type="getPhoneNumber"
              @getphonenumber="handleGetPhoneNumber">
              <text class="text-brand-primary font-semibold text-base">📱 授权手机号登录</text>
            </button>

            <view v-else class="w-full h-14 bg-white/90 rounded-[28px] flex items-center justify-center">
              <text class="text-brand-primary text-sm">登录中...</text>
            </view>
          </view>

          <!-- Tips -->
          <view class="mt-8 px-8">
            <text class="text-white/50 text-xs text-center block leading-relaxed">
              授权后我们将获取你的手机号用于账号登录<br/>我们承诺保护你的隐私安全
            </text>
          </view>
        </view>

        <!-- Skip Button (Optional) -->
        <view class="text-center mt-6">
          <text @tap="handleSkip" class="text-white/60 text-sm underline active:text-white/80">
            暂不登录，先看看
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { authService } from '@/api/auth';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const isLoading = ref(false);
const MINIAPP_APPID = 'wxb26e7039ef603dca';

const handleGetPhoneNumber = async (e: any) => {
  const { code, errMsg } = e.detail;

  if (!code) {
    uni.showToast({ title: '授权失败，请重试', icon: 'none' });
    return;
  }

  isLoading.value = true;

  try {
    const userInfo = await authService.miniappGetPhone({
      appid: MINIAPP_APPID,
      code,
    });

    userStore.setUser(userInfo);

    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500
    });

    setTimeout(() => {
      uni.navigateBack();
    }, 1500);

  } catch (error: any) {
    console.error('Phone authorization failed:', error);
    uni.showToast({
      title: error.message || '登录失败，请重试',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
  }
};

const handleSkip = () => {
  uni.navigateBack();
};
</script>

<style scoped>
/* 继承全局样式 */
</style>
