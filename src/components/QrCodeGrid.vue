<template>
  <view class="qr-grid" :style="gridStyle">
    <view v-for="(row, rowIndex) in modules" :key="rowIndex" class="qr-row">
      <view v-for="(cell, cellIndex) in row" :key="`${rowIndex}-${cellIndex}`" class="qr-cell" :class="{ dark: cell }"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { createQrMatrix } from '@/utils/qrCode'

const props = withDefaults(
  defineProps<{
    value: string
    size?: number
    padding?: number
  }>(),
  {
    size: 360,
    padding: 16,
  }
)

const modules = computed<boolean[][]>(() => {
  return createQrMatrix(props.value)
})

const gridStyle = computed(() => ({
  width: `${props.size}rpx`,
  height: `${props.size}rpx`,
  padding: `${props.padding}rpx`,
}))
</script>

<style scoped lang="scss">
.qr-grid {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  flex-wrap: wrap;
  background: #fff;
}

.qr-row {
  flex: 1;
  display: flex;
}

.qr-cell {
  flex: 1;
  background: #fff;
}

.dark {
  background: #000;
}
</style>
