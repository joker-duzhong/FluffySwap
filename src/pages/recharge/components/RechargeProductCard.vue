<template>
  <view class="plan-card" :class="{ active }" @click="$emit('select')">
    <view v-if="product.tag" class="recommend">{{ product.tag }}</view>
    <view class="points-bar">
      <image :src="ASSETS.iconSpark" mode="aspectFit" />
      <text>{{ formatProductBenefit }}</text>
    </view>
    <view class="plan-body">
      <text class="name">{{ product.name }}</text>
      <text v-if="formatValidDays" class="valid-days">{{ formatValidDays }}</text>
      <view class="price-row">
        <text class="yen">¥</text>
        <text class="price">{{ formatYuan(product.price) }}</text>
      </view>
      <text v-if="product.original_price" class="original">¥{{ formatYuan(product.original_price) }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ASSETS } from '@/config/assets'
import { useAppStore } from '@/stores/appStore'
import type { ProductItem } from '@/services/aurakey'

const props = defineProps<{
  product: ProductItem
  active?: boolean
}>()

defineEmits<{
  select: []
}>()

const appStore = useAppStore()

const formatYuan = (fen: number) => {
  const yuan = fen / 100
  return Number.isInteger(yuan) ? yuan.toFixed(0) : yuan.toFixed(1)
}

const getProductPoints = (product: ProductItem) => Number(product.point_amount || 0) + Number(product.bonus_amount || 0)

const formatProductBenefit = computed(() => {
  const product = props.product
  const points = getProductPoints(product)
  if (product.type === 'vip') {
    const levelText = product.vip_level ? `Lv.${product.vip_level}` : ''
    const typeText = product.vip_type || 'VIP'
    return `${typeText}${levelText ? ` ${levelText}` : ''} · ${points}灵感值`
  }
  return `${points}灵感值`
})

const formatValidDays = computed(() => {
  const product = props.product
  const days = product.valid_days ?? (
    product.type === 'vip'
      ? appStore.systemConfig.default_vip_valid_days
      : appStore.systemConfig.default_point_pack_valid_days
  )
  if (!days) return product.type === 'point_pack' ? '长期有效' : ''
  return `${days}天有效`
})
</script>

<style scoped lang="scss">
.plan-card {
  position: relative;
  border-radius: 24rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.16);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #2c2535;
  box-sizing: border-box;

  &.active {
    border-color: #d8c0ff;
    background: #261c31;

    .points-bar {
      color: #13071f;
      background: #d4c0ff;

      image {
        filter: brightness(0);
      }
    }

    .price-row,
    .yen {
      color: #d7c2ff;
    }
  }
}

.recommend {
  position: absolute;
  top: -38rpx;
  right: -4rpx;
  z-index: 2;
  height: 40rpx;
  padding: 0 12rpx;
  border-radius: 8rpx 8rpx 8rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2f2600;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 40rpx;
  background: #fff39a;
}

.points-bar {
  width: 100%;
  height: 58rpx;
  border-radius: 20rpx 20rpx 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  color: rgba(255, 255, 255, 0.92);
  font-size: 24rpx;
  line-height: 34rpx;
  background: rgba(255, 255, 255, 0.13);
  box-sizing: border-box;

  image {
    width: 22rpx;
    height: 22rpx;
  }

  text {
    max-width: 190rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.plan-body {
  width: 100%;
  padding-top: 28rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.name {
  color: rgba(255, 255, 255, 0.86);
  font-size: 24rpx;
  line-height: 34rpx;
}

.valid-days {
  margin-top: 6rpx;
  color: rgba(255, 255, 255, 0.42);
  font-size: 20rpx;
  line-height: 28rpx;
}

.price-row {
  margin-top: 10rpx;
  display: flex;
  align-items: baseline;
  color: #fff;
}

.yen {
  margin-right: 8rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 38rpx;
}

.price {
  font-size: 50rpx;
  font-weight: 800;
  line-height: 58rpx;
}

.original {
  margin-top: 4rpx;
  color: rgba(255, 255, 255, 0.32);
  font-size: 22rpx;
  line-height: 30rpx;
  text-decoration: line-through;
}
</style>
