<template>
  <view class="invite-page">
    <view class="page-glow left"></view>
    <view class="page-glow right"></view>
    <AppTopNav back @back="goBack" />
    <view class="nav-divider"></view>

    <view class="invite-content">
      <view class="hero-copy">
        <text class="hero-title">呼叫 灵感合伙人</text>
        <view class="hero-subtitle">
          <text>率先体验 </text>
          <text class="engine-name">Image-2</text>
          <text> 模型的精准排版</text>
        </view>
      </view>

      <view class="reward-card">
        <view class="reward-title">
          <text>邀好友得</text>
          <text class="reward-number">{{ INVITE_REWARD }}</text>
          <text>灵感值</text>
        </view>
        <text class="reward-desc">双方均可获得，获得的灵感值不过期</text>
        <button class="invite-button" :disabled="loading" @click="openPosterSheet">
          <view class="mini-wechat-icon">
            <view class="mini-bubble main"></view>
            <view class="mini-bubble sub"></view>
          </view>
          <text>邀请好友</text>
        </button>
        <text class="reward-note">*被邀请者必须为新注册用户</text>
      </view>

      <view class="rule-card">
        <view v-for="step in ruleSteps" :key="step.title" class="rule-step">
          <view class="rule-icon" :class="step.icon">
            <template v-if="step.icon === 'share'">
              <view class="share-node center"></view>
              <view class="share-node top"></view>
              <view class="share-node bottom"></view>
              <view class="share-line top"></view>
              <view class="share-line bottom"></view>
            </template>
            <template v-else-if="step.icon === 'scan'">
              <view class="scan-corner lt"></view>
              <view class="scan-corner rt"></view>
              <view class="scan-corner lb"></view>
              <view class="scan-corner rb"></view>
            </template>
            <text v-else>✧</text>
          </view>
          <view class="rule-copy">
            <text class="rule-title">{{ step.title }}</text>
            <text class="rule-desc">{{ step.desc }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showPosterSheet" class="poster-mask" @click="closePosterSheet">
      <view class="poster-blue-glow left"></view>
      <view class="poster-blue-glow right"></view>
      <view class="poster-close" @click.stop="closePosterSheet">
        <text>×</text>
      </view>

      <view class="poster-shell" @click.stop>
        <view class="invite-poster">
          <view class="poster-bg soft-left"></view>
          <view class="poster-bg soft-right"></view>
          <view class="poster-bg ribbon left-ribbon"></view>
          <view class="poster-bg ribbon right-ribbon"></view>
          <view class="poster-spark top">✦</view>
          <view class="poster-spark mid">✦</view>

          <view class="poster-headline">
            <view class="poster-title-row">
              <text class="poster-send">送你</text>
              <text class="poster-number">{{ INVITE_REWARD }}</text>
              <text class="poster-send">枚灵感值</text>
            </view>
            <view class="poster-swirl"></view>
          </view>

          <view class="poster-subtitle">
            <text>体验 </text>
            <text class="poster-brand">Image-2</text>
            <text> 引擎</text>
            <text class="poster-subtitle-line">驱动的精准创作</text>
          </view>

          <view class="poster-qr-card">
            <view class="poster-user-row">
              <image class="poster-avatar" :src="avatar" mode="aspectFill" />
              <text>{{ nickname }}</text>
            </view>
            <text class="poster-invite-text">邀请你体验新一代创作引擎</text>
            <QrCodeGrid class="poster-qr-code" :value="qrValue" :size="280" />
          </view>

          <view class="poster-steps">
            <template v-for="(step, index) in posterSteps" :key="step.label">
              <view class="poster-step">
                <view class="poster-step-icon" :class="step.icon">
                  <template v-if="step.icon === 'scan'">
                    <view class="scan-corner lt"></view>
                    <view class="scan-corner rt"></view>
                    <view class="scan-corner lb"></view>
                    <view class="scan-corner rb"></view>
                  </template>
                  <template v-else-if="step.icon === 'user'">
                    <view class="user-head"></view>
                    <view class="user-body"></view>
                  </template>
                  <text v-else>✦</text>
                </view>
                <text>{{ step.label }}</text>
              </view>
              <view v-if="index < posterSteps.length - 1" class="poster-dots">····›</view>
            </template>
          </view>
        </view>

        <view class="share-title">
          <view></view>
          <text>分享至</text>
          <view></view>
        </view>

        <view class="share-actions">
          <button class="share-action" open-type="share">
            <view class="share-action-icon wechat">
              <view class="wechat-bubble large">
                <view class="wechat-eye left-eye"></view>
                <view class="wechat-eye right-eye"></view>
              </view>
              <view class="wechat-bubble small">
                <view class="wechat-eye left-eye"></view>
                <view class="wechat-eye right-eye"></view>
              </view>
            </view>
            <text>微信好友</text>
          </button>
          <button class="share-action" @click="shareToTimeline">
            <view class="share-action-icon moments">
              <view class="moments-mark"></view>
            </view>
            <text>朋友圈</text>
          </button>
          <button class="share-action" @click="savePoster">
            <view class="share-action-icon album">
              <image :src="ASSETS.iconDownload" mode="aspectFit" />
            </view>
            <text>保存相册</text>
          </button>
        </view>
      </view>
    </view>

    <LoginSheet v-if="showLoginSheet" @close="showLoginSheet = false" @logged-in="handleLoggedIn" />
  </view>
</template>

<script setup lang="ts">
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'
import { ASSETS } from '@/config/assets'
import { useAuthStore } from '@/stores/authStore'
import { aurakeyApi, type InviteInfo } from '@/services/aurakey'
import QrCodeGrid from '@/components/QrCodeGrid.vue'
import LoginSheet from '@/pages/index/components/LoginSheet.vue'

const INVITE_REWARD = 10

const authStore = useAuthStore()
const inviteInfo = ref<InviteInfo | null>(null)
const showLoginSheet = ref(false)
const showPosterSheet = ref(false)
const loading = ref(false)

const ruleSteps = [
  {
    title: '1.分享专属海报',
    desc: '点击“邀请好友”并将海报分享给好友',
    icon: 'share',
  },
  {
    title: '2.好友注册登录',
    desc: '好友通过扫描二维码打开小程序并注册登录',
    icon: 'scan',
  },
  {
    title: '3.邀请成功',
    desc: '灵感值自动发送到双方账户中',
    icon: 'spark',
  },
] as const

const posterSteps = [
  { label: '1.扫描二维码', icon: 'scan' },
  { label: '2.注册登录', icon: 'user' },
  { label: '3.获得积分', icon: 'spark' },
] as const

const avatar = computed(() => authStore.userProfile?.avatar || ASSETS.defaultAvatar)
const nickname = computed(() => authStore.userProfile?.nickname || '用户昵称111')
const inviteCode = computed(() => inviteInfo.value?.invite_code || 'AURAKEY')
const qrValue = computed(() => `aurakey://invite?code=${encodeURIComponent(inviteCode.value)}`)
const sharePath = computed(() => `/pages/index/index?invite_code=${encodeURIComponent(inviteCode.value)}`)

const goBack = () => uni.navigateBack()

const loadInviteInfo = async () => {
  if (!authStore.isLoggedIn) {
    showLoginSheet.value = true
    return
  }
  loading.value = true
  try {
    inviteInfo.value = await aurakeyApi.user.inviteInfo()
  } catch (error: any) {
    uni.showToast({ title: error.message || '邀请信息加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const openPosterSheet = () => {
  if (!authStore.isLoggedIn) {
    showLoginSheet.value = true
    return
  }
  showPosterSheet.value = true
  if (!inviteInfo.value && !loading.value) {
    loadInviteInfo()
  }
}

const closePosterSheet = () => {
  showPosterSheet.value = false
}

const shareToTimeline = () => {
  try {
    uni.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    })
  } catch {
    // 当前端环境不支持朋友圈分享菜单时，仍给出明确反馈。
  }
  uni.showToast({ title: '请从右上角分享到朋友圈', icon: 'none' })
}

const savePoster = () => {
  uni.showToast({ title: '海报保存能力待接入小程序画布', icon: 'none' })
}

const handleLoggedIn = () => {
  showLoginSheet.value = false
  loadInviteInfo()
}

const handleLoginRequired = () => {
  authStore.clearAuth()
  showLoginSheet.value = true
}

onMounted(() => {
  uni.$on('auth:login-required', handleLoginRequired)
  loadInviteInfo()
})

onUnmounted(() => {
  uni.$off('auth:login-required', handleLoginRequired)
})

onShareAppMessage(() => ({
  title: `送你${INVITE_REWARD}枚灵感值`,
  path: sharePath.value,
  imageUrl: ASSETS.logoWordmark,
}))

onShareTimeline(() => ({
  title: `送你${INVITE_REWARD}枚灵感值`,
  query: `invite_code=${encodeURIComponent(inviteCode.value)}`,
  imageUrl: ASSETS.logoWordmark,
}))
</script>

<style scoped lang="scss">
.invite-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #030304;
  color: #fff;
}

.page-glow {
  position: absolute;
  pointer-events: none;

  &.left {
    left: -120rpx;
    top: -80rpx;
    width: 460rpx;
    height: 300rpx;
    background: radial-gradient(circle at 50% 50%, rgba(25, 92, 190, 0.2), transparent 68%);
  }

  &.right {
    right: -120rpx;
    top: 190rpx;
    width: 360rpx;
    height: 320rpx;
    background: radial-gradient(circle at 50% 50%, rgba(75, 82, 255, 0.12), transparent 70%);
  }
}

.nav-divider {
  position: relative;
  z-index: 1;
  height: 1rpx;
  margin-top: -1rpx;
  background: linear-gradient(90deg, transparent 0%, rgba(38, 63, 130, 0.58) 16%, rgba(38, 63, 130, 0.48) 70%, transparent 100%);
}

.invite-content {
  position: relative;
  z-index: 1;
  padding: 34rpx 48rpx 72rpx;
}

.hero-copy {
  min-height: 158rpx;
}

.hero-title,
.hero-subtitle text,
.reward-title text,
.reward-desc,
.reward-note,
.rule-title,
.rule-desc,
.poster-send,
.poster-subtitle text,
.poster-user-row text,
.poster-invite-text,
.poster-step text,
.share-title text,
.share-action text {
  display: block;
}

.hero-title {
  color: rgba(255, 255, 255, 0.88);
  font-size: 40rpx;
  font-weight: 900;
  line-height: 54rpx;
}

.hero-subtitle {
  margin-top: 6rpx;
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.54);
  font-size: 24rpx;
  line-height: 34rpx;
}

