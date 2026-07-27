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
  courseCarryItems,
  createCourseColorResolver,
  darkTheme,
  formatDateKey,
  lightTheme,
  STANDARD_COURSE_TIMES,
  tokensToCssVars,
  weekOf,
} from '@iyotsuba/schedule-core'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import YsWeatherGlyph from './YsWeatherGlyph.vue'
import YsWeatherScene from './YsWeatherScene.vue'

export type TodayWidgetSize = 'compact' | 'standard' | 'large' | '1x1' | '1x2' | '2x1' | '2x2'
export type TodayResizeCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface TodayWidgetConfig {
  id: string
  enabled?: boolean
  size?: TodayWidgetSize
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
  /** 允许长按卡片或点击 Header 按钮调整顺序与尺寸 */
  arrangeable?: boolean
  /** Today 天气动态背景，默认开启。 */
  weatherScene?: boolean
  reduceMotion?: boolean
  /** 统一空状态文案，也可按内置 widget id 覆盖。 */
  emptyText?: string
  emptyTexts?: Record<string, string>
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
    { id: 'course-tasks' },
    { id: 'week-glance' },
    { id: 'weather' },
  ],
  theme: 'light',
  weather: null,
  title: '今日',
  dayPlans: () => ({}),
  arrangeable: true,
  weatherScene: true,
  reduceMotion: false,
  emptyText: undefined,
  emptyTexts: () => ({}),
})

const emit = defineEmits<{
  courseTap: [course: DisplayCourse]
  widgetTap: [id: string]
  'update:widgets': [widgets: TodayWidgetConfig[]]
  layoutChange: [widgets: TodayWidgetConfig[]]
  layoutEditing: [editing: boolean]
  widgetMove: [id: string, from: number, to: number]
  widgetResize: [id: string, size: TodayWidgetSize, corner: TodayResizeCorner]
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

const weatherTints: Record<WeatherKind, string> = {
  clear: '#f2a93c', cloudy: '#8fa3bd', overcast: '#76889f', fog: '#9aa8b8',
  drizzle: '#5b8cc9', rain: '#3f74b8', storm: '#5a5f9e', snow: '#7fb6dd', neutral: '#8793a3',
}

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
    .filter(item => item.state !== 'done' && courseCarryItems(item.course).length)
    .map(item => ({ course: item.course, materials: courseCarryItems(item.course) })),
)

const todayPlans = computed(() => props.dayPlans[formatDateKey(now.value)] ?? [])
const courseTasks = computed(() => todayCourses.value.flatMap(({ course }) =>
  (course.tasks ?? []).map(task => ({ course, task })),
))

