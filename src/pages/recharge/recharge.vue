<template>
  <view class="recharge-page">
    <image class="hero-bg" :src="ASSETS.vipHero" mode="aspectFill" />
    <AppStatusBar />
    <AppNavBar back @back="goBack">
      <template #right>
        <AppCapsule />
      </template>
    </AppNavBar>

    <view class="hero-content">
      <text class="title">会员中心·VIP</text>
      <text class="tag">限时7折</text>
      <text class="desc">早期限时活动专享7折优惠，补充灵感值，让高清度排版引擎持续为你工作。</text>
    </view>

    <view class="plans">
      <view
        v-for="product in vipProducts"
        :key="product.id"
        class="plan-card"
        :class="{ active: selectedProduct?.id === product.id }"
        @click="selectedProduct = product"
      >
        <view v-if="product.tag" class="recommend">{{ product.tag }}</view>
        <view class="points">
          <image :src="ASSETS.iconSpark" mode="aspectFit" />
          <text>{{ product.point_amount || getPlanPoints(product.name) }}/月</text>
        </view>
        <text class="name">{{ product.name }}</text>
        <view class="price-row">
          <text class="yen">¥</text>
          <text class="price">{{ formatYuan(product.price) }}</text>
        </view>
        <text v-if="product.original_price" class="original">¥{{ formatYuan(product.original_price) }}</text>
      </view>
    </view>

    <button class="open-btn" :disabled="!selectedProduct" @click="handlePay">开通会员</button>
    <text class="agreement">开通会员代表接受《会员协议》</text>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AppCapsule from '@/components/AppCapsule.vue'
import AppNavBar from '@/components/AppNavBar.vue'
import AppStatusBar from '@/components/AppStatusBar.vue'
import { ASSETS } from '@/config/assets'
import { useAuthStore } from '@/stores/authStore'
import { aurakeyApi, type ProductItem } from '@/services/aurakey'

const authStore = useAuthStore()
const products = ref<ProductItem[]>([])
const selectedProduct = ref<ProductItem | null>(null)

const vipProducts = computed(() => {
  const list = products.value.filter((item) => item.type === 'vip')
  return list.length > 0 ? list : products.value
})

const goBack = () => uni.navigateBack()

const formatYuan = (fen: number) => {
  const yuan = fen / 100
  return Number.isInteger(yuan) ? yuan.toFixed(0) : yuan.toFixed(1)
}

const getPlanPoints = (name: string) => {
  if (name.includes('高级')) return 800
  if (name.includes('专业')) return 260
  return 100
}

const loadProducts = async () => {
  try {
    products.value = await aurakeyApi.store.products()
    selectedProduct.value = vipProducts.value[0] || null
  } catch (error: any) {
    uni.showToast({ title: error.message || '加载失败', icon: 'none' })
  }
}

const handlePay = async () => {
  if (!selectedProduct.value) return
  const openid = authStore.userProfile?.openid
  if (!openid) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }

  try {
    uni.showLoading({ title: '创建订单...' })
    const order = await aurakeyApi.order.create(selectedProduct.value.id, openid)
    uni.hideLoading()
    const paymentOptions = {
      ...order.pay_params,
      success: () => {
        uni.showToast({ title: '支付成功', icon: 'success' })
      },
      fail: () => {
        uni.showToast({ title: '支付未完成', icon: 'none' })
      },
    } as unknown as UniApp.RequestPaymentOptions
    uni.requestPayment(paymentOptions)
  } catch (error: any) {
    uni.hideLoading()
    uni.showToast({ title: error.message || '支付失败', icon: 'none' })
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped lang="scss">
.recharge-page {
  position: relative;
  min-height: 100vh;
  background: #150d20;
  color: #fff;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 520rpx;
}

.hero-content {
  position: relative;
  z-index: 1;
  margin-top: 260rpx;
  padding: 0 48rpx;
  text-align: center;
}

.title {
  display: inline;
  color: rgba(255, 255, 255, 0.9);
  font-size: 38rpx;
  font-weight: 800;
}

.tag {
  display: inline-flex;
  margin-left: 10rpx;
  padding: 7rpx 10rpx;
  border-radius: 8rpx;
  color: #3b2b00;
  font-size: 22rpx;
  font-weight: 700;
  background: #fff39a;
}

.desc {
  display: block;
  margin-top: 28rpx;
  color: rgba(255, 255, 255, 0.64);
  font-size: 26rpx;
  line-height: 1.55;
}

.plans {
  position: relative;
  z-index: 1;
  margin: 62rpx 38rpx 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.plan-card {
  position: relative;
  height: 190rpx;
  padding-top: 18rpx;
  border-radius: 18rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.13);

  &.active {
    border-color: #e3c8ff;
    background: rgba(223, 198, 255, 0.18);
  }
}

.recommend {
  position: absolute;
  top: -34rpx;
  right: 8rpx;
  padding: 7rpx 12rpx;
  border-radius: 8rpx 8rpx 8rpx 0;
  color: #2f2600;
  font-size: 22rpx;
  font-weight: 700;
  background: #fff39a;
}

.points {
  height: 34rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #fff;
  font-size: 24rpx;

  image {
    width: 22rpx;
    height: 22rpx;
  }
}

.name {
  margin-top: 20rpx;
  color: rgba(255, 255, 255, 0.74);
  font-size: 24rpx;
}

.price-row {
  margin-top: 18rpx;
  display: flex;
  align-items: baseline;
}

.yen {
  font-size: 26rpx;
}

.price {
  font-size: 44rpx;
  font-weight: 800;
}

.original {
  margin-top: 4rpx;
  color: rgba(255, 255, 255, 0.32);
  font-size: 22rpx;
  text-decoration: line-through;
}

.open-btn {
  position: relative;
  z-index: 1;
  height: 96rpx;
  margin: 58rpx 38rpx 0;
  border-radius: 18rpx;
  color: #111;
  font-size: 30rpx;
  font-weight: 800;
  background: linear-gradient(90deg, #dcefff, #f4defd);
}

.agreement {
  display: block;
  margin-top: 24rpx;
  color: rgba(255, 255, 255, 0.45);
  font-size: 24rpx;
  text-align: center;
}
</style>
