<script setup lang="ts">
// 内置课程详情（现成方案）：重叠课先选后看，详情信息区可用 slot 深度替换/追加
import type { DisplayCourse } from '@iyotsuba/schedule-core'
import { computed, ref, watch } from 'vue'
import YsSheet from './YsSheet.vue'

const props = defineProps<{
  open: boolean
  stack: DisplayCourse[]
  colorFor: (name: string, explicit?: string) => string
  vars?: Record<string, string>
}>()

const emit = defineEmits<{ close: [] }>()

const selectedId = ref<string | null>(null)

watch(() => props.open, (open) => {
  if (open) {
    selectedId.value = props.stack.length === 1 ? props.stack[0]!.displayId : null
  }
})

const course = computed(() =>
  props.stack.find(item => item.displayId === selectedId.value) ?? null,
)

const parityLabel = (item: DisplayCourse) =>
  item.parity === 'odd' ? '单周' : item.parity === 'even' ? '双周' : '每周'
</script>

<template>
  <YsSheet :open="open" :title="course ? '课程详情' : '选择课程'" :vars="vars" @close="emit('close')">
    <!-- 重叠课程：先选择 -->
    <ul v-if="!course" class="ys-detail__stack">
      <li v-for="item in stack" :key="item.displayId">
        <button type="button" class="ys-detail__stack-item" @click="selectedId = item.displayId">
          <i class="ys-detail__dot" :style="{ background: colorFor(item.name, item.color) }" />
          <span class="ys-detail__stack-name">{{ item.name }}</span>
          <span class="ys-detail__stack-meta">{{ item.startWeek }}-{{ item.endWeek }}周 · {{ parityLabel(item) }}</span>
        </button>
      </li>
    </ul>

    <div v-else class="ys-detail">
      <div class="ys-detail__hero" :style="{ background: colorFor(course.name, course.color) }">
        <strong>{{ course.name }}</strong>
        <span v-if="!course.active && !course.makeup">非本周</span>
        <span v-else-if="course.makeup">补班</span>
      </div>
      <dl class="ys-detail__grid">
        <div><dt>时间</dt><dd>周{{ ['一', '二', '三', '四', '五', '六', '日'][course.weekday - 1] }} 第{{ course.startSection }}-{{ course.endSection }}节</dd></div>
        <div><dt>周次</dt><dd>{{ course.startWeek }}-{{ course.endWeek }}周（{{ parityLabel(course) }}）</dd></div>
        <div v-if="course.location"><dt>地点</dt><dd>{{ course.location }}</dd></div>
        <div v-if="course.teacher"><dt>教师</dt><dd>{{ course.teacher }}</dd></div>
      </dl>
      <!-- 宿主追加内容（作业、计划、备注等） -->
      <slot name="detail-extra" :course="course" />
      <div class="ys-detail__actions">
        <slot name="detail-actions" :course="course" :close="() => emit('close')" />
      </div>
    </div>
  </YsSheet>
</template>

<style>
.ys-detail__stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
  margin: 0;
  list-style: none;
}

.ys-detail__stack-item {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 11px 12px;
  font: inherit;
  color: var(--ys-text-1);
  text-align: left;
  cursor: pointer;
  background: var(--ys-surface-2);
  border: 1px solid var(--ys-border);
  border-radius: 9px;
}

.ys-detail__dot {
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.ys-detail__stack-name {
  font-weight: 700;
}

.ys-detail__stack-meta {
  margin-left: auto;
  font-size: 11px;
  color: var(--ys-text-3);
}

.ys-detail__hero {
  display: flex;
  gap: 8px;
  align-items: baseline;
  padding: 14px 14px 12px;
  margin-top: 4px;
  color: #fff;
  border-radius: 10px;
}

.ys-detail__hero strong {
  font-size: 17px;
  font-weight: 780;
}

.ys-detail__hero span {
  padding: 1px 6px;
  font-size: 10px;
  background: rgb(0 0 0 / 30%);
  border-radius: 4px;
}

.ys-detail__grid {
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin: 12px 0 0;
}

.ys-detail__grid dt {
  font-size: 10px;
  color: var(--ys-text-3);
}

.ys-detail__grid dd {
  margin: 1px 0 0;
  font-size: 13px;
}

.ys-detail__actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}
</style>
