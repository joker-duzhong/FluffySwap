<template>
  <view class="min-h-screen bg-brand-primary flex flex-col relative overflow-hidden pb-12">

    <!-- Background Decorative Elements -->
    <view class="absolute inset-0 pointer-events-none">
      <view class="absolute top-0 right-[-10%] w-[120%] h-[70%] bg-white/10 rounded-full blur-[100px]"></view>
      <view class="absolute bottom-[-10%] left-[-20%] w-[100%] h-[60%] bg-indigo-400/20 rounded-full blur-[80px]">
      </view>
    </view>

    <!-- Top Bar -->
    <view class="pt-12 px-8 flex items-center justify-between mb-8 z-10">
      <view @tap="$emit('goHome')"
        class="w-10 h-10 rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center active:scale-90 transition-transform backdrop-blur-sm">
        <text class="text-white text-sm">←</text>
      </view>
      <text class="text-white font-bold tracking-widest text-xs uppercase opacity-80">作品详情</text>
      <view class="w-10"></view>
    </view>

    <!-- Title Area (Design Theme) -->
    <view class="px-8 mb-6 animate-fade-in z-10 text-center">
      <text class="text-2xl font-bold text-white block mb-1 drop-shadow-md">萌宠变身成功</text>
      <text class="text-white/80 text-xs font-light uppercase tracking-widest">{{ styleName }} 风格</text>
    </view>

    <!-- Result Image Card -->
    <view class="px-8 mb-8 animate-fade-in z-10 flex-shrink-0">
      <view class="relative rounded-[32px] overflow-hidden shadow-2xl border-[6px] border-white/20 bg-black/20">
        <!-- Main Result -->
        <view class="image-container" @tap="previewImage">
          <image
            :src="showOriginal ? (originalImage || resultImage || defaultImg) : (resultImage || defaultImg)"
            mode="widthFix"
            class="w-full result-image"
            :class="{ 'image-switching': isSwitching }"
            @load="onImageLoad"
            @error="onImageError"
          />
        </view>

        <!-- Watermark Overlay (Minimal) -->
        <view v-if="!hasPaid && !showOriginal" class="absolute inset-x-0 bottom-4 flex items-center justify-center pointer-events-none">
          <text class="text-white/40 text-[10px] tracking-[0.5em] uppercase font-black">AI 萌宠换脸秀</text>
        </view>

        <!-- Share Button (Top Right) -->
        <view class="absolute top-3 right-3 z-20" @tap="handleShareClick">
          <view class="share-btn animate-pulse-share">
            <text class="text-lg">🚀</text>
          </view>
        </view>

        <!-- Original Image Toggle Button (Bottom Left) -->
        <view class="absolute bottom-3 left-3 z-20" @tap="toggleOriginal">
          <view class="compare-btn" :class="{ 'compare-btn-active': showOriginal }">
            <view class="compare-icon">
              <view class="compare-icon-left"></view>
              <view class="compare-icon-divider"></view>
              <view class="compare-icon-right"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Actions -->
    <view class="px-8 space-y-4 z-10 mt-auto">

      <!-- Primary Action -->
      <button
        class="bg-white w-full h-14 rounded-full font-bold text-sm tracking-widest text-brand-primary shadow-lg active:scale-95 transition-all flex items-center justify-center border-none"
        @tap="handleSaveHD">
        <text class="mr-2">📥</text> 保存高清大图
      </button>

      <!-- Play Again Button (Optimized) -->
      <view class="pt-2 flex justify-center" @tap="$emit('goHome')">
        <view
          class="flex items-center gap-2 py-3 px-6 rounded-full bg-white/10 border border-white/20 active:scale-95 transition-all">
          <text class="text-lg">✨</text>
          <text class="text-white font-semibold text-sm tracking-wider">再玩一次</text>
          <text class="text-lg">✨</text>
        </view>
      </view>
    </view>

    <!-- 分享弹窗 (小程序) -->
    <view v-if="showSharePopup" class="share-popup-overlay" @tap="showSharePopup = false">
      <view class="share-popup" @tap.stop>
        <view class="share-popup-title">分享到</view>
        <view class="share-popup-options">
          <!-- 分享给朋友：使用 button open-type="share" -->
          <button class="share-option-btn" open-type="share">
            <view class="share-option-icon">💬</view>
            <text class="share-option-text">微信好友</text>
          </button>
          <!-- 分享到朋友圈：引导用户 -->
          <view class="share-option-btn" @tap="showTimelineTip">
            <view class="share-option-icon">🔄</view>
            <text class="share-option-text">朋友圈</text>
          </view>
        </view>
        <view class="share-popup-cancel" @tap="showSharePopup = false">取消</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

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

defineEmits(['saveHD', 'share', 'goHome']);

const defaultImg = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYIrlSJt1LdAFrSBBwy2ZrE8pKkcZ3tlUt9A&s";

const imageLoaded = ref(false);
const showSharePopup = ref(false);
const showOriginal = ref(false);
const isSwitching = ref(false);

