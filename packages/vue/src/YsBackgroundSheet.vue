<script setup lang="ts">
// 内置背景选择器：本地上传 → 拖动/缩放裁剪(按课表容器比例) → 导出 dataURL
// 宿主拿到 dataURL 后自行持久化;也可完全不用此面板,直接传 background.image
import { computed, ref, watch } from 'vue'
import YsSheet from './YsSheet.vue'

const props = withDefaults(defineProps<{
  open: boolean
  /** 裁剪目标宽高比（课表容器实际比例） */
  aspect?: number
  vars?: Record<string, string>
}>(), {
  aspect: 390 / 700,
})

const emit = defineEmits<{
  close: []
  apply: [dataUrl: string]
  clear: []
}>()

const source = ref<HTMLImageElement | null>(null)
const zoom = ref(1)
const offset = ref({ x: 0, y: 0 })
const frame = ref<HTMLElement | null>(null)

watch(() => props.open, (open) => {
  if (!open) {
    source.value = null
    zoom.value = 1
    offset.value = { x: 0, y: 0 }
  }
})

function pickFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) {
    return
  }
  const url = URL.createObjectURL(file)
  const image = new Image()
  image.onload = () => {
    source.value = image
    zoom.value = 1
    offset.value = { x: 0, y: 0 }
  }
  image.src = url
}

/** 覆盖式基础缩放：图片短边贴满裁剪框 */
const baseScale = computed(() => {
  const image = source.value
  const box = frameSize.value
  if (!image) {
    return 1
  }
  return Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight)
})

const frameSize = computed(() => {
  const width = 260
  return { width, height: width / props.aspect }
})

const imageStyle = computed(() => {
  const image = source.value
  if (!image) {
    return {}
  }
  const scale = baseScale.value * zoom.value
  return {
    width: `${image.naturalWidth * scale}px`,
    height: `${image.naturalHeight * scale}px`,
    transform: `translate(calc(-50% + ${offset.value.x}px), calc(-50% + ${offset.value.y}px))`,
  }
})

let dragOrigin: { x: number, y: number, ox: number, oy: number } | null = null

function onPointerDown(event: PointerEvent) {
  dragOrigin = { x: event.clientX, y: event.clientY, ox: offset.value.x, oy: offset.value.y }
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!dragOrigin) {
    return
  }
  offset.value = clampOffset({
    x: dragOrigin.ox + event.clientX - dragOrigin.x,
    y: dragOrigin.oy + event.clientY - dragOrigin.y,
  })
}

function onPointerUp() {
  dragOrigin = null
}

function clampOffset(next: { x: number, y: number }) {
  const image = source.value
  if (!image) {
    return next
  }
  const scale = baseScale.value * zoom.value
  const maxX = Math.max(0, (image.naturalWidth * scale - frameSize.value.width) / 2)
  const maxY = Math.max(0, (image.naturalHeight * scale - frameSize.value.height) / 2)
  return {
    x: Math.min(maxX, Math.max(-maxX, next.x)),
    y: Math.min(maxY, Math.max(-maxY, next.y)),
  }
}

watch(zoom, () => {
  offset.value = clampOffset(offset.value)
})

function apply() {
  const image = source.value
  if (!image) {
    return
  }
  const outWidth = 780
  const outHeight = Math.round(outWidth / props.aspect)
  const canvas = document.createElement('canvas')
  canvas.width = outWidth
  canvas.height = outHeight
  const context = canvas.getContext('2d')!
  const scale = baseScale.value * zoom.value
  const ratio = outWidth / frameSize.value.width
  // 裁剪框中心对应的图片坐标
  const centerX = image.naturalWidth / 2 - offset.value.x / scale
  const centerY = image.naturalHeight / 2 - offset.value.y / scale
  const viewWidth = frameSize.value.width / scale
  const viewHeight = frameSize.value.height / scale
  context.drawImage(
    image,
    centerX - viewWidth / 2,
    centerY - viewHeight / 2,
    viewWidth,
    viewHeight,
    0,
    0,
    outWidth,
    outHeight,
  )
  void ratio
  emit('apply', canvas.toDataURL('image/jpeg', 0.86))
}
</script>

<template>
  <YsSheet :open="open" title="自定义背景" :vars="vars" @close="emit('close')">
    <div class="ys-bg">
      <template v-if="!source">
        <label class="ys-bg__drop">
          <input type="file" accept="image/*" @change="pickFile">
          <strong>选择图片</strong>
          <span>上传后可拖动与缩放裁剪</span>
        </label>
      </template>
      <template v-else>
        <div
          ref="frame"
          class="ys-bg__frame"
          :style="{ width: `${frameSize.width}px`, height: `${frameSize.height}px` }"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <img :src="source.src" :style="imageStyle" alt="" draggable="false">
          <i class="ys-bg__grid" aria-hidden="true" />
        </div>
        <label class="ys-bg__zoom">
          <span>缩放</span>
          <input v-model.number="zoom" type="range" min="1" max="3" step="0.01">
        </label>
      </template>

      <div class="ys-bg__actions">
        <button type="button" class="ys-bg__btn ys-bg__btn--ghost" @click="emit('clear')">移除背景</button>
        <button type="button" class="ys-bg__btn ys-bg__btn--primary" :disabled="!source" @click="apply">应用</button>
      </div>
    </div>
  </YsSheet>
</template>

<style>
.ys-bg { display: flex; flex-direction: column; gap: 12px; align-items: center; padding: 6px 0 2px; }

.ys-bg__drop {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 36px 0;
  cursor: pointer;
  background: var(--ys-surface-2);
  border: 1.5px dashed var(--ys-border-strong);
  border-radius: 12px;
}

.ys-bg__drop input { display: none; }
.ys-bg__drop strong { font-size: 14px; color: var(--ys-accent); }
.ys-bg__drop span { font-size: 11px; color: var(--ys-text-3); }

.ys-bg__frame {
  position: relative;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
  background: #000;
  border-radius: 12px;
}

.ys-bg__frame:active { cursor: grabbing; }

.ys-bg__frame img {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: none;
  user-select: none;
  pointer-events: none;
}

.ys-bg__grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgb(255 255 255 / 24%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 24%) 1px, transparent 1px);
  background-size: 33.4% 33.4%;
  border: 1px solid rgb(255 255 255 / 40%);
  border-radius: 12px;
}

.ys-bg__zoom {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  font-size: 12px;
  color: var(--ys-text-3);
}

.ys-bg__zoom input { flex: 1; accent-color: var(--ys-accent); }

.ys-bg__actions { display: flex; gap: 10px; width: 100%; }

.ys-bg__btn {
  flex: 1;
  padding: 11px 0;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: 0;
  border-radius: 9px;
}

.ys-bg__btn--ghost { color: var(--ys-text-2); background: var(--ys-surface-2); }
.ys-bg__btn--primary { color: #fff; background: var(--ys-accent); }
.ys-bg__btn--primary:disabled { opacity: 0.5; }
</style>
