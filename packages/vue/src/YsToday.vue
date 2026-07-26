<script setup lang="ts">
// 今日指挥台：widget 注册表驱动。
// 内置 widget：next-course / today-timeline / week-glance / weather。
// 自定义：widgets 里写任意 id + 提供 #widget-<id> 插槽即可插入自己的卡片；
// 内置 id 同名插槽可整体替换内置实现。与 <YsSchedule> 用同一份 courses 数据即天然联动。
import type {
  Course,
  CourseTime,
  DayOverride,
  DayPlanMap,
  DisplayCourse,
  ThemeTokens,
  WeatherKind,
  WeatherSnapshot,
} from '@iyotsuba/schedule-core'
import {
  buildWeekModel,
  createCourseColorResolver,
  darkTheme,
  formatDateKey,
  lightTheme,
  STANDARD_COURSE_TIMES,
  tokensToCssVars,
  weekOf,
} from '@iyotsuba/schedule-core'
import { computed } from 'vue'

export interface TodayWidgetConfig {
  id: string
  enabled?: boolean
}

const props = withDefaults(defineProps<{
  /** 自定义元素场景下属性可能晚于首帧到达，故容忍缺省 */
  courses?: Course[]
  termStart?: Date
  totalWeeks?: number
  overrides?: DayOverride[]
  courseTimes?: CourseTime[] | 'standard'
  /** 顺序即展示顺序；未知 id 由 #widget-<id> 插槽渲染 */
  widgets?: TodayWidgetConfig[]
  theme?: 'light' | 'dark' | Partial<ThemeTokens>
  weather?: WeatherSnapshot | null
  /** 当前时刻（默认实时，测试/演示可注入） */
  now?: Date
  title?: string
  /** 日计划（与 YsSchedule 共用同一份即联动） */
  dayPlans?: DayPlanMap
}>(), {
  courses: () => [],
  totalWeeks: 20,
  overrides: () => [],
  courseTimes: 'standard',
  widgets: () => [
    { id: 'next-course' },
    { id: 'today-timeline' },
    { id: 'readiness' },
    { id: 'plans' },
    { id: 'week-glance' },
    { id: 'weather' },
  ],
  theme: 'light',
  weather: null,
  title: '今日',
  dayPlans: () => ({}),
})

const emit = defineEmits<{
  courseTap: [course: DisplayCourse]
  widgetTap: [id: string]
}>()

const tokens = computed<ThemeTokens>(() => {
  if (props.theme === 'light') {
    return lightTheme
  }
  if (props.theme === 'dark') {
    return darkTheme
  }
  return { ...lightTheme, ...props.theme }
})
const cssVars = computed(() => tokensToCssVars(tokens.value))
const colorFor = computed(() => createCourseColorResolver(tokens.value))

const now = computed(() => props.now ?? new Date())
const week = computed(() =>
  props.termStart ? weekOf(now.value, props.termStart, props.totalWeeks) : 1,
)
const weekday = computed(() => {
  const day = now.value.getDay()
  return day === 0 ? 7 : day
})

const times = computed<CourseTime[]>(() =>
  props.courseTimes === 'standard' ? STANDARD_COURSE_TIMES : props.courseTimes,
)

function minutesOf(time: string): number {
  const [hour = 0, minute = 0] = time.split(':').map(Number)
  return hour * 60 + minute
}

const nowMinutes = computed(() => now.value.getHours() * 60 + now.value.getMinutes())

interface TodayCourse {
  course: DisplayCourse
  start: string
  end: string
  startMinutes: number
  endMinutes: number
  state: 'done' | 'ongoing' | 'upcoming'
}

const todayCourses = computed<TodayCourse[]>(() => {
  const model = buildWeekModel(props.courses, week.value, {
    termStart: props.termStart,
    overrides: props.overrides,
  })
  return model.courses
    .filter(course => course.weekday === weekday.value && course.active)
    .map((course) => {
      const start = times.value[course.startSection - 1]?.start ?? '00:00'
      const end = times.value[course.endSection - 1]?.end ?? '23:59'
      const startMinutes = minutesOf(start)
      const endMinutes = minutesOf(end)
      const state: TodayCourse['state']
        = nowMinutes.value >= endMinutes ? 'done' : nowMinutes.value >= startMinutes ? 'ongoing' : 'upcoming'
      return { course, start, end, startMinutes, endMinutes, state }
    })
    .sort((a, b) => a.startMinutes - b.startMinutes)
})

const ongoing = computed(() => todayCourses.value.find(item => item.state === 'ongoing') ?? null)
const upcoming = computed(() => todayCourses.value.find(item => item.state === 'upcoming') ?? null)
const doneCount = computed(() => todayCourses.value.filter(item => item.state === 'done').length)

