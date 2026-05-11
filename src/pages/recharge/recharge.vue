<template>
  <view class="recharge-page">
    <image class="hero-bg" :src="ASSETS.vipHero" mode="aspectFill" />
    <AppTopNav back @back="goBack" />

    <view class="hero-content">
      <text class="title">会员中心·VIP</text>
      <text v-if="rechargeTag" class="tag">{{ rechargeTag }}</text>
      <text v-if="rechargeSubtitle" class="desc">{{ rechargeSubtitle }}</text>
    </view>

    <view v-if="productTabs.length > 1" class="product-tabs">
      <view
        v-for="tab in productTabs"
        :key="tab.type"
        class="product-tab"
        :class="{ active: selectedProductType === tab.type }"
        @click="selectProductType(tab.type)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <PageSkeleton v-if="loading" class="plans-skeleton" variant="grid" :rows="3" />
    <view v-else class="plans">
      <view v-for="product in currentProducts" :key="product.id" class="plan-card"
        :class="{ active: selectedProduct?.id === product.id }" @click="selectedProduct = product">
        <view v-if="product.tag" class="recommend">{{ product.tag }}</view>
        <view class="points-bar">
          <image :src="ASSETS.iconSpark" mode="aspectFit" />
          <text>{{ formatProductBenefit(product) }}</text>
        </view>
        <view class="plan-body">
          <text class="name">{{ product.name }}</text>
          <text v-if="formatValidDays(product)" class="valid-days">{{ formatValidDays(product) }}</text>
          <view class="price-row">
            <text class="yen">¥</text>
            <text class="price">{{ formatYuan(product.price) }}</text>
          </view>
          <text v-if="product.original_price" class="original">¥{{ formatYuan(product.original_price) }}</text>
        </view>
      </view>
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
import { ASSETS } from '@/config/assets'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { aurakeyApi, type ProductItem } from '@/services/aurakey'
import LoginSheet from '@/pages/index/components/LoginSheet.vue'

const authStore = useAuthStore()
const appStore = useAppStore()
const products = ref<ProductItem[]>([])
const selectedProduct = ref<ProductItem | null>(null)
const selectedProductType = ref('vip')
const paymentOpenid = ref('')
const showLoginSheet = ref(false)
const loading = ref(false)
const paying = ref(false)

const productTabs = computed(() => {
  const tabs: Array<{ type: string; label: string }> = []
  if (products.value.some((item) => item.type === 'vip')) tabs.push({ type: 'vip', label: '会员' })
  if (products.value.some((item) => item.type === 'point_pack')) tabs.push({ type: 'point_pack', label: '灵感包' })
  return tabs.length > 0 ? tabs : [{ type: 'all', label: '商品' }]
})
const currentProducts = computed(() => {
  if (selectedProductType.value === 'all') return products.value
  const list = products.value.filter((item) => item.type === selectedProductType.value)
  return list.length > 0 ? list : products.value
})
const rechargeTag = computed(() => appStore.rechargeTag)
const rechargeSubtitle = computed(() => appStore.rechargeSubtitle)
const payButtonText = computed(() => selectedProduct.value?.type === 'point_pack' ? '立即购买' : '开通会员')

const goBack = () => uni.navigateBack()

const formatYuan = (fen: number) => {
  const yuan = fen / 100
  return Number.isInteger(yuan) ? yuan.toFixed(0) : yuan.toFixed(1)
}

const getProductPoints = (product: ProductItem) => Number(product.point_amount || 0) + Number(product.bonus_amount || 0)

const formatProductBenefit = (product: ProductItem) => {
  const points = getProductPoints(product)
  if (product.type === 'vip') {
    const levelText = product.vip_level ? `Lv.${product.vip_level}` : ''
    const typeText = product.vip_type || 'VIP'
    return `${typeText}${levelText ? ` ${levelText}` : ''} · ${points}灵感值`
  }
  return `${points}灵感值`
}

const formatValidDays = (product: ProductItem) => {
  const days = product.valid_days ?? (
    product.type === 'vip'
      ? appStore.systemConfig.default_vip_valid_days
      : appStore.systemConfig.default_point_pack_valid_days
  )
  if (!days) return product.type === 'point_pack' ? '长期有效' : ''
  return `${days}天有效`
}

const selectProductType = (type: string) => {
  selectedProductType.value = type
  selectedProduct.value = currentProducts.value[0] || null
}

const loadProducts = async () => {
  loading.value = true
  try {
    const productData = await aurakeyApi.store.products()
    products.value = productData.items
    paymentOpenid.value = authStore.userProfile?.openid || ''
    selectedProductType.value = productTabs.value[0]?.type || 'all'
    selectedProduct.value = currentProducts.value[0] || null
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

.product-tabs {
  position: relative;
  z-index: 1;
  width: 320rpx;
  height: 64rpx;
  margin: 38rpx auto 0;
  padding: 6rpx;
  border-radius: 16rpx;
  display: flex;
  background: rgba(255, 255, 255, 0.1);
}

.product-tab {
  flex: 1;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.62);
  font-size: 24rpx;
  line-height: 34rpx;

  &.active {
    color: #160b23;
    font-weight: 700;
    background: #e8d8ff;
  }
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

  text {
    max-width: 190rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