const localWidgets = ref<TodayWidgetConfig[]>([])
const arranging = ref(false)
const activeWidget = ref<string | null>(null)
const draggingWidget = ref<string | null>(null)
const resizingWidget = ref<string | null>(null)
const draftSizes = ref<Record<string, TodayWidgetSize>>({})
let longPressTimer: ReturnType<typeof setTimeout> | null = null
let pressOrigin: { x: number, y: number } | null = null
let suppressWidgetClick = false
let dragStartIndex = -1
let resizeState: {
  id: string
  corner: TodayResizeCorner
  startX: number
  startY: number
  columns: 1 | 2
  rows: 1 | 2
  pointerId: number
} | null = null
const resizeCorners: TodayResizeCorner[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

function defaultWidgetSize(id: string): TodayWidgetSize {
  return ['week-glance', 'weather'].includes(id) ? '1x1' : '2x1'
}

function normalizeWidgets(widgets: TodayWidgetConfig[]) {
  return widgets.map(widget => ({ ...widget, size: widget.size ?? defaultWidgetSize(widget.id) }))
}

const initialWidgets = normalizeWidgets(props.widgets)

watch(() => props.widgets, (widgets) => {
  localWidgets.value = normalizeWidgets(widgets)
}, { immediate: true, deep: true })

const visibleWidgets = computed(() => localWidgets.value.filter(item => item.enabled !== false))

function sizeGrid(size: TodayWidgetSize): { columns: 1 | 2, rows: 1 | 2 } {
  if (size === 'compact' || size === '1x1') return { columns: 1, rows: 1 }
  if (size === 'large' || size === '2x2') return { columns: 2, rows: 2 }
  if (size === '1x2') return { columns: 1, rows: 2 }
  return { columns: 2, rows: 1 }
}

function gridSize(columns: 1 | 2, rows: 1 | 2): TodayWidgetSize {
  return `${columns}x${rows}` as TodayWidgetSize
}

function resolvedSize(widget: TodayWidgetConfig): TodayWidgetSize {
  return draftSizes.value[widget.id] ?? widget.size ?? defaultWidgetSize(widget.id)
}

function emptyFor(id: string, fallback: string): string {
  return props.emptyTexts[id] ?? props.emptyText ?? fallback
}

function publishLayout() {
  const next = localWidgets.value.map(widget => ({ ...widget }))
  emit('update:widgets', next)
  emit('layoutChange', next)
}

function setArranging(value: boolean, widgetId: string | null = null) {
  if (!props.arrangeable) {
    return
  }
  arranging.value = value
  activeWidget.value = value ? widgetId : null
  if (!value) {
    draggingWidget.value = null
    resizingWidget.value = null
    draftSizes.value = {}
  }
  emit('layoutEditing', value)
}

function toggleArranging() {
  setArranging(!arranging.value)
}

function clearLongPress() {
  if (longPressTimer) {
    clearTimeout(longPressTimer)
    longPressTimer = null
  }
  pressOrigin = null
}

function onWidgetPointerDown(event: PointerEvent, id: string) {
  if (!props.arrangeable || event.button !== 0 || (event.target as HTMLElement).closest('[data-resize-corner]')) {
    return
  }
  if (arranging.value) {
    event.preventDefault()
    activeWidget.value = id
    draggingWidget.value = id
    dragStartIndex = visibleWidgets.value.findIndex(widget => widget.id === id)
    ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
    return
  }
  clearLongPress()
  pressOrigin = { x: event.clientX, y: event.clientY }
  longPressTimer = setTimeout(() => {
    suppressWidgetClick = true
    setArranging(true, id)
    longPressTimer = null
  }, 480)
}

function onWidgetPointerMove(event: PointerEvent) {
  if (draggingWidget.value) {
    const target = document.elementFromPoint?.(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-widget]')
    const overId = target?.dataset.widget
    if (overId && overId !== draggingWidget.value) {
      reorderWidget(draggingWidget.value, visibleWidgets.value.findIndex(widget => widget.id === overId), false)
    }
    return
  }
  if (!pressOrigin) {
    return
  }
  if (Math.hypot(event.clientX - pressOrigin.x, event.clientY - pressOrigin.y) > 8) {
    clearLongPress()
  }
}

function onWidgetPointerEnd() {
  if (draggingWidget.value) {
    const id = draggingWidget.value
    const to = visibleWidgets.value.findIndex(widget => widget.id === id)
    draggingWidget.value = null
    if (dragStartIndex !== to) {
      publishLayout()
      emit('widgetMove', id, dragStartIndex, to)
    }
    dragStartIndex = -1
  }
  clearLongPress()
}

function handleWidgetClick(id: string) {
  if (arranging.value || suppressWidgetClick) {
    suppressWidgetClick = false
    activeWidget.value = id
    return
  }
  emit('widgetTap', id)
}

function moveWidget(id: string, offset: -1 | 1) {
  const visibleIndex = visibleWidgets.value.findIndex(widget => widget.id === id)
  reorderWidget(id, visibleIndex + offset)
}

function resizeWidget(id: string) {
  const sizes: TodayWidgetSize[] = ['1x1', '1x2', '2x1', '2x2']
  localWidgets.value = localWidgets.value.map((widget) => {
    if (widget.id !== id) {
      return widget
    }
    const size = widget.size ?? defaultWidgetSize(widget.id)
    return { ...widget, size: sizes[(sizes.indexOf(size) + 1) % sizes.length]! }
  })
  activeWidget.value = id
  publishLayout()
}

function reorderWidget(id: string, visibleIndex: number, publish = true) {
  const visible = visibleWidgets.value
  const fromVisible = visible.findIndex(widget => widget.id === id)
  if (fromVisible < 0) return
  const target = Math.max(0, Math.min(visibleIndex, visible.length - 1))
  if (target === fromVisible) return
  const [moving] = visible.splice(fromVisible, 1)
  visible.splice(target, 0, moving!)
  let cursor = 0
  localWidgets.value = localWidgets.value.map(widget => widget.enabled === false ? widget : visible[cursor++]!)
  activeWidget.value = id
  if (publish) {
    publishLayout()
    emit('widgetMove', id, fromVisible, target)
  }
}

function beginResize(event: PointerEvent, widget: TodayWidgetConfig, corner: TodayResizeCorner) {
  if (!arranging.value || event.button !== 0) return
  event.preventDefault()
  event.stopPropagation()
  const size = sizeGrid(resolvedSize(widget))
  resizeState = {
    id: widget.id, corner, startX: event.clientX, startY: event.clientY,
    columns: size.columns, rows: size.rows, pointerId: event.pointerId,
  }
  activeWidget.value = widget.id
  resizingWidget.value = widget.id
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
}

function resizeMove(event: PointerEvent) {
  if (!resizeState || resizeState.pointerId !== event.pointerId) return
  event.preventDefault()
  const horizontal = resizeState.corner.endsWith('right') ? 1 : -1
  const vertical = resizeState.corner.startsWith('bottom') ? 1 : -1
  const columns = Math.max(1, Math.min(2, resizeState.columns + Math.round((event.clientX - resizeState.startX) * horizontal / 56))) as 1 | 2
  const rows = Math.max(1, Math.min(2, resizeState.rows + Math.round((event.clientY - resizeState.startY) * vertical / 52))) as 1 | 2
  draftSizes.value = { ...draftSizes.value, [resizeState.id]: gridSize(columns, rows) }
}

function endResize(event?: PointerEvent) {
  if (!resizeState || (event && resizeState.pointerId !== event.pointerId)) return
  const { id, corner } = resizeState
  const size = draftSizes.value[id] ?? localWidgets.value.find(widget => widget.id === id)?.size ?? defaultWidgetSize(id)
  localWidgets.value = localWidgets.value.map(widget => widget.id === id ? { ...widget, size } : widget)
  const nextDraft = { ...draftSizes.value }
  delete nextDraft[id]
  draftSizes.value = nextDraft
  resizingWidget.value = null
  resizeState = null
  publishLayout()
  emit('widgetResize', id, size, corner)
}

function resetLayout() {
  localWidgets.value = initialWidgets.map(widget => ({ ...widget }))
  publishLayout()
}

function toggleWidget(id: string, enabled: boolean) {
  localWidgets.value = localWidgets.value.map(widget => widget.id === id ? { ...widget, enabled } : widget)
  publishLayout()
}

onBeforeUnmount(() => { clearLongPress(); resizeState = null })

defineExpose({
  setWidgets: (widgets: TodayWidgetConfig[]) => { localWidgets.value = normalizeWidgets(widgets); publishLayout() },
  setArranging,
  moveWidget,
  resizeWidget,
  toggleWidget,
  layoutReset: resetLayout,
})

const dateLabel = computed(() => {
  const labels = ['一', '二', '三', '四', '五', '六', '日']
  return `${now.value.getMonth() + 1}月${now.value.getDate()}日 周${labels[weekday.value - 1]} · 第${week.value}周`
})

const currentWeatherKind = computed<WeatherKind>(() =>
  todayWeather.value?.kind ?? props.weather?.current?.kind ?? 'neutral',
)

const todayStyle = computed(() => ({
  ...cssVars.value,
  '--ys-today-weather': weatherTints[currentWeatherKind.value],
}))
</script>

<template>
  <div
    class="ys-today"
    :class="[`ys-weather-${currentWeatherKind}`, { 'ys-dark': theme === 'dark', 'is-arranging': arranging, 'is-reduce-motion': reduceMotion }]"
    :style="todayStyle"
  >
    <YsWeatherScene
      v-if="weatherScene && !reduceMotion && currentWeatherKind !== 'neutral'"
      class="ys-today__weather-scene"
      :kind="currentWeatherKind"
      :dark="theme === 'dark'"
      :intensity="0.42"
    />
    <header class="ys-today__head">
      <div class="ys-today__head-copy">
        <strong>{{ title }}</strong>
        <span>{{ dateLabel }}</span>
      </div>
      <button
        v-if="arrangeable"
        type="button"
        class="ys-today__arrange-toggle"
        :class="{ 'is-active': arranging }"
        :aria-label="arranging ? '完成今日布局调整' : '调整今日布局'"
        :aria-pressed="arranging"
        :title="arranging ? '完成布局调整' : '调整今日布局'"
        @click="toggleArranging"
      >
        <i aria-hidden="true" />
      </button>
    </header>

    <div class="ys-today__grid">
      <section
        v-for="widget in visibleWidgets"
        :key="widget.id"
        class="ys-today__widget"
        :class="[
          `is-size-${resolvedSize(widget)}`,
          {
            'is-selected': activeWidget === widget.id,
            'is-dragging': draggingWidget === widget.id,
            'is-resizing': resizingWidget === widget.id,
          },
        ]"
        :data-widget="widget.id"
        :data-size="resolvedSize(widget)"
        :aria-label="arranging ? `${widget.id}，拖动重排，四角手柄缩放` : undefined"
        @pointerdown="onWidgetPointerDown($event, widget.id)"
        @pointermove="onWidgetPointerMove"
        @pointerup="onWidgetPointerEnd"
        @pointercancel="onWidgetPointerEnd"
        @contextmenu.prevent="setArranging(true, widget.id)"
        @click="handleWidgetClick(widget.id)"
      >
        <slot
          :name="`widget-${widget.id}`"
          :week="week"
          :today-courses="todayCourses"
          :ongoing="ongoing"
          :upcoming="upcoming"
          :weather="todayWeather"
          :readiness="readiness"
          :course-tasks="courseTasks"
          :size="resolvedSize(widget)"
          :arranging="arranging"
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
            <p v-else class="ys-today__empty">{{ emptyFor('next-course', '今天没有更多课程了') }}</p>
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
            <p v-else class="ys-today__empty">{{ emptyFor('today-timeline', '今天全天无课') }}</p>
          </template>

          <!-- 内置：记得带 -->
          <template v-else-if="widget.id === 'readiness'">
            <h3 class="ys-today__widget-title">记得带 🎒</h3>
            <ul v-if="readiness.length" class="ys-today__readiness">
              <li v-for="item in readiness" :key="item.course.displayId">
                <i class="ys-today__dot" :style="{ background: colorFor(item.course.name, item.course.color) }" />
                <span class="ys-today__name">{{ item.course.name }}</span>
                <span class="ys-today__materials">{{ item.materials.map(material => material.name).join('、') }}</span>
              </li>
            </ul>
            <p v-else class="ys-today__empty">{{ emptyFor('readiness', '今天没有需要携带的物品') }}</p>
          </template>

          <!-- 内置：今日计划 -->
          <template v-else-if="widget.id === 'plans'">
            <h3 class="ys-today__widget-title">今日计划 · 剩 {{ todayPlans.filter(p => !p.done).length }} 项</h3>
            <ul v-if="todayPlans.length" class="ys-today__plans">
              <li v-for="plan in todayPlans" :key="plan.id" :class="{ 'is-done': plan.done }">
                <i>{{ plan.done ? '✓' : '○' }}</i>{{ plan.text }}
              </li>
            </ul>
            <p v-else class="ys-today__empty">{{ emptyFor('plans', '今天还没有计划') }}</p>
          </template>

          <!-- 内置：课程任务 -->
          <template v-else-if="widget.id === 'course-tasks'">
            <h3 class="ys-today__widget-title">课程任务 · 剩 {{ courseTasks.filter(item => !item.task.done).length }} 项</h3>
            <ul v-if="courseTasks.length" class="ys-today__course-tasks">
              <li v-for="item in courseTasks" :key="`${item.course.displayId}-${item.task.id}`" :class="{ 'is-done': item.task.done }">
                <i class="ys-today__dot" :style="{ background: colorFor(item.course.name, item.course.color) }" />
                <span class="ys-today__name">{{ item.task.title }}</span>
                <small>{{ item.course.name }}</small>
              </li>
            </ul>
            <p v-else class="ys-today__empty">{{ emptyFor('course-tasks', '今天没有课程任务') }}</p>
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
              <YsWeatherGlyph :kind="todayWeather?.kind ?? weather?.current?.kind ?? 'neutral'" :size="26" />
              <b>{{ weather?.current?.temperatureC != null ? `${Math.round(weather!.current!.temperatureC!)}°` : '' }}</b>
              <span>{{ WEATHER_LABELS[(todayWeather?.kind ?? weather?.current?.kind ?? 'neutral')] }}</span>
              <span v-if="todayWeather?.highC != null">
                {{ Math.round(todayWeather!.lowC ?? 0) }}~{{ Math.round(todayWeather!.highC!) }}°
              </span>
            </div>
            <p v-else class="ys-today__empty">{{ emptyFor('weather', '暂无天气信息') }}</p>
          </template>
        </slot>
        <template v-if="arranging">
          <button
            v-for="corner in resizeCorners"
            :key="corner"
            type="button"
            class="ys-today__resize-handle"
            :class="`is-${corner}`"
            :data-resize-corner="corner"
            :aria-label="`从${corner}缩放${widget.id}`"
            :title="`拖动${corner}角调整尺寸`"
            @pointerdown="beginResize($event, widget, corner)"
            @pointermove="resizeMove"
            @pointerup="endResize"
            @pointercancel="endResize"
            @click.stop
          />
        </template>
      </section>
    </div>
  </div>
