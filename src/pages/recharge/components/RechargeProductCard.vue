<template>
  <view class="plan-card" :class="{ active }" @click="$emit('select')">
    <view v-if="product.tag" class="recommend">{{ product.tag }}</view>
    <view class="points-bar">
      <image :src="ASSETS.iconSpark" mode="aspectFit" />
      <text>{{ durationLabel }}</text>
    </view>
    <view class="plan-body">
      <text class="name">{{ product.name }}</text>
      <view class="price-row">
        <text class="yen">¥</text>
        <text class="price">{{ formatMoney(product.price) }}</text>
      </view>
      <text v-if="product.original_price" class="original">¥{{ formatMoney(product.original_price) }}</text>
      <view v-else class="original-placeholder" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ASSETS } from '@/config/assets'
import type { ProductItem } from '@/services/aurakey'

const props = defineProps<{
  product: ProductItem
  active?: boolean
}>()

defineEmits<{
  select: []
}>()

const formatMoney = (cents: number) => {
  const value = cents / 100
  if (Number.isInteger(value)) {
    return String(value)
  }
  return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

const durationLabel = computed(() => {
  const product = props.product

  if (!product.valid_days) {
    return `${product.point_amount}`
  }

  if (product.valid_days % 30 === 0) {
    return `${product.point_amount}/${product.valid_days / 30}月`
  }

  return `${product.point_amount}/${product.valid_days}天`
})
</script>

<style scoped lang="scss">
.plan-card {
  position: relative;
  width: 232rpx;
  border-radius: 32rpx;
  border: 4rpx solid #433854;
  display: flex;
  flex-direction: column;
  background: #2d2638;
  box-sizing: border-box;
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
  }

  &.active {
    border-color: #e0caff;

    .points-bar {
      color: #1a1125;
      background: #e0caff;

      image {
        filter: brightness(0);
      }
    }
  }
}

.recommend {
  position: absolute;
  top: -32rpx;
  right: -24rpx;
  z-index: 20;
  padding: 8rpx 16rpx;
  border-radius: 22rpx 22rpx 8rpx 22rpx;
  color: #332a00;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 1;
  background: #fff199;
  white-space: nowrap;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.points-bar {
  width: 100%;
  padding: 16rpx 0;
  border-radius: 26rpx 26rpx 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: rgba(255, 255, 255, 0.9);
  font-size: 26rpx;
  font-weight: 500;
  line-height: 1;
  background: #433854;
  box-sizing: border-box;

  image {
    width: 26rpx;
    height: 26rpx;
  }

  text {
    max-width: 190rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.plan-body {
  flex: 1;
  width: 100%;
  padding: 32rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 0 0 26rpx 26rpx;
  background: #2d2638;
  box-sizing: border-box;
}

.name {
  color: rgba(255, 255, 255, 0.9);
  font-size: 26rpx;
  font-weight: 500;
}

.price-row {
  margin-top: 24rpx;
  display: flex;
  align-items: baseline;
  gap: 4rpx;
  color: #fff;
}

.yen {
  color: #fff;
  font-size: 28rpx;
  font-weight: 500;
}

.price {
  font-size: 56rpx;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}

.original {
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.4);
  font-size: 24rpx;
  line-height: 1;
  text-decoration: line-through;
}

.original-placeholder {
  height: 36rpx;
  margin-top: 8rpx;
}
</style>
