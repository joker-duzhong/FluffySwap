<template>
  <view class="recharge-page">
    <image class="hero-bg" :src="ASSETS.vipHero" mode="aspectFill" />
    <AppTopNav back @back="goBack" />

    <view class="hero-content">
      <text class="title">会员中心·VIP</text>
      <text v-if="rechargeTag" class="tag">{{ rechargeTag }}</text>
      <text v-if="rechargeSubtitle" class="desc">{{ rechargeSubtitle }}</text>
    </view>

    <PageSkeleton v-if="loading" class="plans-skeleton" variant="grid" :rows="3" />
    <view v-else class="plans">
      <RechargeProductCard v-for="product in products" :key="product.id" :product="product"
        :active="selectedProduct?.id === product.id" @select="selectedProduct = product" />
    </view>

    <button class="open-btn" :disabled="!selectedProduct || paying" :loading="paying" @click="handlePay">
      {{ paying ? '处理中' : payButtonText }}
    </button>
    <text class="agreement">购买代表接受《会员协议》</text>
    <LoginSheet v-if="showLoginSheet" @close="showLoginSheet = false" @logged-in="showLoginSheet = false" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'
import PageSkeleton from '@/components/PageSkeleton.vue'
import RechargeProductCard from './components/RechargeProductCard.vue'
import { ASSETS } from '@/config/assets'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { aurakeyApi, type ProductItem } from '@/services/aurakey'
import LoginSheet from '@/pages/index/components/LoginSheet.vue'

const authStore = useAuthStore()
const appStore = useAppStore()
const products = ref<ProductItem[]>([])
const selectedProduct = ref<ProductItem | null>(null)
const paymentOpenid = ref('')
const showLoginSheet = ref(false)
const loading = ref(false)
const paying = ref(false)

const rechargeTag = computed(() => appStore.customJSON.recharge_tag)
const rechargeSubtitle = computed(() => appStore.customJSON.recharge_subtitle)
const payButtonText = computed(() => selectedProduct.value?.type === 'point_pack' ? '立即购买' : '开通会员')

const goBack = () => uni.navigateBack()

const loadProducts = async () => {
  loading.value = true
  try {
    const productData = await aurakeyApi.store.products()
    products.value = productData.items
    paymentOpenid.value = authStore.userProfile?.openid || ''
    selectedProduct.value = products.value[0] || null
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
    authStore.setProfileLoading(true)
    const profile = await aurakeyApi.user.profile()
    authStore.setUserProfile(profile)
    uni.showToast({ title: '支付成功', icon: 'success' })
  } catch (error: any) {
    uni.showToast({ title: error?.errMsg?.includes('cancel') ? '支付未完成' : error.message || '支付失败', icon: 'none' })
  } finally {
    authStore.setProfileLoading(false)
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