.engine-name {
  color: rgba(255, 255, 255, 0.68);
  font-style: italic;
}

.reward-card,
.rule-card {
  border: 1rpx solid rgba(255, 255, 255, 0.15);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.025)),
    radial-gradient(circle at 82% 12%, rgba(91, 123, 255, 0.12), transparent 34%);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.08);
}

.reward-card {
  min-height: 416rpx;
  padding: 70rpx 40rpx 38rpx;
  border-radius: 20rpx;
  text-align: center;
}

.reward-title {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 14rpx;
  color: #fff;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 48rpx;
}

.reward-number {
  color: #52f7ff;
  font-size: 48rpx;
  font-weight: 900;
  line-height: 54rpx;
}

.reward-desc {
  margin-top: 14rpx;
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  line-height: 34rpx;
}

.invite-button {
  width: 100%;
  height: 102rpx;
  margin-top: 46rpx;
  padding: 0;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  color: #fff;
  font-size: 28rpx;
  font-weight: 800;
  line-height: 102rpx;
  background: linear-gradient(180deg, #5264ff 0%, #3da7ff 100%);
  box-shadow: 0 12rpx 34rpx rgba(61, 112, 255, 0.45), inset 0 2rpx 0 rgba(255, 255, 255, 0.18);

  &::after {
    border: 0;
  }

  &[disabled] {
    opacity: 0.64;
  }
}

.mini-wechat-icon {
  position: relative;
  width: 42rpx;
  height: 34rpx;
}

.mini-bubble {
  position: absolute;
  border-radius: 50%;
  background: #fff;

  &.main {
    left: 0;
    top: 2rpx;
    width: 26rpx;
    height: 22rpx;
  }

  &.sub {
    right: 0;
    bottom: 0;
    width: 24rpx;
    height: 20rpx;
  }
}

.reward-note {
  margin-top: 28rpx;
  color: rgba(255, 255, 255, 0.36);
  font-size: 23rpx;
  line-height: 32rpx;
}

.rule-card {
  margin-top: 24rpx;
  padding: 34rpx 40rpx 30rpx;
  border-radius: 18rpx;
}

.rule-step {
  display: flex;
  align-items: center;
  gap: 24rpx;

  & + .rule-step {
    margin-top: 34rpx;
  }
}

.rule-icon {
  position: relative;
  width: 78rpx;
  height: 78rpx;
  flex: 0 0 78rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 40rpx;
  background: linear-gradient(135deg, rgba(36, 41, 116, 0.92), rgba(24, 25, 78, 0.92));
}

.rule-copy {
  min-width: 0;
}

.rule-title {
  color: rgba(255, 255, 255, 0.92);
  font-size: 28rpx;
  line-height: 38rpx;
}

.rule-desc {
  margin-top: 8rpx;
  color: rgba(255, 255, 255, 0.44);
  font-size: 24rpx;
  line-height: 34rpx;
}

.share-node {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #fff;

  &.center {
    left: 32rpx;
    top: 34rpx;
  }

  &.top {
    right: 24rpx;
    top: 22rpx;
  }

  &.bottom {
    right: 24rpx;
    bottom: 22rpx;
  }
}

.share-line {
  position: absolute;
  left: 38rpx;
  width: 22rpx;
  height: 2rpx;
  background: #fff;
  transform-origin: left center;

  &.top {
    top: 36rpx;
    transform: rotate(-28deg);
  }

  &.bottom {
    top: 40rpx;
    transform: rotate(28deg);
  }
}

.scan-corner {
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  border-color: currentColor;

  &.lt {
    left: 22rpx;
    top: 22rpx;
    border-left: 3rpx solid;
    border-top: 3rpx solid;
  }

  &.rt {
    right: 22rpx;
    top: 22rpx;
    border-right: 3rpx solid;
    border-top: 3rpx solid;
  }

  &.lb {
    left: 22rpx;
    bottom: 22rpx;
    border-left: 3rpx solid;
    border-bottom: 3rpx solid;
  }

  &.rb {
    right: 22rpx;
    bottom: 22rpx;
    border-right: 3rpx solid;
    border-bottom: 3rpx solid;
  }
}

.poster-mask {
  position: fixed;
  inset: 0;
  z-index: 1200;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.96);
}

