<template>
  <view class="invite-page">
    <view class="page-glow left"></view>
    <view class="page-glow right"></view>
    <AppTopNav back @back="goBack" />
    <view class="nav-divider"></view>

    <view class="invite-content">
      <view class="hero-copy">
        <text class="hero-title">邀请你的创作搭子</text>
        <view class="hero-subtitle">
          <text>分享海报，好友注册后双方都能获得 </text>
          <text class="engine-name">{{ inviteRewardPoints }}</text>
          <text> 灵感值</text>
        </view>
      </view>

      <view class="reward-card">
        <view class="reward-title">
          <text>邀好友得</text>
          <text class="reward-number">{{ inviteRewardPoints }}</text>
          <text>灵感值</text>
        </view>
        <text class="reward-desc">邀请成功后奖励自动发放到双方账户</text>
        <view class="reward-stats">
          <view class="reward-stat">
            <text class="stat-label">累计邀请</text>
            <text class="stat-value">{{ inviteInfo?.invited_count ?? 0 }}</text>
          </view>
          <view class="reward-stat">
            <text class="stat-label">累计奖励</text>
            <text class="stat-value">{{ inviteInfo?.total_reward_points ?? 0 }}</text>
          </view>
        </view>
        <button class="invite-button" :disabled="loading" @click="openPosterSheet">
          <view class="mini-wechat-icon">
            <view class="mini-bubble main"></view>
            <view class="mini-bubble sub"></view>
          </view>
          <text>{{ loading ? '加载中...' : '邀请好友' }}</text>
        </button>
        <text class="reward-note">*仅新注册并成功绑定手机号的用户可被计为有效邀请</text>
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
            <text v-else>+</text>
          </view>
          <view class="rule-copy">
            <text class="rule-title">{{ step.title }}</text>
            <text class="rule-desc">{{ step.desc }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showPosterSheet" class="poster-mask" @click="closePosterSheet">
      <view class="poster-close" :style="{ top: `${posterCloseTop}px`, right: `${posterCloseRight}px` }"
        @click.stop="closePosterSheet">
        <text>x</text>
      </view>

      <view class="poster-shell" @click.stop>
        <view class="invite-poster">
          <image class="poster-bg-image" :src="inviteBg" mode="widthFix" />

          <view class="poster-card" :style="posterCardStyle">
            <view class="poster-user-row" :style="posterUserRowStyle">
              <view class="poster-user-copy">
                <image class="poster-avatar" :src="avatar" mode="aspectFill" />
                <text class="poster-name">{{ nickname }}</text>
              </view>
              <text class="poster-tip">邀请你一起体验 AuraKey AI 创作</text>
            </view>

            <view class="poster-qr-wrap" :style="posterQrWrapStyle">
              <QrCodeGrid class="poster-qr-code" :value="qrValue" :size="previewQrSize" :padding="previewQrPadding" />
            </view>
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
          <button class="share-action" :disabled="posterSaving" @click="savePoster">
            <view class="share-action-icon album">
              <image :src="ASSETS.iconDownload" mode="aspectFit" />
            </view>
            <text>{{ posterSaving ? '生成中' : '保存相册' }}</text>
          </button>
        </view>
      </view>
    </view>

    <canvas canvas-id="invitePosterCanvas" class="poster-canvas" />
    <LoginSheet v-if="showLoginSheet" @close="showLoginSheet = false" @logged-in="handleLoggedIn" />
  </view>
</template>

<script setup lang="ts">
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppTopNav from '@/components/AppTopNav.vue'
import QrCodeGrid from '@/components/QrCodeGrid.vue'
import { ASSETS } from '@/config/assets'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import LoginSheet from '@/pages/index/components/LoginSheet.vue'
import { aurakeyApi, type InviteInfo } from '@/services/aurakey'
import { buildInvitePagePath, buildInviteQrValue, buildInviteTimelineQuery } from '@/utils/invite'
import { createQrMatrix } from '@/utils/qrCode'

const CANVAS_ID = 'invitePosterCanvas'
const POSTER_WIDTH = 900
const POSTER_HEIGHT = 1600
const PREVIEW_POSTER_WIDTH = 540
const CARD_LEFT = 66
const CARD_TOP = 318
const CARD_WIDTH = 408
const CARD_HEIGHT = 474
const USER_LEFT = 26
const USER_TOP = 40
const AVATAR_SIZE = 32
const AVATAR_RADIUS = 16
const QR_WRAP_SIZE = 294
const QR_PADDING = 11
const QR_SIZE = 272

const authStore = useAuthStore()
const appStore = useAppStore()
const inviteInfo = ref<InviteInfo | null>(null)
const showLoginSheet = ref(false)
const showPosterSheet = ref(false)
const loading = ref(false)
const posterSaving = ref(false)
const posterCloseTop = ref(48)
const posterCloseRight = ref(42)
const previewQrSize = QR_SIZE
const previewQrPadding = QR_PADDING

const ruleSteps = [
  {
    title: '1.分享海报',
    desc: '将带专属邀请码的海报发送给好友',
    icon: 'share',
  },
  {
    title: '2.好友进入小程序',
    desc: '新用户通过分享入口进入并完成注册登录',
    icon: 'scan',
  },
  {
    title: '3.奖励到账',
    desc: '好友绑定手机号成功后，双方自动获得奖励',
    icon: 'spark',
  },
] as const

const avatar = computed(() => authStore.userProfile?.avatar || ASSETS.defaultAvatar)
const nickname = computed(() => authStore.userProfile?.nickname || 'AuraKey 用户')
const inviteRewardPoints = computed(() => appStore.inviteRewardPoints)
const inviteCode = computed(() => inviteInfo.value?.invite_code || 'AURAKEY')
const qrValue = computed(() => buildInviteQrValue(inviteCode.value))
const sharePath = computed(() => buildInvitePagePath(inviteCode.value))
const shareQuery = computed(() => buildInviteTimelineQuery(inviteCode.value))
const inviteBg = "https://zaiwen-abc.zaiwen.top/avatar/1778660893439-lj7sk7txgp.png"

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

const openPosterSheet = async () => {
  if (!authStore.isLoggedIn) {
    showLoginSheet.value = true
    return
  }
  if (!inviteInfo.value && !loading.value) {
    await loadInviteInfo()
  }
  if (inviteInfo.value) {
    showPosterSheet.value = true
  }
}

const closePosterSheet = () => {
  showPosterSheet.value = false
}

const updatePosterCloseLayout = () => {
  try {
    const systemInfo = uni.getSystemInfoSync()
    const menuButton = uni.getMenuButtonBoundingClientRect()
    const topPx = Math.max(menuButton.top || 0, systemInfo.statusBarHeight || 0) + menuButton.height + 12
    const rightPx = Math.max((systemInfo.windowWidth || 0) - menuButton.right, 12)
    posterCloseTop.value = Math.round(topPx)
    posterCloseRight.value = Math.round(rightPx)
  } catch {
    posterCloseTop.value = 48
    posterCloseRight.value = 42
  }
}

const scalePoster = (value: number) => Math.round((value / PREVIEW_POSTER_WIDTH) * POSTER_WIDTH)
const scalePosterHeight = (value: number) => Math.round((value / 960) * POSTER_HEIGHT)

const posterCardStyle = {
  left: `${CARD_LEFT}rpx`,
  top: `${CARD_TOP}rpx`,
  width: `${CARD_WIDTH}rpx`,
  height: `${CARD_HEIGHT}rpx`,
}

const posterUserRowStyle = {
  left: `${USER_LEFT}rpx`,
  top: `${USER_TOP}rpx`,
  right: `${USER_LEFT}rpx`,
}

const posterQrWrapStyle = {
  left: '50%',
  top: '128rpx',
  width: `${QR_WRAP_SIZE}rpx`,
  height: `${QR_WRAP_SIZE}rpx`,
  transform: 'translateX(-50%)',
}

const shareToTimeline = () => {
  try {
    uni.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    })
  } catch {
    // ignore
  }
  uni.showToast({ title: '请从右上角分享到朋友圈', icon: 'none' })
}