</template>

<style>
.ys-today {
  position: relative;
  isolation: isolate;
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  font-family: inherit;
  color: var(--ys-text-1);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--ys-today-weather) 10%, var(--ys-canvas)) 0%, var(--ys-canvas) 260px);
}

.ys-today__weather-scene {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.ys-today__head {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px 10px;
}

.ys-today__head-copy { display: flex; gap: 8px; align-items: baseline; min-width: 0; }

.ys-today__head strong { font-size: 20px; font-weight: 780; }
.ys-today__head span { font-size: 11px; color: var(--ys-text-3); }

.ys-today__arrange-toggle {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  color: var(--ys-text-3);
  cursor: pointer;
  background: var(--ys-surface-1);
  border: 1px solid var(--ys-border);
  border-radius: 7px;
}

.ys-today__arrange-toggle > i {
  display: grid;
  width: 13px;
  height: 13px;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 2px;
}

.ys-today__arrange-toggle > i::before,
.ys-today__arrange-toggle > i::after {
  content: '';
  background: currentcolor;
  border-radius: 1px;
  box-shadow: 7px 0 0 currentcolor;
}

.ys-today__arrange-toggle.is-active { color: var(--ys-accent); background: var(--ys-accent-soft); border-color: var(--ys-accent); }
.ys-today__arrange-toggle:focus-visible { outline: 3px solid var(--ys-focus-ring); outline-offset: 2px; }

.ys-today__grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ys-today__widget {
  position: relative;
  box-sizing: border-box;
  padding: 11px 12px;
  background: var(--ys-surface-1);
  border: 1px solid var(--ys-border);
  border-radius: 12px;
  overflow: visible;
  transform: translateZ(0);
  transition: border-color 160ms ease, box-shadow 160ms ease, min-height 180ms ease, transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 160ms ease;
}

.ys-today__widget.is-size-compact,
.ys-today__widget.is-size-1x1 { grid-column: span 1; grid-row: span 1; padding: 9px 10px; }
.ys-today__widget.is-size-standard,
.ys-today__widget.is-size-2x1 { grid-column: span 2; grid-row: span 1; }
.ys-today__widget.is-size-1x2 { grid-column: span 1; grid-row: span 2; min-height: 156px; }
.ys-today__widget.is-size-large,
.ys-today__widget.is-size-2x2 { grid-column: span 2; grid-row: span 2; min-height: 156px; padding: 16px; }

.ys-today.is-arranging .ys-today__widget {
  cursor: grab;
  border-style: dashed;
  touch-action: none;
  user-select: none;
}

.ys-today.is-arranging .ys-today__widget:active { cursor: grabbing; }

.ys-today.is-arranging .ys-today__widget.is-selected {
  border-color: var(--ys-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ys-accent) 13%, transparent);
}