.poster-blue-glow {
  position: absolute;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  filter: blur(12rpx);
  background: radial-gradient(circle, rgba(52, 89, 255, 0.62), transparent 68%);

  &.left {
    left: 62rpx;
    top: 530rpx;
  }

  &.right {
    right: 40rpx;
    top: 518rpx;
  }
}

.poster-close {
  position: absolute;
  right: 42rpx;
  top: 48rpx;
  z-index: 3;
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 56rpx;
  line-height: 1;
  background: rgba(255, 255, 255, 0.15);
}

.poster-shell {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  padding: 166rpx 0 calc(62rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
}

.invite-poster {
  position: relative;
  width: 530rpx;
  height: 940rpx;
  overflow: hidden;
  border-radius: 32rpx;
  background:
    linear-gradient(158deg, #f2ccff 0%, #f9f0ff 28%, #f5f8ff 55%, #d9f5ff 100%);
  box-shadow: 0 34rpx 74rpx rgba(0, 0, 0, 0.42);
}

.poster-bg,
.poster-spark,
.poster-headline,
.poster-subtitle,
.poster-qr-card,
.poster-steps {
  position: relative;
  z-index: 1;
}

.poster-bg {
  position: absolute;
  z-index: 0;
  pointer-events: none;

  &.soft-left {
    left: -124rpx;
    top: 242rpx;
    width: 330rpx;
    height: 330rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(188, 104, 255, 0.12), transparent 68%);
  }

  &.soft-right {
    right: -120rpx;
    top: 222rpx;
    width: 310rpx;
    height: 430rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(98, 125, 255, 0.16), transparent 70%);
  }

  &.ribbon {
    height: 260rpx;
    border-radius: 50%;
    border: 24rpx solid rgba(137, 110, 255, 0.13);
  }

  &.left-ribbon {
    left: -142rpx;
    bottom: 88rpx;
    width: 290rpx;
    transform: rotate(28deg);
  }

  &.right-ribbon {
    right: -96rpx;
    bottom: 82rpx;
    width: 360rpx;
    transform: rotate(-24deg);
  }
}