const handleLoggedIn = () => {
  showLoginSheet.value = false
  loadInviteInfo()
}

const handleLoginRequired = () => {
  authStore.clearAuth()
  showLoginSheet.value = true
}

const resolveImagePath = (src: string) =>
  new Promise<string>((resolve, reject) => {
    uni.getImageInfo({
      src,
      success: (result) => resolve(result.path),
      fail: reject,
    })
  })

const resolveImagePathWithFallback = async (primarySrc: string, fallbackSrc = ASSETS.defaultAvatar) => {
  try {
    return await resolveImagePath(primarySrc)
  } catch {
    return resolveImagePath(fallbackSrc)
  }
}

const drawRoundRect = (
  ctx: UniApp.CanvasContext,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor?: string,
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + safeRadius, y)
  ctx.lineTo(x + width - safeRadius, y)
  ctx.arcTo(x + width, y, x + width, y + safeRadius, safeRadius)
  ctx.lineTo(x + width, y + height - safeRadius)
  ctx.arcTo(x + width, y + height, x + width - safeRadius, y + height, safeRadius)
  ctx.lineTo(x + safeRadius, y + height)
  ctx.arcTo(x, y + height, x, y + height - safeRadius, safeRadius)
  ctx.lineTo(x, y + safeRadius)
  ctx.arcTo(x, y, x + safeRadius, y, safeRadius)
  ctx.closePath()
  if (fillColor) {
    ctx.setFillStyle(fillColor)
    ctx.fill()
  }
}

