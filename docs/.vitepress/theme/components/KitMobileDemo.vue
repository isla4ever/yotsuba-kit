<script setup lang="ts">
import type {
  BuiltinTransitionName,
  CardEffect,
  Course,
  DayPlanMap,
  DetailField,
  PaletteName,
  ScheduleDensity,
  TodayWidgetConfig,
  WeatherSnapshot,
} from '@iyotsuba/schedule-vue'
import { defaultScheduleGuideSteps, YsSchedule, YsToday } from '@iyotsuba/schedule-vue'
import {
  BookOpenText,
  CalendarDays,
  CloudSun,
  LayoutDashboard,
  ListTodo,
  Settings2,
  Sparkles,
  X,
} from '@lucide/vue'
import { computed, nextTick, ref } from 'vue'

type DemoView = 'schedule' | 'today'

const props = withDefaults(defineProps<{
  view?: DemoView
  theme?: 'light' | 'dark'
  weatherScene?: boolean
}>(), {
  view: 'schedule',
  theme: 'light',
  weatherScene: true,
})

const emit = defineEmits<{
  'update:view': [view: DemoView]
  'update:theme': [theme: 'light' | 'dark']
  'update:weatherScene': [enabled: boolean]
}>()

const week = ref(1)
const settingsOpen = ref(false)
const transition = ref<BuiltinTransitionName>('wave')
const cardEffect = ref<CardEffect>('shimmer')
const density = ref<ScheduleDensity>('rich')
const palette = ref<PaletteName>('classic')
const scheduleRef = ref<InstanceType<typeof YsSchedule> | null>(null)
const termStart = new Date(2026, 8, 7)
const now = new Date(2026, 8, 7, 7, 35)
const detailFields: DetailField[] = ['time', 'weeks', 'location', 'teacher', 'weather', 'note', 'materials', 'tasks']

const courses: Course[] = [
  {
    id: 'math', name: '高等数学', teacher: '陈老师', location: '教一 201', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20,
    books: [{ id: 'math-book', title: '高等数学（第八版）', author: '同济大学数学科学学院', required: true }],
    materials: [{ id: 'calculator', name: '计算器', kind: 'device', required: true }],
    tasks: [{ id: 'math-task', title: '完成第三章课后题', dueAt: '2026-09-10T21:00:00+08:00', priority: 'high' }],
    note: '课前完成本周习题。',
  },
  { id: 'data', name: '数据结构', teacher: '周老师', location: '教二 105', weekday: 1, startSection: 5, endSection: 6, startWeek: 1, endWeek: 20, materials: ['笔记本电脑'] },
  { id: 'english', name: '大学英语', teacher: 'Lily', location: '外语楼 302', weekday: 2, startSection: 3, endSection: 4, startWeek: 1, endWeek: 20 },
  { id: 'program', name: '程序设计', teacher: '吴老师', location: '机房 A', weekday: 3, startSection: 5, endSection: 6, startWeek: 1, endWeek: 20, tasks: [{ id: 'program-task', title: '提交课程管理小程序', priority: 'normal' }] },
  { id: 'pe', name: '体育（单周）', location: '东操场', weekday: 4, startSection: 1, endSection: 2, startWeek: 1, endWeek: 16, parity: 'odd', materials: ['运动鞋'] },
  { id: 'linear', name: '线性代数（双周）', teacher: '彭老师', location: '教一 305', weekday: 4, startSection: 1, endSection: 2, startWeek: 2, endWeek: 16, parity: 'even' },
  { id: 'physics', name: '大学物理', teacher: '林老师', location: '理科楼 210', weekday: 5, startSection: 3, endSection: 4, startWeek: 1, endWeek: 16 },
]

const weather: WeatherSnapshot = {
  current: { kind: 'clear', temperatureC: 24, label: '晴朗' },
  daily: [
    { date: '2026-09-07', kind: 'clear', highC: 28, lowC: 19, label: '晴' },
    { date: '2026-09-08', kind: 'cloudy', highC: 27, lowC: 20, label: '多云' },
    { date: '2026-09-09', kind: 'rain', highC: 24, lowC: 18, label: '阵雨' },
    { date: '2026-09-10', kind: 'cloudy', highC: 25, lowC: 19, label: '多云' },
    { date: '2026-09-11', kind: 'clear', highC: 29, lowC: 20, label: '晴' },
  ],
  updatedAt: now.getTime(),
}

