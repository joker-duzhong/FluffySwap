<template>
  <view class="app-top-nav" :style="rootStyle">
    <view class="nav-row" :style="rowStyle">
      <view class="nav-left" :style="leftStyle">
        <view v-if="back" class="back-btn" @click="$emit('back')">
          <text>‹</text>
        </view>
        <slot v-else name="left"></slot>
      </view>

      <view class="nav-title" :style="titleStyle">
        <slot name="title">
          <text v-if="title" class="title-text">{{ title }}</text>
        </slot>
      </view>

      <view class="nav-right" :style="rightStyle">
        <slot name="right"></slot>
        <view v-if="reserveMenu" class="menu-spacer" :style="menuStyle"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

withDefaults(defineProps<{
  title?: string
  back?: boolean
  reserveMenu?: boolean
}>(), {
  reserveMenu: true,
})

defineEmits<{
  (event: 'back'): void
}>()

const toPx = (rpx: number) => {
  try {
    return uni.upx2px(rpx)
  } catch {
    return rpx / 2
  }
}

const layout = ref({
  totalHeight: toPx(178),
  menuTop: toPx(84),
  menuHeight: toPx(58),
  menuWidth: toPx(176),
  rightGap: toPx(24),
  horizontalGap: toPx(28),
})

const updateLayout = () => {
  try {
    const systemInfo = uni.getSystemInfoSync()
    const menuButton = uni.getMenuButtonBoundingClientRect()
    const statusBarHeight = systemInfo.statusBarHeight || 0
    const windowWidth = systemInfo.windowWidth || 375
    const fallbackGap = toPx(14)
    const menuTop = menuButton?.top || statusBarHeight + fallbackGap
    const menuHeight = menuButton?.height || toPx(58)
    const menuWidth = menuButton?.width || toPx(176)
    const rightGap = menuButton?.right ? Math.max(windowWidth - menuButton.right, toPx(14)) : toPx(24)
    const bottomGap = Math.max(menuTop - statusBarHeight, toPx(10))

    layout.value = {
      totalHeight: menuTop + menuHeight + bottomGap,
      menuTop,
      menuHeight,
      menuWidth,
      rightGap,
      horizontalGap: toPx(28),
    }
  } catch {
    layout.value = {
      totalHeight: toPx(178),
      menuTop: toPx(84),
      menuHeight: toPx(58),
      menuWidth: toPx(176),
      rightGap: toPx(24),
      horizontalGap: toPx(28),
    }
  }
}

const rootStyle = computed(() => ({
  height: `${layout.value.totalHeight}px`,
}))

const rowStyle = computed(() => ({
  top: `${layout.value.menuTop}px`,
  height: `${layout.value.menuHeight}px`,
}))

const leftStyle = computed(() => ({
  left: `${layout.value.horizontalGap}px`,
  height: `${layout.value.menuHeight}px`,
}))

const rightStyle = computed(() => ({
  right: `${layout.value.rightGap}px`,
  height: `${layout.value.menuHeight}px`,
}))

const titleStyle = computed(() => ({
  height: `${layout.value.menuHeight}px`,
}))

const menuStyle = computed(() => ({
  width: `${layout.value.menuWidth}px`,
  height: `${layout.value.menuHeight}px`,
}))

onMounted(() => {
  updateLayout()
})
</script>

<style scoped lang="scss">
.app-top-nav {
  position: relative;
  z-index: 10;
  width: 100%;
  flex: 0 0 auto;
}

.nav-row {
  position: absolute;
  left: 0;
  right: 0;
}

.nav-left,
.nav-right,
.nav-title {
  position: absolute;
  top: 0;
  display: flex;
  align-items: center;
}

.nav-left {
  justify-content: flex-start;
}

.nav-right {
  justify-content: flex-end;
  gap: 14rpx;
}

.nav-title {
  left: 180rpx;
  right: 180rpx;
  justify-content: center;
  pointer-events: none;
}

.title-text {
  max-width: 100%;
  color: #fff;
  font-size: 32rpx;
  font-weight: 700;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.back-btn {
  width: 56rpx;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 52rpx;
  line-height: 1;
}

.menu-spacer {
  flex: 0 0 auto;
  pointer-events: none;
}
</style>