const drawQrCode = (ctx: UniApp.CanvasContext, value: string, startX: number, startY: number, size: number) => {
  const matrix = createQrMatrix(value)
  const count = matrix.length || 1
  const cellSize = size / count

  ctx.setFillStyle('#FFFFFF')
  ctx.fillRect(startX, startY, size, size)
  ctx.setFillStyle('#111111')

  matrix.forEach((row, rowIndex) => {
    row.forEach((cell, cellIndex) => {
      if (!cell) return
      ctx.fillRect(startX + cellIndex * cellSize, startY + rowIndex * cellSize, cellSize, cellSize)
    })
  })
}

const drawPoster = async () => {
  const ctx = uni.createCanvasContext(CANVAS_ID)
  const [backgroundPath, avatarPath] = await Promise.all([
    resolveImagePath(inviteBg),
    resolveImagePathWithFallback(avatar.value),
  ])
  const cardLeft = scalePoster(CARD_LEFT)
  const cardTop = scalePosterHeight(CARD_TOP)
  const cardWidth = scalePoster(CARD_WIDTH)
  const cardHeight = scalePosterHeight(CARD_HEIGHT)
  const userLeft = scalePoster(USER_LEFT)
  const userTop = scalePosterHeight(USER_TOP)
  const avatarSize = scalePoster(AVATAR_SIZE)
  const avatarRadius = scalePoster(AVATAR_RADIUS)
  const qrWrapSize = scalePoster(QR_WRAP_SIZE)
  const qrPadding = scalePoster(QR_PADDING)
  const qrSize = scalePoster(QR_SIZE)
  const avatarX = cardLeft + userLeft
  const avatarY = cardTop + userTop
  const nameX = avatarX + avatarSize + scalePoster(12)
  const qrWrapX = cardLeft + Math.round((cardWidth - qrWrapSize) / 2)
  const qrWrapY = cardTop + scalePosterHeight(124)
  const qrX = qrWrapX + qrPadding
  const qrY = qrWrapY + qrPadding

  ctx.setFillStyle('#F4F7FB')
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT)
  ctx.drawImage(backgroundPath, 0, 0, POSTER_WIDTH, POSTER_HEIGHT)

  drawRoundRect(ctx, avatarX, avatarY, avatarSize, avatarSize, avatarRadius)
  ctx.save()
  drawRoundRect(ctx, avatarX, avatarY, avatarSize, avatarSize, avatarRadius)
  ctx.clip()
  ctx.drawImage(avatarPath, avatarX, avatarY, avatarSize, avatarSize)
  ctx.restore()

  ctx.setFillStyle('#737377')
  ctx.setFontSize(scalePoster(18))
  ctx.fillText(nickname.value.slice(0, 18), nameX, avatarY + scalePosterHeight(19))
  ctx.setFillStyle('#999999')
  ctx.setFontSize(scalePoster(14))
  ctx.fillText('邀请你一起体验 AuraKey AI 创作', nameX, avatarY + scalePosterHeight(47))

  drawQrCode(ctx, qrValue.value, qrX, qrY, qrSize)

  await new Promise<void>((resolve) => ctx.draw(false, resolve))
}