const dayPlans = ref<DayPlanMap>({
  '2026-09-07': [
    { id: 'plan-1', text: '整理数学课堂笔记', done: false },
    { id: 'plan-2', text: '预约图书馆座位', done: true },
  ],
})
const widgets = ref<TodayWidgetConfig[]>([
  { id: 'next-course', size: '2x1' },
  { id: 'weather', size: '1x1' },
  { id: 'today-timeline', size: '2x1' },
  { id: 'readiness', size: '2x1' },
  { id: 'course-tasks', size: '2x1' },
  { id: 'plans', size: '2x1' },
  { id: 'week-glance', size: '1x1' },
])

const title = computed(() => props.view === 'schedule' ? '课程表' : '今日')

function chooseView(view: DemoView) {
  settingsOpen.value = false
  emit('update:view', view)
}

function toggleTheme() {
  emit('update:theme', props.theme === 'light' ? 'dark' : 'light')
}

async function startGuide() {
  emit('update:view', 'schedule')
  settingsOpen.value = false
  await nextTick()
  scheduleRef.value?.startGuide()
}

defineExpose({ startGuide })
</script>

<template>
  <div class="kit-mobile-demo" :class="[`is-${theme}`, { 'has-settings': settingsOpen }]">
    <header class="kit-mobile-demo__header">
      <div class="kit-mobile-demo__brand">
        <i aria-hidden="true" />
        <span><strong>Yotsuba</strong><small>第 {{ week }} 周 · 2026 秋</small></span>
      </div>
      <div class="kit-mobile-demo__header-actions">
        <button type="button" class="kit-mobile-demo__weather" :aria-label="weatherScene ? '关闭天气场景' : '开启天气场景'" title="天气场景" @click="emit('update:weatherScene', !weatherScene)">
          <CloudSun :size="16" aria-hidden="true" /><b>24°</b>
        </button>
        <button type="button" :aria-label="theme === 'light' ? '切换深色主题' : '切换浅色主题'" :title="theme === 'light' ? '深色主题' : '浅色主题'" @click="toggleTheme">
          <span aria-hidden="true">{{ theme === 'light' ? '◐' : '☼' }}</span>
        </button>
      </div>
    </header>

    <main class="kit-mobile-demo__stage">
      <section v-if="view === 'schedule'" class="kit-mobile-demo__schedule-view" aria-label="互动课表示例">
        <div class="kit-mobile-demo__toolbar">
          <span><b>{{ title }}</b><small>天气、教材、任务与详情联动</small></span>
          <select v-model="transition" aria-label="换周动画">
            <option value="wave">波浪</option>
            <option value="slide">滑动</option>
            <option value="cube">立方</option>
            <option value="drop">落下</option>
            <option value="zoom">缩放</option>
          </select>
        </div>
        <YsSchedule
          ref="scheduleRef"
          v-model:week="week"
          class="kit-mobile-demo__schedule"
          :courses="courses"
          :term-start="termStart"
          :weather="weather"
          :day-plans="dayPlans"
          :theme="theme"
          :transition="transition"
          :density="density"
          :palette="palette"
          :card-effect="cardEffect"
          :weather-scene="weatherScene"
          weekday-weather="icon"
          :sheets="{ placement: 'bottom', glass: true, contained: true, adjustable: true }"
          :detail="{ hero: 'weather', layout: 'standard', fields: detailFields, emptyText: '暂无信息', adjustable: true }"
          :guide="{ mode: 'walkthrough', steps: defaultScheduleGuideSteps }"
        />
      </section>

      <YsToday
        v-else
        v-model:widgets="widgets"
        class="kit-mobile-demo__today"
        :courses="courses"
        :term-start="termStart"
        :now="now"
        :weather="weather"
        :day-plans="dayPlans"
        :theme="theme"
        :weather-scene="weatherScene"
        empty-text="暂无信息"
        arrangeable
      />
    </main>

    <nav class="kit-mobile-demo__nav" aria-label="演示导航">
      <button type="button" :class="{ 'is-active': view === 'schedule' }" :aria-current="view === 'schedule' ? 'page' : undefined" @click="chooseView('schedule')">
        <CalendarDays :size="18" aria-hidden="true" /><span>课表</span>
      </button>
      <button type="button" :class="{ 'is-active': view === 'today' }" :aria-current="view === 'today' ? 'page' : undefined" @click="chooseView('today')">
        <LayoutDashboard :size="18" aria-hidden="true" /><span>今日</span>
      </button>
      <button type="button" :class="{ 'is-active': settingsOpen }" :aria-expanded="settingsOpen" @click="settingsOpen = !settingsOpen">
        <Settings2 :size="18" aria-hidden="true" /><span>设置</span>
      </button>
    </nav>

    <section v-if="settingsOpen" class="kit-mobile-demo__settings" aria-label="演示设置">
      <header><strong>演示设置</strong><button type="button" aria-label="关闭设置" title="关闭" @click="settingsOpen = false"><X :size="16" aria-hidden="true" /></button></header>
      <label><span>课程密度</span><select v-model="density"><option value="minimal">精简</option><option value="normal">标准</option><option value="rich">丰富</option></select></label>
      <label><span>课程特效</span><select v-model="cardEffect"><option value="shimmer">流光</option><option value="glow">辉光</option><option value="aurora">极光</option><option value="breathe">呼吸</option><option value="none">关闭</option></select></label>
      <label><span>主题配色</span><select v-model="palette"><option value="classic">经典蓝</option><option value="macaron">马卡龙</option><option value="morandi">莫兰迪</option><option value="forest">森林</option></select></label>
      <div class="kit-mobile-demo__settings-actions">
        <button type="button" @click="startGuide"><Sparkles :size="14" aria-hidden="true" />引导</button>
        <button type="button" @click="chooseView('today')"><ListTodo :size="14" aria-hidden="true" />任务</button>
        <button type="button" @click="chooseView('schedule')"><BookOpenText :size="14" aria-hidden="true" />教材</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.kit-mobile-demo {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  overflow: hidden;
  color: #17212e;
  background: #f7f9fc;
  font-family: var(--vp-font-family-base);
  isolation: isolate;
}