.poster-spark {
  position: absolute;
  color: #9c6cff;
  font-size: 24rpx;

  &.top {
    right: 56rpx;
    top: 74rpx;
  }

  &.mid {
    left: 88rpx;
    top: 254rpx;
    color: rgba(139, 111, 255, 0.45);
  }
}

.poster-headline {
  padding-top: 62rpx;
}

.poster-title-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12rpx;
}

.poster-send {
  color: #171234;
  font-size: 40rpx;
  font-weight: 900;
  line-height: 52rpx;
}

.poster-number {
  color: #9a62f4;
  font-size: 98rpx;
  font-style: italic;
  font-weight: 900;
  line-height: 82rpx;
  text-shadow: 0 8rpx 20rpx rgba(117, 79, 255, 0.22);
}

.poster-swirl {
  width: 406rpx;
  height: 32rpx;
  margin: -2rpx auto 0;
  border-bottom: 8rpx solid rgba(128, 88, 237, 0.72);
  border-radius: 0 0 50% 50%;
  transform: rotate(-2deg);
}

.poster-subtitle {
  width: 360rpx;
  margin: 22rpx auto 0;
  color: #211a42;
  font-size: 28rpx;
  font-weight: 900;
  line-height: 40rpx;
  text-align: center;

  text {
    display: inline;
  }
}

