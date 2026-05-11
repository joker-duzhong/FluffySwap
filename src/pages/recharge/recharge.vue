<template>
  <view class="recharge-page">
    <image class="hero-bg" :src="ASSETS.vipHero" mode="aspectFill" />
    <AppTopNav back @back="goBack" />

    <view class="hero-content">
      <text class="title">会员中心·VIP</text>
      <text class="tag">限时7折</text>
      <text class="desc">早期限时活动专享7折优惠，补充灵感值，让高清度排版引擎持续为你工作。</text>
    </view>

    <PageSkeleton v-if="loading" class="plans-skeleton" variant="grid" :rows="3" />
    <view v-else class="plans">
      <view v-for="product in vipProducts" :key="product.id" class="plan-card"
        :class="{ active: selectedProduct?.id === product.id }" @click="selectedProduct = product">
        <view v-if="product.tag" class="recommend">{{ product.tag }}</view>
        <view class="points-bar">
          <image :src="ASSETS.iconSpark" mode="aspectFit" />
          <text>{{ product.point_amount || getPlanPoints(product.name) }}/月</text>
        </view>
        <view class="plan-body">
          <text class="name">{{ product.name }}</text>
          <view class="price-row">
            <text class="yen">¥</text>
            <text class="price">{{ formatYuan(product.price) }}</text>
          </view>
          <text v-if="product.original_price" class="original">¥{{ formatYuan(product.original_price) }}</text>
        </view>
      </view>
    </view>

    <button class="open-btn" :disabled="!selectedProduct || paying" :loading="paying" @click="handlePay">
      {{ paying ? '处理中' : '开通会员' }}
    </button>
    <text class="agreement">开通会员代表接受《会员协议》</text>
    <LoginSheet v-if="showLoginSheet" @close="showLoginSheet = false" @logged-in="showLoginSheet = false" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import { ASSETS } from '@/config/assets'
import { useAuthStore } from '@/stores/authStore'
import { aurakeyApi, type ProductItem } from '@/services/aurakey'
import LoginSheet from '@/pages/index/components/LoginSheet.vue'

const authStore = useAuthStore()
const products = ref<ProductItem[]>([])
const selectedProduct = ref<ProductItem | null>(null)
const paymentOpenid = ref('')
const showLoginSheet = ref(false)
const loading = ref(false)
const paying = ref(false)

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
  loading.value = true
  try {
    const productData = await aurakeyApi.store.products();
    products.value = productData.items
    paymentOpenid.value = authStore.userProfile?.openid || ''
    selectedProduct.value = vipProducts.value[0] || null
  } catch (error: any) {
    uni.showToast({ title: error.message || '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const requestPayment = (payParams: Record<string, any>) =>
  new Promise<void>((resolve, reject) => {
    uni.requestPayment({
      ...payParams,
      success: () => resolve(),
      fail: reject,
    } as unknown as UniApp.RequestPaymentOptions)
  })

const isPaidStatus = (status: string) => ['paid', 'success', 'finished', 'completed'].includes(status.toLowerCase())

const confirmOrderPaid = async (orderNo: string) => {
  for (let index = 0; index < 3; index += 1) {
    const orderStatus = await aurakeyApi.order.status(orderNo)
    if (isPaidStatus(orderStatus.status)) return
    if (index < 2) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }
}

const handlePay = async () => {
  if (!selectedProduct.value) return
  if (!authStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    showLoginSheet.value = true
    return
  }
  if (!paymentOpenid.value) {
    uni.showToast({ title: '获取支付信息失败，请稍后重试', icon: 'none' })
    return
  }

  paying.value = true
  try {
    const order = await aurakeyApi.order.create(selectedProduct.value.id, paymentOpenid.value)
    await requestPayment(order.pay_params)
    await confirmOrderPaid(order.order_no)
    const profile = await aurakeyApi.user.profile()
    authStore.setUserProfile(profile)
    uni.showToast({ title: '支付成功', icon: 'success' })
  } catch (error: any) {
    uni.showToast({ title: error?.errMsg?.includes('cancel') ? '支付未完成' : error.message || '支付失败', icon: 'none' })
  } finally {
    paying.value = false
  }
}

const handleLoginRequired = () => {
  authStore.clearAuth()
  showLoginSheet.value = true
}

onMounted(() => {
  uni.$on('auth:login-required', handleLoginRequired)
  loadProducts()
})

onUnmounted(() => {
  uni.$off('auth:login-required', handleLoginRequired)
})
</script>

<style scoped lang="scss">
.recharge-page {
  position: relative;
  min-height: 100vh;
  background: #12071b;
  color: #fff;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 536rpx;
}

.hero-content {
  position: relative;
  z-index: 1;
  margin-top: 248rpx;
  padding: 0 54rpx;
  text-align: center;
}

.title {
  display: inline;
  color: rgba(255, 255, 255, 0.9);
  font-size: 40rpx;
  font-weight: 800;
  line-height: 54rpx;
}

.tag {
  display: inline-flex;
  margin-left: 12rpx;
  padding: 5rpx 10rpx 6rpx;
  border-radius: 8rpx;
  color: #3b2b00;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 30rpx;
  background: #fff39a;
}

.desc {
  display: block;
  margin-top: 22rpx;
  color: rgba(255, 255, 255, 0.64);
  font-size: 26rpx;
  line-height: 40rpx;
}

.plans {
  position: relative;
  z-index: 1;
  margin: 52rpx 46rpx 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.plans-skeleton {
  position: relative;
  z-index: 1;
  margin: 52rpx 46rpx 0;
  padding: 0;

  :deep(.skeleton-row) {
    height: 246rpx;
  }
}

.plan-card {
  position: relative;
  height: 246rpx;
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
}

.plan-body {
  width: 100%;
  height: 180rpx;
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

.price-row {
  margin-top: 16rpx;
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

.open-btn {
  position: relative;
  z-index: 1;
  height: 104rpx;
  margin: 52rpx 50rpx 0;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 104rpx;
  color: #111;
  font-size: 30rpx;
  font-weight: 800;
  background: linear-gradient(90deg, #dcefff, #f4defd);

  &::after {
    border: 0;
  }
}

.agreement {
  display: block;
  margin-top: 22rpx;
  color: rgba(255, 255, 255, 0.5);
  font-size: 24rpx;
  line-height: 34rpx;
  text-align: center;
}
</style>
