<template>
  <view class="masonry-grid" :style="gridStyle">
    <view v-for="(column, columnIndex) in masonryColumns" :key="columnIndex" class="masonry-column"
      :style="getColumnStyle(columnIndex)">
      <view v-for="(entry, entryIndex) in column.items" :key="entry.item.id" class="masonry-cell"
        :style="getCellStyle(entryIndex)">
        <slot :item="entry.item" :index="entry.index" :column-index="columnIndex" :image-height="entry.imageHeight"
          :image-style="getImageStyle(entry.imageHeight)" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface MasonryGridItem {
  id: string | number
  aspect_ratio?: string | number | null
  prompt: string
  image_url?: string | null
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

defineSlots<{
  default(props: {
    item: SlotItem
    index: number
    columnIndex: number
    imageHeight: number
    imageStyle: Record<string, string>
  }): unknown
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
}
</style>