.poster-brand {
  color: #8f60fb;
  font-style: italic;
}

.poster-subtitle-line {
  display: block !important;
}

.poster-qr-card {
  width: 398rpx;
  min-height: 450rpx;
  margin: 42rpx auto 0;
  padding: 28rpx 0 32rpx;
  border-radius: 22rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 20rpx 42rpx rgba(88, 91, 160, 0.14);
}

.poster-user-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #8b8991;
  font-size: 18rpx;
  line-height: 26rpx;
}

.poster-avatar {
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  background: #d7d7dc;
}

.poster-invite-text {
  margin-top: 10rpx;
  color: #b1aeb8;
  font-size: 18rpx;
  line-height: 26rpx;
}

.poster-qr-code {
  margin-top: 14rpx;
}

.poster-steps {
  width: 438rpx;
  margin: 24rpx auto 0;
  display: grid;
  grid-template-columns: 1fr 46rpx 1fr 46rpx 1fr;
  align-items: start;
}

.poster-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  color: #202042;
  font-size: 17rpx;
  line-height: 24rpx;
  text-align: center;
}

.poster-step-icon {
  position: relative;
  width: 70rpx;
  height: 70rpx;
  margin-bottom: 12rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9367ff;
  font-size: 34rpx;
  background: rgba(255, 255, 255, 0.6);
  border: 2rpx solid rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 0 22rpx rgba(112, 111, 255, 0.18);

  .scan-corner {
    width: 14rpx;
    height: 14rpx;
  }

  .scan-corner.lt {
    left: 18rpx;
    top: 18rpx;
  }

  .scan-corner.rt {
    right: 18rpx;
    top: 18rpx;
  }

  .scan-corner.lb {
    left: 18rpx;
    bottom: 18rpx;
  }

  .scan-corner.rb {
    right: 18rpx;
    bottom: 18rpx;
  }
}

.user-head {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  background: currentColor;
}

.user-body {
  position: absolute;
  left: 18rpx;
  bottom: 16rpx;
  width: 34rpx;
  height: 18rpx;
  border-radius: 18rpx 18rpx 8rpx 8rpx;
  background: currentColor;
}

.poster-dots {
  padding-top: 26rpx;
  color: #9367ff;
  font-size: 22rpx;
  line-height: 30rpx;
  text-align: center;
}

.share-title {
  width: 312rpx;
  margin-top: 52rpx;
  display: flex;
  align-items: center;
  gap: 18rpx;
  color: rgba(255, 255, 255, 0.9);
  font-size: 26rpx;
  line-height: 36rpx;

  view {
    height: 1rpx;
    flex: 1;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.58));

    &:last-child {
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.58), transparent);
    }
  }
}

.share-actions {
  width: 520rpx;
  margin-top: 42rpx;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.share-action {
  width: 116rpx;
  padding: 0;
  margin: 0;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: visible;
  color: rgba(255, 255, 255, 0.72);
  font-size: 22rpx;
  line-height: 32rpx;
  background: transparent;

  &::after {
    border: 0;
  }
}

.share-action-icon {
  position: relative;
  width: 92rpx;
  height: 92rpx;
  margin-bottom: 20rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &.wechat,
  &.moments {
    background: #05c75a;
  }

  &.album {
    background: #5860ff;

    image {
      width: 42rpx;
      height: 42rpx;
      filter: brightness(0) invert(1);
    }
  }
}

.wechat-bubble {
  position: absolute;
  border-radius: 50%;
  background: #fff;

  &.large {
    left: 20rpx;
    top: 28rpx;
    width: 36rpx;
    height: 28rpx;
  }

  &.small {
    right: 18rpx;
    bottom: 24rpx;
    width: 32rpx;
    height: 24rpx;
  }
}

.wechat-eye {
  position: absolute;
  top: 9rpx;
  width: 4rpx;
  height: 4rpx;
  border-radius: 50%;
  background: #05c75a;

  &.left-eye {
    left: 10rpx;
  }

  &.right-eye {
    right: 10rpx;
  }
}

.small .wechat-eye {
  top: 8rpx;
  width: 3rpx;
  height: 3rpx;
}

.moments-mark {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  background: conic-gradient(
    #fff 0deg 34deg,
    transparent 34deg 60deg,
    #fff 60deg 94deg,
    transparent 94deg 120deg,
    #fff 120deg 154deg,
    transparent 154deg 180deg,
    #fff 180deg 214deg,
    transparent 214deg 240deg,
    #fff 240deg 274deg,
    transparent 274deg 300deg,
    #fff 300deg 334deg,
    transparent 334deg 360deg
  );
}
</style>