const onImageLoad = () => {
  imageLoaded.value = true;
};

const onImageError = () => {
  console.warn('Image load failed');
};

/** 切换原图/效果图 */
const toggleOriginal = () => {
  isSwitching.value = true;
  showOriginal.value = !showOriginal.value;
  setTimeout(() => {
    isSwitching.value = false;
  }, 300);
};

/** 检测是否为 H5 环境（小程序没有 document） */
const isH5 = (): boolean => {
  // @ts-ignore
  return typeof document !== 'undefined';
};

/** 点击图片全屏预览 */
const previewImage = () => {
  if (!props.resultImage) return;
  uni.previewImage({
    urls: [props.resultImage],
    current: props.resultImage,
  });
};

/** 保存高清大图 */
const handleSaveHD = () => {
  if (!props.resultImage) return;

  if (isH5()) {
    // H5 环境：提示用户长按保存
    uni.showModal({
      title: '保存图片',
      content: '请长按图片，在弹出的菜单中选择"保存图片"即可保存到手机相册',
      showCancel: false,
      confirmText: '我知道了',
    });
  } else {
    // 小程序环境：下载并保存到相册
    uni.showLoading({ title: '保存中...' });
    uni.downloadFile({
      url: props.resultImage,
      success: (res) => {
        if (res.statusCode === 200) {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              uni.hideLoading();
              uni.showToast({ title: '已保存到相册', icon: 'success' });
            },
            fail: (err) => {
              uni.hideLoading();
              // 可能是没有授权
              if (err.errMsg.includes('auth deny')) {
                uni.showModal({
                  title: '提示',
                  content: '需要您授权保存图片到相册',
                  confirmText: '去授权',
                  success: (res) => {
                    if (res.confirm) {
                      uni.openSetting();
                    }
                  }
                });
              } else {
                uni.showToast({ title: '保存失败', icon: 'none' });
              }
            }
          });
        } else {
          uni.hideLoading();
          uni.showToast({ title: '下载失败', icon: 'none' });
        }
      },
      fail: () => {
        uni.hideLoading();
        uni.showToast({ title: '下载失败', icon: 'none' });
      }
    });
  }
};

/** 点击分享按钮 */
const handleShareClick = () => {
  if (!props.resultImage) return;

  if (isH5()) {
    // H5 环境：复制链接
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      uni.showToast({ title: '链接已复制', icon: 'success' });
    }).catch(() => {
      uni.showToast({ title: '复制失败', icon: 'none' });
    });
  } else {
    // 小程序环境：显示分享弹窗
    showSharePopup.value = true;
  }
};

/** 显示朋友圈分享提示 */
const showTimelineTip = () => {
  showSharePopup.value = false;
  uni.showModal({
    title: '分享到朋友圈',
    content: '请点击右上角「...」按钮，选择「分享到朋友圈」',
    showCancel: false,
    confirmText: '我知道了',
  });
};
</script>

<style scoped>
.image-container {
  width: 100%;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-image {
  width: 100% !important;
  display: block;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.share-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B81 0%, #FF8C42 50%, #FFAA6B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(255, 107, 129, 0.5);
}

.animate-pulse-share {
  animation: pulseShare 1.5s ease-in-out infinite;
}

@keyframes pulseShare {

  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 4px 15px rgba(255, 107, 129, 0.5);
  }

  50% {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(255, 107, 129, 0.7);
  }
}

/* 分享弹窗样式 */
.share-popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.share-popup {
  width: 100%;
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
}

.share-popup-title {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.share-popup-options {
  display: flex;
  justify-content: space-around;
  padding: 10px 0;
}

.share-option-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: transparent;
  border: none;
  padding: 10px 20px;
  margin: 0;
}

.share-option-btn::after {
  border: none;
}

.share-option-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 8px;
}

.share-option-text {
  font-size: 12px;
  color: #666;
}

.share-popup-cancel {
  margin-top: 20px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 24px;
  font-size: 16px;
  color: #666;
}

/* 原图对比按钮样式 */
.compare-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.compare-btn:active {
  transform: scale(0.9);
}

.compare-btn-active {
  background: rgba(255, 140, 66, 0.9);
  border-color: rgba(255, 255, 255, 0.4);
}

.compare-icon {
  display: flex;
  align-items: center;
  gap: 3px;
}

.compare-icon-left,
.compare-icon-right {
  width: 8px;
  height: 14px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
}

.compare-icon-divider {
  width: 2px;
  height: 18px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1px;
}

.compare-btn-active .compare-icon-left,
.compare-btn-active .compare-icon-right {
  background: rgba(255, 255, 255, 0.95);
}

.compare-btn-active .compare-icon-divider {
  background: rgba(255, 255, 255, 0.8);
}

/* 图片切换动画 */
.image-switching {
  animation: imageSwitch 0.3s ease;
}

@keyframes imageSwitch {
  0% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