const nextCountdown = computed(() => {
  if (!upcoming.value) {
    return ''
  }
  const diff = upcoming.value.startMinutes - nowMinutes.value
  if (diff >= 60) {
    return `${Math.floor(diff / 60)}小时${diff % 60 ? `${diff % 60}分` : ''}后`
  }
  return `${Math.max(1, diff)}分钟后`
})

const WEATHER_LABELS: Record<WeatherKind, string> = {
  clear: '晴',
  cloudy: '多云',
  overcast: '阴',
  fog: '雾',
  drizzle: '毛毛雨',
  rain: '雨',
  storm: '雷雨',
  snow: '雪',
  neutral: '—',
}

const todayWeather = computed(() =>
  props.weather?.daily.find(item => item.date === formatDateKey(now.value)) ?? null,
)

/** 今日携带物品汇总（按课程） */
const readiness = computed(() =>
  todayCourses.value
    .filter(item => item.state !== 'done' && item.course.materials?.length)
    .map(item => ({ course: item.course, materials: item.course.materials! })),
)

const todayPlans = computed(() => props.dayPlans[formatDateKey(now.value)] ?? [])

const visibleWidgets = computed(() => props.widgets.filter(item => item.enabled !== false))

const dateLabel = computed(() => {
  const labels = ['一', '二', '三', '四', '五', '六', '日']
  return `${now.value.getMonth() + 1}月${now.value.getDate()}日 周${labels[weekday.value - 1]} · 第${week.value}周`
})
</script>

<template>
  <div class="ys-today" :class="{ 'ys-dark': theme === 'dark' }" :style="cssVars">
    <header class="ys-today__head">
      <strong>{{ title }}</strong>
      <span>{{ dateLabel }}</span>
    </header>

    <div class="ys-today__grid">
      <section
        v-for="widget in visibleWidgets"
        :key="widget.id"
        class="ys-today__widget"
        :data-widget="widget.id"
        @click="emit('widgetTap', widget.id)"
      >
        <slot
          :name="`widget-${widget.id}`"
          :week="week"
          :today-courses="todayCourses"
          :ongoing="ongoing"
          :upcoming="upcoming"
          :weather="todayWeather"
        >
          <!-- 内置：下一节课 -->
          <template v-if="widget.id === 'next-course'">
            <h3 class="ys-today__widget-title">{{ ongoing ? '正在上课' : '下一节课' }}</h3>
            <template v-if="ongoing || upcoming">
              <button
                type="button"
                class="ys-today__next"
                :style="{ '--ys-course-color': colorFor((ongoing ?? upcoming)!.course.name, (ongoing ?? upcoming)!.course.color) }"
                @click.stop="emit('courseTap', (ongoing ?? upcoming)!.course)"
              >
                <strong>{{ (ongoing ?? upcoming)!.course.name }}</strong>
                <span>{{ (ongoing ?? upcoming)!.start }} - {{ (ongoing ?? upcoming)!.end }}</span>
                <span v-if="(ongoing ?? upcoming)!.course.location">@{{ (ongoing ?? upcoming)!.course.location }}</span>
                <em v-if="!ongoing">{{ nextCountdown }}</em>
                <em v-else>进行中</em>
              </button>
            </template>
            <p v-else class="ys-today__empty">今天没有更多课程了 🎉</p>
          </template>

          <!-- 内置：今日时间线 -->
          <template v-else-if="widget.id === 'today-timeline'">
            <h3 class="ys-today__widget-title">今日课程 · {{ todayCourses.length }} 节</h3>
            <ul v-if="todayCourses.length" class="ys-today__timeline">
              <li
                v-for="item in todayCourses"
                :key="item.course.displayId"
                :class="`is-${item.state}`"
                @click.stop="emit('courseTap', item.course)"
              >
                <i class="ys-today__dot" :style="{ background: colorFor(item.course.name, item.course.color) }" />
                <span class="ys-today__time">{{ item.start }}</span>
                <span class="ys-today__name">{{ item.course.name }}</span>
                <span class="ys-today__state">
                  {{ item.state === 'done' ? '已结束' : item.state === 'ongoing' ? '进行中' : '' }}
                </span>
              </li>
            </ul>
            <p v-else class="ys-today__empty">今天全天无课</p>
          </template>

          <!-- 内置：记得带 -->
          <template v-else-if="widget.id === 'readiness'">
            <h3 class="ys-today__widget-title">记得带 🎒</h3>
            <ul v-if="readiness.length" class="ys-today__readiness">
              <li v-for="item in readiness" :key="item.course.displayId">
                <i class="ys-today__dot" :style="{ background: colorFor(item.course.name, item.course.color) }" />
                <span class="ys-today__name">{{ item.course.name }}</span>
                <span class="ys-today__materials">{{ item.materials.join('、') }}</span>
              </li>
            </ul>
            <p v-else class="ys-today__empty">今天没有需要携带的物品</p>
          </template>

          <!-- 内置：今日计划 -->
          <template v-else-if="widget.id === 'plans'">
            <h3 class="ys-today__widget-title">今日计划 · 剩 {{ todayPlans.filter(p => !p.done).length }} 项</h3>
            <ul v-if="todayPlans.length" class="ys-today__plans">
              <li v-for="plan in todayPlans" :key="plan.id" :class="{ 'is-done': plan.done }">
                <i>{{ plan.done ? '✓' : '○' }}</i>{{ plan.text }}
              </li>
            </ul>
            <p v-else class="ys-today__empty">今天还没有计划</p>
          </template>

          <!-- 内置：本周概览 -->
          <template v-else-if="widget.id === 'week-glance'">
            <h3 class="ys-today__widget-title">概览</h3>
            <div class="ys-today__stats">
              <div><b>{{ week }}</b><span>当前周</span></div>
              <div><b>{{ todayCourses.length }}</b><span>今日课程</span></div>
              <div><b>{{ doneCount }}/{{ todayCourses.length }}</b><span>已完成</span></div>
            </div>
          </template>

          <!-- 内置：天气 -->
          <template v-else-if="widget.id === 'weather'">
            <h3 class="ys-today__widget-title">天气</h3>
            <div v-if="todayWeather || weather?.current" class="ys-today__weather">
              <b>{{ weather?.current?.temperatureC != null ? `${Math.round(weather!.current!.temperatureC!)}°` : '' }}</b>
              <span>{{ WEATHER_LABELS[(todayWeather?.kind ?? weather?.current?.kind ?? 'neutral')] }}</span>
              <span v-if="todayWeather?.highC != null">
                {{ Math.round(todayWeather!.lowC ?? 0) }}~{{ Math.round(todayWeather!.highC!) }}°
              </span>
            </div>
            <p v-else class="ys-today__empty">接入 WeatherProvider 后展示</p>
          </template>
        </slot>
      </section>
    </div>
  </div>
