<template>
  <view class="capsule">
    <view class="dots">
      <view></view>
      <view></view>
      <view></view>
    </view>
    <view class="divider"></view>
    <view class="circle"></view>
  </view>
</template>

<style scoped lang="scss">
.capsule {
  width: 154rpx;
  height: 58rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.15);
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(9, 12, 18, 0.46);
}

.dots {
  display: flex;
  gap: 7rpx;
  align-items: center;
}

.dots view {
  width: 7rpx;
  height: 7rpx;
  border-radius: 50%;
  background: #fff;
}

.divider {
  width: 1rpx;
  height: 28rpx;
  margin: 0 22rpx;
  background: rgba(255, 255, 255, 0.18);
}

.circle {
  width: 28rpx;
  height: 28rpx;
  border: 4rpx solid #fff;
  border-radius: 50%;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 9rpx;
    height: 9rpx;
    border-radius: 50%;
    background: #fff;
    transform: translate(-50%, -50%);
  }
}
</style>
