<script setup lang="ts">
import type { BuiltinTransitionName, Course } from '@iyotsuba/schedule-vue'
import { YsSchedule } from '@iyotsuba/schedule-vue'
import { computed, ref } from 'vue'

const week = ref(1)
const transitions: BuiltinTransitionName[] = ['wave', 'slide', 'none']
const transitionIndex = ref(0)
const transition = computed(() => transitions[transitionIndex.value]!)
const topBars = ['compact', 'standard', 'expanded'] as const
const topBarIndex = ref(1)
const topBar = computed(() => topBars[topBarIndex.value]!)
const dark = ref(false)
const dockOpen = ref(false)

const termStart = new Date(2026, 6, 20) // 演示：本周为第 1 周

const courses: Course[] = [
  { id: 'math', name: '高等数学', teacher: '陈老师', location: '教1-201', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20 },
  { id: 'ds', name: '数据结构', location: '教2-105', weekday: 1, startSection: 5, endSection: 6, startWeek: 1, endWeek: 20 },
  { id: 'en', name: '大学英语', location: '外语楼302', weekday: 2, startSection: 3, endSection: 4, startWeek: 1, endWeek: 20 },
  { id: 'intro', name: '专业导论', location: '报告厅', weekday: 2, startSection: 9, endSection: 10, startWeek: 2, endWeek: 5 },
  { id: 'prog', name: '程序设计', location: '机房A', weekday: 3, startSection: 5, endSection: 6, startWeek: 1, endWeek: 20 },
  { id: 'custom', name: '自习（自定义）', location: '图书馆', weekday: 3, startSection: 9, endSection: 10, startWeek: 1, endWeek: 20, custom: true },
  { id: 'pe', name: '体育（单周）', location: '东操场', weekday: 4, startSection: 1, endSection: 2, startWeek: 1, endWeek: 16, parity: 'odd' },
  { id: 'la', name: '线性代数（双周）', location: '教1-305', weekday: 4, startSection: 1, endSection: 2, startWeek: 2, endWeek: 16, parity: 'even' },
  { id: 'phy', name: '大学物理', location: '理科楼210', weekday: 5, startSection: 3, endSection: 4, startWeek: 1, endWeek: 16 },
  { id: 'chem', name: '化学实验', location: '实验楼404', weekday: 5, startSection: 7, endSection: 9, startWeek: 1, endWeek: 8 },
  { id: 'pol', name: '形势与政策', location: '教3-101', weekday: 6, startSection: 3, endSection: 4, startWeek: 1, endWeek: 4 },
]
</script>

<template>
  <div class="demo" :class="{ dark }">
    <YsSchedule
      v-model:week="week"
      class="demo__schedule"
      :courses="courses"
      :term-start="termStart"
      :transition="transition"
      :top-bar="topBar"
      :theme="dark ? 'dark' : 'light'"
    />

    <!-- 演示控件：底部 dock，不占顶部空间 -->
    <div class="dock" :class="{ 'is-open': dockOpen }">
      <template v-if="dockOpen">
        <button class="dock__item" @click="transitionIndex = (transitionIndex + 1) % transitions.length">
          动画<b>{{ transition }}</b>
        </button>
        <button class="dock__item" @click="topBarIndex = (topBarIndex + 1) % topBars.length">
          顶栏<b>{{ topBar }}</b>
        </button>
        <button class="dock__item" @click="dark = !dark">
          {{ dark ? '浅色' : '深色' }}
        </button>
      </template>
      <button class="dock__toggle" :aria-label="dockOpen ? '收起演示工具' : '展开演示工具'" @click="dockOpen = !dockOpen">
        {{ dockOpen ? '✕' : '⚙' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.demo {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 430px;
  height: 100%;
  margin: 0 auto;
}

.demo__schedule { flex: 1; min-height: 0; }

.dock {
  position: absolute;
  right: 12px;
  bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.dock__item {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  background: rgb(28 35 45 / 92%);
  border: 0;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgb(0 0 0 / 22%);
}

.dock__item b { font-weight: 750; }

.dock__toggle {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  font-size: 17px;
  color: #fff;
  cursor: pointer;
  background: #3d76dd;
  border: 0;
  border-radius: 50%;
  box-shadow: 0 6px 16px rgb(61 118 221 / 42%);
}
</style>
