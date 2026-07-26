<script setup lang="ts">
// 换周过渡实况演示：三个真实 <YsSchedule> 实例自动循环换周,所见即所得
import type { BuiltinTransitionName, Course } from '@iyotsuba/schedule-vue'
import { YsSchedule } from '@iyotsuba/schedule-vue'
import { onBeforeUnmount, onMounted, reactive } from 'vue'

const presets: Array<{ name: BuiltinTransitionName, label: string, note: string }> = [
  { name: 'wave', label: 'wave 波浪覆盖', note: '稳定格静止,只有变化的格子被波浪扫过' },
  { name: 'slide', label: 'slide 真实换页', note: '整页滑动 + 进场轻量逐列淡入' },
  { name: 'none', label: 'none 直切', note: '无动画,即时切换' },
]

const weeks = reactive<Record<string, number>>({ wave: 1, slide: 1, none: 1 })

const courses: Course[] = [
  { id: 'a', name: '高数', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20 },
  { id: 'b', name: '英语', weekday: 2, startSection: 3, endSection: 4, startWeek: 1, endWeek: 20 },
  { id: 'c', name: '体育', weekday: 4, startSection: 1, endSection: 2, startWeek: 1, endWeek: 16, parity: 'odd' },
  { id: 'd', name: '线代', weekday: 4, startSection: 1, endSection: 2, startWeek: 2, endWeek: 16, parity: 'even' },
  { id: 'e', name: '物理', weekday: 5, startSection: 3, endSection: 4, startWeek: 1, endWeek: 16 },
  { id: 'f', name: '导论', weekday: 3, startSection: 5, endSection: 6, startWeek: 2, endWeek: 6 },
]

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    for (const preset of presets) {
      weeks[preset.name] = weeks[preset.name] === 1 ? 2 : 1
    }
  }, 2400)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="showcase">
    <figure v-for="preset in presets" :key="preset.name" class="showcase__item">
      <div class="showcase__frame">
        <YsSchedule
          v-model:week="weeks[preset.name]"
          :courses="courses"
          :transition="preset.name"
          :visible-days="5"
          :row-height="26"
          top-bar="compact"
          :swipeable="false"
          week-picker="none"
          course-detail="none"
        />
      </div>
      <figcaption>
        <strong>{{ preset.label }}</strong>
        <span>{{ preset.note }}</span>
      </figcaption>
    </figure>
  </div>
</template>

<style scoped>
.showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin: 18px 0;
}

.showcase__item {
  margin: 0;
}

.showcase__frame {
  height: 330px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
}

.showcase__item figcaption {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin-top: 7px;
}

.showcase__item strong {
  font-size: 13px;
}

.showcase__item span {
  font-size: 12px;
  color: var(--vp-c-text-2);
}
</style>