.kit-mobile-demo.is-dark { color: #f1f5fb; background: #141922; }
.kit-mobile-demo__header { z-index: 12; display: flex; flex: 0 0 50px; align-items: center; justify-content: space-between; padding: 0 12px; background: color-mix(in srgb, var(--ys-surface-1, #fff) 90%, transparent); border-bottom: 1px solid color-mix(in srgb, #1b2838 11%, transparent); }
.kit-mobile-demo__brand { display: flex; gap: 7px; align-items: center; min-width: 0; }
.kit-mobile-demo__brand i { width: 5px; height: 25px; background: #3d76dd; border-radius: 3px; }
.kit-mobile-demo__brand span { display: flex; flex-direction: column; min-width: 0; }
.kit-mobile-demo__brand strong { font-size: 13px; letter-spacing: 0; }
.kit-mobile-demo__brand small { margin-top: 1px; font-size: 9px; color: #718096; }
.kit-mobile-demo__header-actions { display: flex; gap: 5px; align-items: center; }
.kit-mobile-demo__header-actions button { display: inline-grid; place-items: center; width: 29px; height: 29px; padding: 0; font: inherit; color: #526273; cursor: pointer; background: #edf1f7; border: 1px solid #dce3ed; border-radius: 6px; }
.kit-mobile-demo.is-dark .kit-mobile-demo__header-actions button { color: #d9e2ed; background: #273140; border-color: #354152; }
.kit-mobile-demo__header-actions .kit-mobile-demo__weather { display: inline-flex; gap: 3px; width: auto; padding: 0 7px; color: #3978d1; }
.kit-mobile-demo__weather b { font-size: 11px; }
.kit-mobile-demo__stage { position: relative; flex: 1; min-height: 0; overflow: hidden; }
.kit-mobile-demo__schedule-view { display: flex; flex-direction: column; height: 100%; }
.kit-mobile-demo__toolbar { display: flex; flex: 0 0 39px; align-items: center; justify-content: space-between; padding: 0 11px; background: var(--ys-surface-1, #fff); border-bottom: 1px solid var(--ys-border, #e1e6ee); }
.kit-mobile-demo__toolbar span { display: flex; flex-direction: column; min-width: 0; }
.kit-mobile-demo__toolbar b { font-size: 11px; }
.kit-mobile-demo__toolbar small { overflow: hidden; max-width: 180px; margin-top: 1px; font-size: 8px; color: #8290a0; text-overflow: ellipsis; white-space: nowrap; }
.kit-mobile-demo__toolbar select, .kit-mobile-demo__settings select { height: 26px; padding: 0 21px 0 7px; font: inherit; font-size: 9px; color: #455365; background: #f1f4f8; border: 1px solid #dce3ed; border-radius: 5px; }
.kit-mobile-demo.is-dark .kit-mobile-demo__toolbar, .kit-mobile-demo.is-dark .kit-mobile-demo__toolbar select, .kit-mobile-demo.is-dark .kit-mobile-demo__settings select { color: #e2e9f2; background: #202936; border-color: #354152; }
.kit-mobile-demo__schedule, .kit-mobile-demo__today { flex: 1; min-width: 0; min-height: 0; }
.kit-mobile-demo__today { height: 100%; overflow: auto; }
.kit-mobile-demo__nav { z-index: 22; display: grid; flex: 0 0 54px; grid-template-columns: repeat(3, 1fr); padding: 4px 10px max(5px, env(safe-area-inset-bottom)); background: color-mix(in srgb, var(--ys-surface-1, #fff) 93%, transparent); border-top: 1px solid var(--ys-border, #dfe5ee); }
.kit-mobile-demo__nav button { display: grid; place-items: center; align-content: center; gap: 1px; min-width: 0; padding: 0; font: inherit; font-size: 9px; font-weight: 650; color: #7a8797; cursor: pointer; background: transparent; border: 0; }
.kit-mobile-demo__nav button.is-active { color: #3d76dd; }
.kit-mobile-demo__nav button:focus-visible, .kit-mobile-demo__header-actions button:focus-visible, .kit-mobile-demo__settings button:focus-visible { outline: 2px solid #79a2ef; outline-offset: 2px; }
.kit-mobile-demo__settings { position: absolute; right: 8px; bottom: 61px; left: 8px; z-index: 30; padding: 10px; color: #233042; background: color-mix(in srgb, #fff 94%, transparent); border: 1px solid #d8e1ec; border-radius: 9px; box-shadow: 0 12px 34px rgb(27 45 68 / 18%); backdrop-filter: blur(18px); }
.kit-mobile-demo.is-dark .kit-mobile-demo__settings { color: #ebf0f7; background: color-mix(in srgb, #1d2734 94%, transparent); border-color: #3b485a; }
.kit-mobile-demo__settings header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 7px; margin-bottom: 5px; border-bottom: 1px solid #e4eaf2; }
.kit-mobile-demo.is-dark .kit-mobile-demo__settings header { border-color: #394658; }
.kit-mobile-demo__settings header strong { font-size: 11px; }
.kit-mobile-demo__settings header button { display: grid; place-items: center; width: 24px; height: 24px; padding: 0; color: inherit; cursor: pointer; background: transparent; border: 0; }
.kit-mobile-demo__settings label { display: grid; grid-template-columns: 72px 1fr; gap: 8px; align-items: center; min-height: 32px; font-size: 10px; }
.kit-mobile-demo__settings label span { color: #778596; }
.kit-mobile-demo__settings-actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; padding-top: 8px; margin-top: 4px; border-top: 1px solid #e4eaf2; }
.kit-mobile-demo.is-dark .kit-mobile-demo__settings-actions { border-color: #394658; }
.kit-mobile-demo__settings-actions button { display: inline-flex; gap: 3px; align-items: center; justify-content: center; min-width: 0; height: 27px; padding: 0 3px; font: inherit; font-size: 9px; font-weight: 650; color: #3d76dd; cursor: pointer; background: #edf3fd; border: 1px solid #d5e3fa; border-radius: 5px; }
.kit-mobile-demo.is-dark .kit-mobile-demo__settings-actions button { color: #b8d1ff; background: #263653; border-color: #3d5680; }
</style>