</template>

<style>
.ys-today {
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  font-family: inherit;
  color: var(--ys-text-1);
  background: var(--ys-canvas);
}

.ys-today__head {
  display: flex;
  gap: 8px;
  align-items: baseline;
  padding: 2px 2px 10px;
}

.ys-today__head strong { font-size: 20px; font-weight: 780; }
.ys-today__head span { font-size: 11px; color: var(--ys-text-3); }

.ys-today__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ys-today__widget {
  box-sizing: border-box;
  padding: 11px 12px;
  background: var(--ys-surface-1);
  border: 1px solid var(--ys-border);
  border-radius: 12px;
}

.ys-today__widget[data-widget="next-course"],
.ys-today__widget[data-widget="today-timeline"],
.ys-today__widget[data-widget="readiness"],
.ys-today__widget[data-widget="plans"] {
  grid-column: span 2;
}

.ys-today__readiness,
.ys-today__plans {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.ys-today__readiness li {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.ys-today__materials {
  margin-left: auto;
  font-size: 11px;
  color: var(--ys-text-2);
}

.ys-today__plans li {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.ys-today__plans li.is-done { color: var(--ys-text-3); text-decoration: line-through; }
.ys-today__plans li i { font-style: normal; color: var(--ys-success); }

.ys-today__widget-title {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--ys-text-3);
}

.ys-today__next {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  width: 100%;
  padding: 10px 12px;
  font: inherit;
  color: #fff;
  text-align: left;
  cursor: pointer;
  background: var(--ys-course-color);
  border: 0;
  border-radius: 9px;
}

.ys-today__next strong { font-size: 15px; font-weight: 760; }
.ys-today__next span { font-size: 11px; opacity: 0.88; }

.ys-today__next em {
  margin-top: 3px;
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
  padding: 1px 7px;
  background: rgb(0 0 0 / 26%);
  border-radius: 4px;
}

.ys-today__timeline {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.ys-today__timeline li {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  cursor: pointer;
}

.ys-today__timeline li.is-done { opacity: 0.45; }
.ys-today__timeline li.is-ongoing .ys-today__name { font-weight: 760; }

.ys-today__dot {
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.ys-today__time {
  flex: 0 0 auto;
  font-variant-numeric: tabular-nums;
  color: var(--ys-text-3);
}

.ys-today__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ys-today__state {
  margin-left: auto;
  font-size: 10px;
  color: var(--ys-accent);
}

.ys-today__stats {
  display: flex;
  justify-content: space-between;
}

.ys-today__stats div {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ys-today__stats b { font-size: 16px; }
.ys-today__stats span { font-size: 9px; color: var(--ys-text-3); }

.ys-today__weather {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.ys-today__weather b { font-size: 20px; }
.ys-today__weather span { font-size: 11px; color: var(--ys-text-2); }

.ys-today__empty {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--ys-text-3);
}
</style>