const exportPoster = () =>
  new Promise<string>((resolve, reject) => {
    uni.canvasToTempFilePath(
      {
        canvasId: CANVAS_ID,
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        destWidth: POSTER_WIDTH,
        destHeight: POSTER_HEIGHT,
        fileType: 'png',
        success: (result) => resolve(result.tempFilePath),
        fail: reject,
      },
    )
  })

const openPhotoAlbumSetting = () =>
  new Promise<void>((resolve) => {
    uni.showModal({
      title: '需要相册权限',
      content: '请在设置中允许保存到相册后再试一次',
      success: (result) => {
        if (!result.confirm) {
          resolve()
          return
        }
        uni.openSetting({
          complete: () => resolve(),
        })
      },
      fail: () => resolve(),
    })
  })

const savePoster = async () => {
  if (posterSaving.value) return
  posterSaving.value = true
  uni.showLoading({ title: '生成海报中', mask: true })
  try {
    await drawPoster()
    const filePath = await exportPoster()
    await new Promise<void>((resolve, reject) => {
      uni.saveImageToPhotosAlbum({
        filePath,
        success: () => resolve(),
        fail: reject,
      })
    })
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (error: any) {
    console.error('保存邀请海报失败:', error)
    if (String(error?.errMsg || '').includes('saveImageToPhotosAlbum:fail auth deny')) {
      await openPhotoAlbumSetting()
    } else {
      uni.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
    }
  } finally {
    posterSaving.value = false
    uni.hideLoading()
  }
}

onMounted(() => {
  updatePosterCloseLayout()
  uni.$on('auth:login-required', handleLoginRequired)
  loadInviteInfo()
})

onUnmounted(() => {
  uni.$off('auth:login-required', handleLoginRequired)
})

onShareAppMessage(() => ({
  title: `送你${inviteRewardPoints.value}枚灵感值`,
  path: sharePath.value,
  imageUrl: ASSETS.invitePosterBg,
}))

onShareTimeline(() => ({
  title: `送你${inviteRewardPoints.value}枚灵感值`,
  query: shareQuery.value,
  imageUrl: ASSETS.invitePosterBg,
}))
</script>

<style scoped lang="scss">
.invite-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #05070b;
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
    background: radial-gradient(circle at 50% 50%, rgba(35, 121, 255, 0.24), transparent 68%);
  }

  &.right {
    right: -120rpx;
    top: 190rpx;
    width: 360rpx;
    height: 320rpx;
    background: radial-gradient(circle at 50% 50%, rgba(108, 181, 255, 0.18), transparent 70%);
  }
}

