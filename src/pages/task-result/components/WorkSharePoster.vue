<template>
  <view class="poster-mask" @click="$emit('close')">
    <view class="poster-wrap" @click.stop>
      <view class="poster-card">
        <image class="work-image" :src="imageUrl" mode="aspectFill" />
        <view class="content">
          <text class="title">灵钥创作海报</text>
          <text class="prompt">{{ prompt || 'AI 生成作品' }}</text>
          <view class="footer">
            <view>
              <text class="brand">AuraKey</text>
              <text class="desc">扫码体验同款创作</text>
            </view>
            <QrCodeGrid :value="qrValue" :size="132" />
          </view>
        </view>
      </view>
      <view class="actions">
        <button @click="$emit('close')">关闭</button>
        <button class="primary" @click="savePoster">保存海报</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import QrCodeGrid from '@/components/QrCodeGrid.vue'

const props = defineProps<{
  imageUrl: string
  prompt: string
  taskId: string
}>()

defineEmits<{
  (event: 'close'): void
}>()

const qrValue = `aurakey://work?taskId=${encodeURIComponent(props.taskId || '')}`

const savePoster = () => {
  uni.showToast({ title: '作品海报保存能力待接入小程序画布', icon: 'none' })
}
</script>

<style scoped lang="scss">
.poster-mask {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.72);
}

.poster-wrap {
  width: 620rpx;
}

.poster-card {
  overflow: hidden;
  border-radius: 28rpx;
  background: linear-gradient(180deg, #f7f7ff, #e9f6ff);
}

.work-image {
  width: 100%;
  height: 620rpx;
  display: block;
  background: #111;
}

.content {
  padding: 30rpx;
}

.title,
.prompt,
.brand,
.desc {
  display: block;
}

.title {
  color: #17172c;
  font-size: 34rpx;
  font-weight: 900;
}

.prompt {
  height: 76rpx;
  margin-top: 14rpx;
  color: rgba(23, 23, 44, 0.62);
  font-size: 24rpx;
  line-height: 1.5;
  overflow: hidden;
}

.footer {
  margin-top: 28rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.brand {
  color: #6b5cff;
  font-size: 32rpx;
  font-weight: 900;
}

.desc {
  margin-top: 8rpx;
  color: rgba(23, 23, 44, 0.52);
  font-size: 22rpx;
}

.actions {
  margin-top: 20rpx;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;

  button {
    height: 82rpx;
    border-radius: 18rpx;
    color: #fff;
    font-size: 28rpx;
    background: rgba(255, 255, 255, 0.14);
  }

  .primary {
    background: linear-gradient(180deg, #5a64ff, #3e98ff);
  }
}
</style>
