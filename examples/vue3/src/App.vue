<script setup lang="ts">
import type { BuiltinTransitionName, Course } from '@yotsuba/schedule-vue'
import { YsSchedule } from '@yotsuba/schedule-vue'
import { ref } from 'vue'

const week = ref(1)
const transition = ref<BuiltinTransitionName>('wave')
const header = ref<'compact' | 'standard' | 'expanded'>('standard')
const dark = ref(false)

const termStart = new Date(2026, 6, 20) // 演示：本周为第 1 周

const courses: Course[] = [
  { id: 'math', name: '高等数学', teacher: '陈老师', location: '教1-201', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20 },
  { id: 'ds', name: '数据结构', location: '教2-105', weekday: 1, startSection: 5, endSection: 6, startWeek: 1, endWeek: 20 },
  { id: 'en', name: '大学英语', location: '外语楼302', weekday: 2, startSection: 3, endSection: 4, startWeek: 1, endWeek: 20 },
  { id: 'intro', name: '专业导论', location: '报告厅', weekday: 2, startSection: 9, endSection: 10, startWeek: 2, endWeek: 5 },
  { id: 'prog', name: '程序设计', location: '机房A', weekday: 3, startSection: 5, endSection: 6, startWeek: 1, endWeek: 20 },
  { id: 'pe', name: '体育（单周）', location: '东操场', weekday: 4, startSection: 1, endSection: 2, startWeek: 1, endWeek: 16, parity: 'odd' },
  { id: 'la', name: '线性代数（双周）', location: '教1-305', weekday: 4, startSection: 1, endSection: 2, startWeek: 2, endWeek: 16, parity: 'even' },
  { id: 'phy', name: '大学物理', location: '理科楼210', weekday: 5, startSection: 3, endSection: 4, startWeek: 1, endWeek: 16 },
  { id: 'chem', name: '化学实验', location: '实验楼404', weekday: 5, startSection: 7, endSection: 9, startWeek: 1, endWeek: 8 },
  { id: 'pol', name: '形势与政策', location: '教3-101', weekday: 6, startSection: 3, endSection: 4, startWeek: 1, endWeek: 4 },
]
</script>

<template>
  <div class="demo" :class="{ dark }">
    <header class="demo__bar">
      <strong>第 {{ week }} 周</strong>
      <button @click="week = Math.max(1, week - 1)">上一周</button>
      <button @click="week = Math.min(20, week + 1)">下一周</button>
      <select v-model="transition">
        <option value="wave">wave 波浪覆盖</option>
        <option value="slide">slide 滑动</option>
        <option value="fade">fade 淡化</option>
        <option value="none">none 直切</option>
      </select>
      <select v-model="header">
        <option value="compact">compact 表头</option>
        <option value="standard">standard 表头</option>
        <option value="expanded">expanded 表头</option>
      </select>
      <label><input v-model="dark" type="checkbox"> 深色</label>
    </header>
    <YsSchedule
      v-model:week="week"
      class="demo__schedule"
      :courses="courses"
      :term-start="termStart"
      :transition="transition"
      :header="header"
      :theme="dark ? 'dark' : 'light'"
    />
  </div>
</template>

<style scoped>
.demo {
  display: flex;
  flex-direction: column;
  max-width: 430px;
  height: 100%;
  margin: 0 auto;
}

.demo__bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  font-size: 13px;
  border-bottom: 1px solid #ddd;
}

.demo__schedule { flex: 1; min-height: 0; }
</style>