.ys-today.is-arranging .ys-today__widget > :not(.ys-today__resize-handle) { pointer-events: none; }

.ys-today__widget.is-dragging {
  z-index: 5;
  opacity: 0.84;
  box-shadow: 0 14px 34px rgb(20 28 38 / 22%);
  transform: scale(1.015);
}

.ys-today__widget.is-resizing {
  z-index: 6;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ys-accent) 16%, transparent), 0 14px 34px rgb(20 28 38 / 18%);
}

.ys-today__resize-handle {
  position: absolute;
  z-index: 7;
  width: 18px;
  height: 18px;
  padding: 0;
  cursor: nwse-resize;
  touch-action: none;
  background: var(--ys-surface-1);
  border: 2px solid var(--ys-accent);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgb(20 28 38 / 20%);
}

.ys-today__resize-handle::after {
  position: absolute;
  inset: 5px;
  content: '';
  background: var(--ys-accent);
  border-radius: 50%;
}

.ys-today__resize-handle.is-top-left { top: -9px; left: -9px; }
.ys-today__resize-handle.is-top-right { top: -9px; right: -9px; cursor: nesw-resize; }
.ys-today__resize-handle.is-bottom-left { bottom: -9px; left: -9px; cursor: nesw-resize; }
.ys-today__resize-handle.is-bottom-right { right: -9px; bottom: -9px; }
.ys-today__resize-handle:focus-visible { outline: 3px solid var(--ys-focus-ring); outline-offset: 2px; }