.nav-divider {
  position: relative;
  z-index: 1;
  height: 1rpx;
  margin-top: -1rpx;
  background: linear-gradient(90deg, transparent 0%, rgba(69, 116, 193, 0.58) 16%, rgba(69, 116, 193, 0.48) 70%, transparent 100%);
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
.share-title text,
.share-action text {
  display: block;
}

.hero-title {
  color: rgba(255, 255, 255, 0.92);
  font-size: 42rpx;
  font-weight: 900;
  line-height: 56rpx;
}

.hero-subtitle {
  margin-top: 8rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  color: rgba(255, 255, 255, 0.58);
  font-size: 24rpx;
  line-height: 34rpx;
}

.engine-name {
  color: #8ed6ff;
}

.reward-card,
.rule-card {
  border: 1rpx solid rgba(255, 255, 255, 0.14);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03)),
    radial-gradient(circle at 82% 12%, rgba(36, 132, 255, 0.12), transparent 34%);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.08);
}

.reward-card {
  min-height: 464rpx;
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
  color: #61dbff;
  font-size: 54rpx;
  font-weight: 900;
  line-height: 58rpx;
}

.reward-desc {
  margin-top: 14rpx;
  color: rgba(255, 255, 255, 0.64);
  font-size: 24rpx;
  line-height: 34rpx;
}

.reward-stats {
  margin-top: 30rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.reward-stat {
  padding: 20rpx 0;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.06);
}

.stat-label,
.stat-value {
  display: block;
}

.stat-label {
  color: rgba(255, 255, 255, 0.52);
  font-size: 22rpx;
  line-height: 30rpx;
}

.stat-value {
  margin-top: 10rpx;
  color: #fff;
  font-size: 34rpx;
  font-weight: 800;
  line-height: 42rpx;
}

.invite-button {
  width: 100%;
  height: 102rpx;
  margin-top: 30rpx;
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
  background: linear-gradient(180deg, #2f78f6 0%, #1f9df3 100%);
  box-shadow: 0 12rpx 34rpx rgba(28, 114, 242, 0.34), inset 0 2rpx 0 rgba(255, 255, 255, 0.18);

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
  margin-top: 26rpx;
  color: rgba(255, 255, 255, 0.38);
  font-size: 22rpx;
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

  &+.rule-step {
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
  font-size: 34rpx;
  background: linear-gradient(135deg, rgba(35, 78, 169, 0.92), rgba(26, 41, 84, 0.92));
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
  background: rgba(0, 0, 0, 0.92);
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
  font-size: 42rpx;
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
  width: 540rpx;
  height: 960rpx;
  overflow: hidden;
  border-radius: 32rpx;
  box-shadow: 0 34rpx 74rpx rgba(0, 0, 0, 0.42);
}

.poster-bg-image {
  width: 100%;
  position: absolute;
  z-index: 0;
  inset: 0;
}

.poster-card {
  position: absolute;
  z-index: 1;
}

.poster-name,
.poster-tip {
  display: block;
}

.poster-card {
  overflow: hidden;
}

.poster-user-row {
  position: absolute;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 6rpx;
}

.poster-avatar {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: #d7d7dc;
}

.poster-user-copy {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.poster-name {
  color: #737377;
  font-size: 18rpx;
  font-weight: 700;
  line-height: 24rpx;
}

.poster-tip {
  margin-top: 4rpx;
  color: #999999;
  font-size: 14rpx;
  line-height: 20rpx;
}

.poster-qr-wrap {
  position: absolute;
  padding: 11rpx;
  background: #fff;
  box-sizing: border-box;
}

.poster-qr-code {
  display: block;
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

  &[disabled] {
    opacity: 0.64;
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
    background: #1f86f4;

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
  background: conic-gradient(#fff 0deg 34deg,
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
      transparent 334deg 360deg);
}

.poster-canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
  width: 900px;
  height: 1600px;
  opacity: 0;
  pointer-events: none;
}
</style>
