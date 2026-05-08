<template>
  <view class="qr-grid" :style="gridStyle">
    <view
      v-for="(cell, index) in cells"
      :key="index"
      class="qr-cell"
      :class="{ dark: cell }"
      :style="cellStyle"
    ></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UQRCode from 'uqrcodejs'

const props = withDefaults(
  defineProps<{
    value: string
    size?: number
  }>(),
  {
    size: 360,
  }
)

const modules = computed<boolean[][]>(() => {
  const qr = new UQRCode()
  qr.data = props.value || 'aurakey'
  qr.margin = 0
  qr.make()
  return qr.modules.map((row: any[]) => row.map((cell: any) => Boolean(cell?.isBlack ?? cell)))
})

const count = computed(() => modules.value.length || 1)
const cells = computed(() => modules.value.flat())
const cellSize = computed(() => props.size / count.value)

const gridStyle = computed(() => ({
  width: `${props.size}rpx`,
  height: `${props.size}rpx`,
}))

const cellStyle = computed(() => ({
  width: `${cellSize.value}rpx`,
  height: `${cellSize.value}rpx`,
}))
</script>

<style scoped lang="scss">
.qr-grid {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
}

.qr-cell {
  background: #fff;
}

.dark {
  background: #000;
}
</style>