.ys-today__readiness,
.ys-today__plans,
.ys-today__course-tasks {
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

.ys-today__course-tasks li {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  min-width: 0;
  font-size: 12px;
}

.ys-today__course-tasks li.is-done { opacity: 0.52; }
.ys-today__course-tasks li.is-done .ys-today__name { text-decoration: line-through; }
.ys-today__course-tasks small { font-size: 10px; color: var(--ys-text-3); }

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

@keyframes ys-today-widget-enter {
  from { opacity: 0; transform: translateY(8px) scale(0.99); }
  to { opacity: 1; transform: none; }
}

.ys-today__widget { animation: ys-today-widget-enter 360ms cubic-bezier(0.22, 0.61, 0.36, 1) both; }
.ys-today__widget:nth-child(2) { animation-delay: 36ms; }
.ys-today__widget:nth-child(3) { animation-delay: 72ms; }
.ys-today__widget:nth-child(4) { animation-delay: 108ms; }
.ys-today__widget:nth-child(5) { animation-delay: 144ms; }
.ys-today__widget:nth-child(6) { animation-delay: 180ms; }

@media (prefers-reduced-motion: reduce) {
  .ys-today__widget { animation: none; transition-duration: 1ms; }
  .ys-today__weather-scene { display: none; }
}

.ys-today.is-reduce-motion .ys-today__widget { animation: none; transition-duration: 1ms; }
</style>
