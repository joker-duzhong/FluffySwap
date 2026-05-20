<template>
  <view class="masonry-grid" :style="gridStyle">
    <view v-for="(column, columnIndex) in masonryColumns" :key="columnIndex" class="masonry-column"
      :style="getColumnStyle(columnIndex)">
      <view v-for="(entry, entryIndex) in column.items" :key="entry.item.id" class="masonry-cell"
        :style="getCellStyle(entryIndex)" @click="emit('item-click', entry.item)">
        <text class="card-title">{{ entry.item.prompt || '模板' }}</text>
        <image class="card-image" :style="getImageStyle(entry.imageHeight)" :src="getImageSource(entry.item)"
          mode="aspectFill" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GalleryCategory, ResourceResponse } from '../services/aurakey';

interface MasonryGridItem {
  id: string | number
  aspect_ratio?: string | number | null
  prompt: string
  resource?: ResourceResponse
}

interface MasonryGridEntry<TItem extends MasonryGridItem> {
  item: TItem
  index: number
  imageHeight: number
  itemHeight: number
}

interface MasonryGridColumn<TItem extends MasonryGridItem> {
  height: number
  items: MasonryGridEntry<TItem>[]
}

type SlotItem = MasonryGridItem & Record<string, any>

const props = withDefaults(defineProps<{
  items: SlotItem[]
  categories: GalleryCategory[]
  columns?: number
  gap?: number
  paddingX?: number
  paddingBottom?: number
  containerWidth?: number
  contentInset?: number
  itemHeightOffset?: number
  fallbackAspectRatio?: string | number
}>(), {
  columns: 2,
  gap: 16,
  paddingX: 28,
  paddingBottom: 30,
  containerWidth: 750,
  contentInset: 0,
  itemHeightOffset: 0,
  fallbackAspectRatio: '1:1',
})

const emit = defineEmits<{
  (event: 'item-click', item: SlotItem): void
}>()

const columnCount = computed(() => Math.max(1, Math.floor(props.columns)))

const columnWidth = computed(() => {
  const totalGap = props.gap * (columnCount.value - 1)
  return (props.containerWidth - props.paddingX * 2 - totalGap) / columnCount.value
})

const imageWidth = computed(() => Math.max(0, columnWidth.value - props.contentInset * 2))

const parseAspectRatioValue = (value?: string | number | null): number | null => {
  if (typeof value === 'number' && value > 0) return value
  if (typeof value !== 'string') return null

  const ratio = value.trim()
  if (!ratio) return null

  const pair = ratio.match(/^(\d+(?:\.\d+)?)\s*[:/xX]\s*(\d+(?:\.\d+)?)$/)
  if (pair) {
    const width = Number(pair[1])
    const height = Number(pair[2])
    if (width > 0 && height > 0) return width / height
  }

  const numericRatio = Number(ratio)
  return numericRatio > 0 ? numericRatio : null
}

const parseAspectRatio = (value?: string | number | null) => {
  return parseAspectRatioValue(value) || parseAspectRatioValue(props.fallbackAspectRatio) || 1
}

const getImageHeight = (aspectRatio?: string | number | null) => {
  const ratio = parseAspectRatio(aspectRatio)
  return Math.round(imageWidth.value / ratio)
}

const masonryColumns = computed<MasonryGridColumn<SlotItem>[]>(() => {
  const columns = Array.from({ length: columnCount.value }, () => ({
    height: 0,
    items: [] as MasonryGridEntry<SlotItem>[],
  }))

  props.items.forEach((item, index) => {
    const imageHeight = getImageHeight(item.aspect_ratio)
    const itemHeight = imageHeight + props.itemHeightOffset
    const targetColumn = columns.reduce((shortest, column) => (
      column.height < shortest.height ? column : shortest
    ))

    targetColumn.items.push({ item, index, imageHeight, itemHeight })
    targetColumn.height += itemHeight + props.gap
  })

  return columns
})

const gridStyle = computed(() => ({
  padding: `0 ${props.paddingX}rpx ${props.paddingBottom}rpx`,
  paddingBottom: `calc(${props.paddingBottom}rpx + env(safe-area-inset-bottom))`,
}))

const getColumnStyle = (columnIndex: number) => ({
  marginLeft: columnIndex > 0 ? `${props.gap}rpx` : '0',
})

const getCellStyle = (entryIndex: number) => ({
  marginTop: entryIndex > 0 ? `${props.gap}rpx` : '0',
})

const getImageStyle = (imageHeight: number) => ({
  height: `${imageHeight}rpx`,
})

const getImageSource = (item: SlotItem) => item.resource?.thumb_url || item.resource?.url || ''
</script>

<style scoped lang="scss">
.masonry-grid {
  width: 100%;
  display: flex;
  align-items: flex-start;
}

.masonry-column {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.masonry-cell {
  min-width: 0;
  padding: 18rpx;
  border-radius: 20rpx;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.06));
}

.card-title {
  display: block;
  height: 42rpx;
  color: #fff;
  font-size: 28rpx;
  line-height: 42rpx;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-image {
  width: 100%;
  margin-top: 12rpx;
  display: block;
  border-radius: 14rpx;
  background: rgba(255, 255, 255, 0.08);
}
</style>
