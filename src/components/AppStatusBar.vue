<template>
  <view class="status-bar">
    <text class="time">9:41</text>
    <view class="signals">
      <view class="signal-bars">
        <view class="bar bar-1"></view>
        <view class="bar bar-2"></view>
        <view class="bar bar-3"></view>
      </view>
      <view class="wifi"></view>
      <view class="battery">
        <view class="battery-level"></view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.status-bar {
  height: 74rpx;
  padding: 28rpx 38rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
}

.time {
  font-size: 28rpx;
  line-height: 1;
  font-weight: 700;
}

.signals {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.signal-bars {
  display: flex;
  align-items: flex-end;
  gap: 3rpx;
}

.bar {
  width: 5rpx;
  border-radius: 3rpx;
  background: #fff;
}

.bar-1 {
  height: 10rpx;
}

.bar-2 {
  height: 14rpx;
}

.bar-3 {
  height: 18rpx;
}

.wifi {
  width: 20rpx;
  height: 14rpx;
  border: 4rpx solid #fff;
  border-left-color: transparent;
  border-right-color: transparent;
  border-bottom: 0;
  border-radius: 20rpx 20rpx 0 0;
}

.battery {
  width: 42rpx;
  height: 20rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 5rpx;
  padding: 2rpx;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: -7rpx;
    top: 5rpx;
    width: 4rpx;
    height: 8rpx;
    border-radius: 0 3rpx 3rpx 0;
    background: rgba(255, 255, 255, 0.9);
  }
}

.battery-level {
  width: 28rpx;
  height: 100%;
  border-radius: 3rpx;
  background: #fff;
}
</style>
