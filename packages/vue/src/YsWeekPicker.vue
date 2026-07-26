<script setup lang="ts">
// 内置周选择器（复刻微信版 WeekPickerSheet 的宫格样式），可整体禁用换宿主实现
import YsSheet from './YsSheet.vue'

defineProps<{
  open: boolean
  week: number
  totalWeeks: number
  title: string
  vars?: Record<string, string>
}>()

const emit = defineEmits<{ close: [], select: [week: number] }>()
</script>

<template>
  <YsSheet :open="open" :title="title" :vars="vars" @close="emit('close')">
    <div class="ys-week-picker">
      <button
        v-for="candidate in totalWeeks"
        :key="candidate"
        type="button"
        class="ys-week-picker__item"
        :class="{ 'is-active': candidate === week }"
        :aria-pressed="candidate === week"
        @click="emit('select', candidate)"
      >
        {{ candidate }}
      </button>
    </div>
  </YsSheet>
</template>

<style>
.ys-week-picker {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  padding: 6px 0 4px;
}

.ys-week-picker__item {
  padding: 9px 0;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  color: var(--ys-text-1);
  cursor: pointer;
  background: var(--ys-surface-2);
  border: 1px solid var(--ys-border);
  border-radius: 7px;
}

.ys-week-picker__item.is-active {
  color: #fff;
  background: var(--ys-accent);
  border-color: var(--ys-accent);
}
</style>
