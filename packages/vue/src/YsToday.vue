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
  GuideConfig,
  GuideStep,
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
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import YsGuide from './YsGuide.vue'
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
  /** 模块引导；autoStart 仅在 storageKey 未完成时首次播放。 */
  guide?: GuideConfig | false
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
    { id: 'next-course', size: '2x1' },
    { id: 'weather', size: '2x2' },
    { id: 'today-timeline', size: '2x1' },
    { id: 'readiness', size: '1x1' },
    { id: 'course-tasks', size: '1x1' },
    { id: 'plans', size: '1x1' },
    { id: 'week-glance', size: '1x1' },
  ],
  theme: 'light',
  weather: null,
  title: '今日',
  dayPlans: () => ({}),
  arrangeable: true,
  weatherScene: true,
  guide: false,
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
  guideStep: [step: GuideStep, index: number]
  guideFinish: []
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
  drizzle: '#5b8cc9', rain: '#3f74b8', 'heavy-rain': '#315f98', storm: '#5a5f9e', snow: '#7fb6dd', neutral: '#8793a3',
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

const weekModel = computed(() =>
  buildWeekModel(props.courses, week.value, {
    termStart: props.termStart,
    overrides: props.overrides,
  }),
)

const todayCourses = computed<TodayCourse[]>(() => {
  return weekModel.value.courses
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

const weekdayShortLabels = ['一', '二', '三', '四', '五', '六', '日']
const weekCourseCounts = computed(() => weekdayShortLabels.map((_, index) =>
  weekModel.value.courses.filter(course => course.active && course.weekday === index + 1).length,
))
const maxWeekCourseCount = computed(() => Math.max(1, ...weekCourseCounts.value))
const weekCourseTotal = computed(() => weekCourseCounts.value.reduce((total, count) => total + count, 0))
const busiestWeekday = computed(() => {
  const max = Math.max(...weekCourseCounts.value)
  return max > 0 ? `周${weekdayShortLabels[weekCourseCounts.value.indexOf(max)]}` : '暂无课程'
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
  'heavy-rain': '大雨',
  storm: '雷雨',
  snow: '雪',
  neutral: '—',
}

const todayWeather = computed(() =>
  props.weather?.daily.find(item => item.date === formatDateKey(now.value)) ?? null,
)

const todayHourlyWeather = computed(() => {
  const dateKey = formatDateKey(now.value)
  return (props.weather?.hourly ?? [])
    .filter(item => item.time.slice(0, 10) === dateKey)
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time))
})

function widgetVariant(size: TodayWidgetSize): 'compact' | 'tall' | 'wide' | 'large' {
  const { columns, rows } = sizeGrid(size)
  if (columns === 1 && rows === 1) return 'compact'
  if (columns === 1) return 'tall'
  if (rows === 1) return 'wide'
  return 'large'
}

function itemLimit(size: TodayWidgetSize): number {
  const variant = widgetVariant(size)
  return variant === 'compact' ? 1 : variant === 'wide' ? 2 : variant === 'tall' ? 4 : 6
}

function weatherPoints(size: TodayWidgetSize) {
  const limit = widgetVariant(size) === 'large' ? 6 : widgetVariant(size) === 'tall' ? 4 : 4
  return todayHourlyWeather.value.slice(0, limit)
}

function weatherTimeLabel(time: string): string {
  const parsed = new Date(time)
  if (!Number.isNaN(parsed.getTime())) {
    return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
  }
  return time.slice(11, 16)
}

function weatherTemperatureHeight(temperature?: number): number {
  const values = todayHourlyWeather.value
    .map(item => item.temperatureC)
    .filter((value): value is number => value != null)
  if (temperature == null || !values.length) return 32
  const low = Math.min(...values)
  const high = Math.max(...values)
  if (high === low) return 58
  return 28 + (temperature - low) / (high - low) * 52
}

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
const todayRoot = ref<HTMLElement | null>(null)
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
const layoutAnimations = new Map<string, Animation>()

function defaultWidgetSize(id: string): TodayWidgetSize {
  if (id === 'weather') return '2x2'
  if (['readiness', 'course-tasks', 'plans', 'week-glance'].includes(id)) return '1x1'
  return '2x1'
}

function normalizeWidgets(widgets: TodayWidgetConfig[]) {
  return widgets.map(widget => ({ ...widget, size: widget.size ?? defaultWidgetSize(widget.id) }))
}

const initialWidgets = normalizeWidgets(props.widgets)

watch(() => props.widgets, (widgets) => {
  localWidgets.value = normalizeWidgets(widgets)
}, { immediate: true, deep: true })

const visibleWidgets = computed(() => localWidgets.value.filter(item => item.enabled !== false))

const GUIDE_WIDGET_ANCHORS: Record<string, string> = {
  'next-course': 'today-next-course',
  'weather': 'today-weather',
  'today-timeline': 'today-timeline',
  'readiness': 'today-readiness',
  'course-tasks': 'today-tasks',
  'plans': 'today-plans',
  'week-glance': 'today-week-glance',
}

function guideAnchorFor(id: string): string | undefined {
  return GUIDE_WIDGET_ANCHORS[id]
}

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

function runLayoutTransition(mutation: () => void) {
  const elements = Array.from(todayRoot.value?.querySelectorAll<HTMLElement>('[data-widget]') ?? [])
  const before = new Map(elements.map(element => [element.dataset.widget ?? '', element.getBoundingClientRect()]))
  mutation()
  if (props.reduceMotion || typeof HTMLElement === 'undefined') return
  void nextTick(() => {
    for (const element of elements) {
      if (!element.isConnected || typeof element.animate !== 'function') continue
      const id = element.dataset.widget ?? ''
      const previous = before.get(id)
      if (!previous) continue
      const current = element.getBoundingClientRect()
      if (!current.width || !current.height) continue
      const deltaX = previous.left - current.left
      const deltaY = previous.top - current.top
      const scaleX = previous.width / current.width
      const scaleY = previous.height / current.height
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5
        && Math.abs(scaleX - 1) < 0.01 && Math.abs(scaleY - 1) < 0.01) continue
      layoutAnimations.get(id)?.cancel()
      const animation = element.animate([
        { transformOrigin: 'top left', transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY}) translateZ(0)` },
        { transformOrigin: 'top left', transform: 'translateZ(0)' },
      ], { duration: 220, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' })
      layoutAnimations.set(id, animation)
      animation.addEventListener('finish', () => {
        if (layoutAnimations.get(id) === animation) layoutAnimations.delete(id)
      }, { once: true })
    }
  })
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
  runLayoutTransition(() => {
    localWidgets.value = localWidgets.value.map((widget) => {
      if (widget.id !== id) {
        return widget
      }
      const size = widget.size ?? defaultWidgetSize(widget.id)
      return { ...widget, size: sizes[(sizes.indexOf(size) + 1) % sizes.length]! }
    })
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
  runLayoutTransition(() => {
    localWidgets.value = localWidgets.value.map(widget => widget.enabled === false ? widget : visible[cursor++]!)
  })
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
  const nextSize = gridSize(columns, rows)
  if (draftSizes.value[resizeState.id] === nextSize) return
  runLayoutTransition(() => {
    draftSizes.value = { ...draftSizes.value, [resizeState!.id]: nextSize }
  })
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
  runLayoutTransition(() => {
    localWidgets.value = initialWidgets.map(widget => ({ ...widget }))
  })
  publishLayout()
}

const guideRef = ref<InstanceType<typeof YsGuide> | null>(null)

function startGuide() {
  if (arranging.value) {
    setArranging(false)
  }
  guideRef.value?.start()
}

function toggleWidget(id: string, enabled: boolean) {
  localWidgets.value = localWidgets.value.map(widget => widget.id === id ? { ...widget, enabled } : widget)
  publishLayout()
}

onBeforeUnmount(() => {
  clearLongPress()
  resizeState = null
  layoutAnimations.forEach(animation => animation.cancel())
  layoutAnimations.clear()
})

defineExpose({
  setWidgets: (widgets: TodayWidgetConfig[]) => { localWidgets.value = normalizeWidgets(widgets); publishLayout() },
  setArranging,
  moveWidget,
  resizeWidget,
  toggleWidget,
  layoutReset: resetLayout,
  startGuide,
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
    ref="todayRoot"
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
    <header class="ys-today__head" data-ys="today-head">
      <div class="ys-today__head-copy">
        <strong>{{ title }}</strong>
        <span>{{ dateLabel }}</span>
      </div>
      <div class="ys-today__head-actions">
        <button
          v-if="guide"
          type="button"
          class="ys-today__guide-toggle"
          aria-label="查看今日引导"
          title="查看今日引导"
          @click="startGuide"
        >
          <span aria-hidden="true">?</span>
        </button>
        <button
          v-if="arrangeable"
          type="button"
          class="ys-today__arrange-toggle"
          :class="{ 'is-active': arranging }"
          data-ys="today-arrange"
          :aria-label="arranging ? '完成今日布局调整' : '调整今日布局'"
          :aria-pressed="arranging"
          :title="arranging ? '完成布局调整' : '调整今日布局'"
          @click="toggleArranging"
        >
          <svg v-if="arranging" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m5 12 4 4L19 6" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
          </svg>
        </button>
      </div>
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
        :data-ys="guideAnchorFor(widget.id)"
        :data-size="resolvedSize(widget)"
        :aria-label="arranging
          ? activeWidget === widget.id
            ? `${widget.id}，已选择，拖动重排或使用四角控点缩放`
            : `${widget.id}，点按选择，拖动重排`
          : undefined"
        @pointerdown="onWidgetPointerDown($event, widget.id)"
        @pointermove="onWidgetPointerMove"
        @pointerup="onWidgetPointerEnd"
        @pointercancel="onWidgetPointerEnd"
        @contextmenu.prevent="setArranging(true, widget.id)"
        @click="handleWidgetClick(widget.id)"
      >
        <Transition name="ys-today-content" mode="out-in">
          <div
            :key="`${widget.id}-${resolvedSize(widget)}`"
            class="ys-today__widget-content"
            :class="`is-${widgetVariant(resolvedSize(widget))}`"
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
              :layout="sizeGrid(resolvedSize(widget))"
              :arranging="arranging"
              :resizing="resizingWidget === widget.id"
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
                <span class="ys-today__next-meta">{{ (ongoing ?? upcoming)!.start }} - {{ (ongoing ?? upcoming)!.end }}<template v-if="(ongoing ?? upcoming)!.course.location"> · {{ (ongoing ?? upcoming)!.course.location }}</template></span>
                <em>{{ ongoing ? '进行中' : nextCountdown }}</em>
              </button>
              <ul
                v-if="['tall', 'large'].includes(widgetVariant(resolvedSize(widget)))"
                class="ys-today__course-preview"
              >
                <li
                  v-for="item in todayCourses.filter(course => course.state !== 'done').slice(0, widgetVariant(resolvedSize(widget)) === 'large' ? 4 : 3)"
                  :key="item.course.displayId"
                >
                  <time>{{ item.start }}</time>
                  <i :style="{ background: colorFor(item.course.name, item.course.color) }" />
                  <span>{{ item.course.name }}</span>
                  <small>{{ item.course.location || `${item.course.startSection}-${item.course.endSection}节` }}</small>
                </li>
              </ul>
            </template>
            <p v-else class="ys-today__empty">{{ emptyFor('next-course', '今天没有更多课程了') }}</p>
          </template>

          <!-- 内置：今日时间线 -->
          <template v-else-if="widget.id === 'today-timeline'">
            <h3 class="ys-today__widget-title">今日课程 · {{ todayCourses.length }} 节</h3>
            <div v-if="todayCourses.length && widgetVariant(resolvedSize(widget)) === 'compact'" class="ys-today__compact-summary">
              <b>{{ doneCount }}/{{ todayCourses.length }}</b>
              <span>已完成</span>
              <small>{{ (ongoing ?? upcoming)?.course.name || '今日课程已结束' }}</small>
            </div>
            <ul v-else-if="todayCourses.length" class="ys-today__timeline">
              <li
                v-for="item in todayCourses.slice(0, itemLimit(resolvedSize(widget)))"
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
            <h3 class="ys-today__widget-title">记得带</h3>
            <div v-if="readiness.length && widgetVariant(resolvedSize(widget)) === 'compact'" class="ys-today__compact-summary">
              <b>{{ readiness.reduce((total, item) => total + item.materials.length, 0) }}</b>
              <span>件物品</span>
              <small>{{ readiness[0]?.materials.map(material => material.name).join('、') }}</small>
            </div>
            <ul v-else-if="readiness.length" class="ys-today__readiness">
              <li v-for="item in readiness.slice(0, itemLimit(resolvedSize(widget)))" :key="item.course.displayId">
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
            <div v-if="todayPlans.length && widgetVariant(resolvedSize(widget)) === 'compact'" class="ys-today__compact-summary is-progress">
              <b>{{ todayPlans.filter(plan => plan.done).length }}/{{ todayPlans.length }}</b>
              <span>已完成</span>
              <i><span :style="{ width: `${todayPlans.filter(plan => plan.done).length / todayPlans.length * 100}%` }" /></i>
            </div>
            <ul v-else-if="todayPlans.length" class="ys-today__plans">
              <li v-for="plan in todayPlans.slice(0, itemLimit(resolvedSize(widget)))" :key="plan.id" :class="{ 'is-done': plan.done }">
                <i>{{ plan.done ? '✓' : '○' }}</i>{{ plan.text }}
              </li>
            </ul>
            <p v-else class="ys-today__empty">{{ emptyFor('plans', '今天还没有计划') }}</p>
          </template>

          <!-- 内置：课程任务 -->
          <template v-else-if="widget.id === 'course-tasks'">
            <h3 class="ys-today__widget-title">课程任务 · 剩 {{ courseTasks.filter(item => !item.task.done).length }} 项</h3>
            <div v-if="courseTasks.length && widgetVariant(resolvedSize(widget)) === 'compact'" class="ys-today__compact-summary">
              <b>{{ courseTasks.filter(item => !item.task.done).length }}</b>
              <span>项待完成</span>
              <small>{{ courseTasks.find(item => !item.task.done)?.task.title || '全部完成' }}</small>
            </div>
            <ul v-else-if="courseTasks.length" class="ys-today__course-tasks">
              <li v-for="item in courseTasks.slice(0, itemLimit(resolvedSize(widget)))" :key="`${item.course.displayId}-${item.task.id}`" :class="{ 'is-done': item.task.done }">
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
            <div
              v-if="!['compact', '1x1'].includes(resolvedSize(widget))"
              class="ys-today__week-chart"
              role="img"
              :aria-label="`本周课程分布，共${weekCourseTotal}个课程块，${busiestWeekday}最多`"
            >
              <div v-for="(count, index) in weekCourseCounts" :key="weekdayShortLabels[index]" class="ys-today__week-bar">
                <b>{{ count }}</b>
                <i><span :style="{ height: `${count ? Math.max(14, count / maxWeekCourseCount * 100) : 5}%` }" /></i>
                <small>{{ weekdayShortLabels[index] }}</small>
              </div>
            </div>
            <p v-if="['large', '2x2'].includes(resolvedSize(widget))" class="ys-today__week-summary">
              本周共 {{ weekCourseTotal }} 个课程块 · {{ busiestWeekday }}最忙
            </p>
          </template>

          <!-- 内置：天气 -->
          <template v-else-if="widget.id === 'weather'">
            <div v-if="todayWeather || weather?.current" class="ys-today__weather">
              <div class="ys-today__weather-head">
                <h3 class="ys-today__widget-title">今日天气</h3>
                <span v-if="todayWeather?.highC != null" class="ys-today__weather-range">
                  {{ Math.round(todayWeather!.lowC ?? 0) }}~{{ Math.round(todayWeather!.highC!) }}°
                </span>
              </div>
              <div class="ys-today__weather-current">
                <YsWeatherGlyph
                  :kind="todayWeather?.kind ?? weather?.current?.kind ?? 'neutral'"
                  :size="widgetVariant(resolvedSize(widget)) === 'large' ? 48 : widgetVariant(resolvedSize(widget)) === 'compact' ? 27 : 36"
                />
                <div>
                  <b>{{ weather?.current?.temperatureC != null ? `${Math.round(weather!.current!.temperatureC!)}°` : '--°' }}</b>
                  <span>{{ WEATHER_LABELS[(todayWeather?.kind ?? weather?.current?.kind ?? 'neutral')] }}</span>
                </div>
              </div>
              <div
                v-if="widgetVariant(resolvedSize(widget)) === 'wide' && weatherPoints(resolvedSize(widget)).length"
                class="ys-today__weather-strip"
                role="img"
                aria-label="今日分时温度趋势"
              >
                <div v-for="point in weatherPoints(resolvedSize(widget))" :key="point.time">
                  <time>{{ weatherTimeLabel(point.time) }}</time>
                  <i><span :style="{ height: `${weatherTemperatureHeight(point.temperatureC)}%` }" /></i>
                  <b>{{ point.temperatureC == null ? '--' : `${Math.round(point.temperatureC)}°` }}</b>
                </div>
              </div>
              <ul
                v-else-if="widgetVariant(resolvedSize(widget)) === 'tall' && weatherPoints(resolvedSize(widget)).length"
                class="ys-today__weather-hours"
              >
                <li v-for="point in weatherPoints(resolvedSize(widget))" :key="point.time">
                  <time>{{ weatherTimeLabel(point.time) }}</time>
                  <YsWeatherGlyph :kind="point.kind" :size="18" />
                  <span>{{ WEATHER_LABELS[point.kind] }}</span>
                  <b>{{ point.temperatureC == null ? '--' : `${Math.round(point.temperatureC)}°` }}</b>
                </li>
              </ul>
              <div
                v-else-if="widgetVariant(resolvedSize(widget)) === 'large' && weatherPoints(resolvedSize(widget)).length"
                class="ys-today__weather-panel"
              >
                <div class="ys-today__weather-panel-head">
                  <span>逐时变化</span>
                  <small>{{ weatherPoints(resolvedSize(widget)).length }} 个时段</small>
                </div>
                <div class="ys-today__weather-forecast" role="img" aria-label="今日逐时天气与温度">
                  <div v-for="point in weatherPoints(resolvedSize(widget))" :key="point.time">
                    <time>{{ weatherTimeLabel(point.time) }}</time>
                    <i><span :style="{ height: `${weatherTemperatureHeight(point.temperatureC)}%` }" /></i>
                    <YsWeatherGlyph :kind="point.kind" :size="17" />
                    <b>{{ point.temperatureC == null ? '--' : `${Math.round(point.temperatureC)}°` }}</b>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="ys-today__empty">{{ emptyFor('weather', '暂无天气信息') }}</p>
          </template>
            </slot>
          </div>
        </Transition>
        <template v-if="arranging && activeWidget === widget.id">
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
    <YsGuide
      v-if="guide"
      ref="guideRef"
      :config="guide"
      :root="todayRoot"
      :vars="cssVars"
      @step="(step, index) => emit('guideStep', step, index)"
      @finish="emit('guideFinish')"
    />
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

.ys-today__head-actions {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 6px;
  align-items: center;
}

.ys-today__guide-toggle,
.ys-today__arrange-toggle {
  display: inline-flex;
  flex: 0 0 36px;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: var(--ys-text-3);
  cursor: pointer;
  background: var(--ys-surface-1);
  border: 1px solid var(--ys-border);
  border-radius: 8px;
  transition: color 160ms ease, background 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.ys-today__guide-toggle > span {
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  font-size: 13px;
  font-weight: 760;
  line-height: 1;
  border: 1.7px solid currentcolor;
  border-radius: 50%;
}

.ys-today__arrange-toggle > svg {
  display: block;
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.ys-today__arrange-toggle.is-active { color: var(--ys-accent); background: var(--ys-accent-soft); border-color: var(--ys-accent); }
.ys-today__guide-toggle:hover,
.ys-today__arrange-toggle:hover { color: var(--ys-text-1); border-color: color-mix(in srgb, var(--ys-accent) 40%, var(--ys-border)); }
.ys-today__guide-toggle:active,
.ys-today__arrange-toggle:active { transform: scale(0.94); }
.ys-today__guide-toggle:focus-visible,
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
  transition: border-color 160ms ease, box-shadow 160ms ease, transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity 160ms ease;
}

.ys-today__widget.is-size-compact,
.ys-today__widget.is-size-1x1 { grid-column: span 1; grid-row: span 1; height: 112px; padding: 9px 10px; }
.ys-today__widget.is-size-standard,
.ys-today__widget.is-size-2x1 { grid-column: span 2; grid-row: span 1; height: 112px; }
.ys-today__widget.is-size-1x2 { grid-column: span 1; grid-row: span 2; height: 236px; }
.ys-today__widget.is-size-large,
.ys-today__widget.is-size-2x2 { grid-column: span 2; grid-row: span 2; height: 236px; padding: 16px; }

.ys-today__widget-content { min-width: 0; height: 100%; overflow: hidden; }

.ys-today-content-enter-active,
.ys-today-content-leave-active { transition: opacity 120ms ease, transform 180ms cubic-bezier(0.22, 0.61, 0.36, 1); }
.ys-today-content-enter-from { opacity: 0; transform: scale(0.985); }
.ys-today-content-leave-to { opacity: 0; transform: scale(1.01); }

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
  width: 28px;
  height: 28px;
  padding: 0;
  cursor: nwse-resize;
  touch-action: none;
  background: transparent;
  border: 0;
}

.ys-today__resize-handle::after {
  position: absolute;
  width: 10px;
  height: 10px;
  content: '';
  background: var(--ys-surface-1);
  border: 1.5px solid color-mix(in srgb, var(--ys-accent) 82%, var(--ys-border));
  border-radius: 2px;
  box-shadow: 0 1px 4px rgb(20 28 38 / 14%);
}

.ys-today__resize-handle.is-top-left { top: 0; left: 0; }
.ys-today__resize-handle.is-top-left::after { top: -5px; left: -5px; }
.ys-today__resize-handle.is-top-right { top: 0; right: 0; cursor: nesw-resize; }
.ys-today__resize-handle.is-top-right::after { top: -5px; right: -5px; }
.ys-today__resize-handle.is-bottom-left { bottom: 0; left: 0; cursor: nesw-resize; }
.ys-today__resize-handle.is-bottom-left::after { bottom: -5px; left: -5px; }
.ys-today__resize-handle.is-bottom-right { right: 0; bottom: 0; }
.ys-today__resize-handle.is-bottom-right::after { right: -5px; bottom: -5px; }
.ys-today__resize-handle:focus-visible { outline: 3px solid var(--ys-focus-ring); outline-offset: 2px; }

.ys-today__readiness,
.ys-today__plans,
.ys-today__course-tasks {
  display: grid;
  gap: 7px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.ys-today__widget-content.is-wide .ys-today__readiness,
.ys-today__widget-content.is-wide .ys-today__plans,
.ys-today__widget-content.is-wide .ys-today__course-tasks,
.ys-today__widget-content.is-wide .ys-today__timeline { grid-template-columns: repeat(2, minmax(0, 1fr)); }

.ys-today__widget-content.is-large .ys-today__readiness,
.ys-today__widget-content.is-large .ys-today__plans,
.ys-today__widget-content.is-large .ys-today__course-tasks { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px; }

.ys-today__readiness li {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.ys-today__compact-summary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1px 7px;
  align-items: end;
  padding-top: 2px;
}

.ys-today__compact-summary > b { font-size: 22px; line-height: 1; font-variant-numeric: tabular-nums; }
.ys-today__compact-summary > span { padding-bottom: 1px; font-size: 10px; color: var(--ys-text-3); }
.ys-today__compact-summary > small {
  grid-column: 1 / -1;
  margin-top: 5px;
  overflow: hidden;
  font-size: 10px;
  color: var(--ys-text-2);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ys-today__compact-summary.is-progress > i {
  grid-column: 1 / -1;
  height: 4px;
  margin-top: 8px;
  overflow: hidden;
  background: color-mix(in srgb, var(--ys-accent) 10%, var(--ys-border));
  border-radius: 2px;
}

.ys-today__compact-summary.is-progress > i > span { display: block; height: 100%; background: var(--ys-accent); border-radius: inherit; }

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
  position: absolute;
  top: 9px;
  right: 9px;
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
  padding: 1px 7px;
  background: rgb(0 0 0 / 26%);
  border-radius: 4px;
}

.ys-today__next { position: relative; min-height: 68px; }
.ys-today__widget-content.is-wide .ys-today__next { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-content: center; padding-right: 84px; }
.ys-today__widget-content.is-wide .ys-today__next strong,
.ys-today__widget-content.is-wide .ys-today__next-meta { grid-column: 1; }
.ys-today__widget-content.is-tall .ys-today__next,
.ys-today__widget-content.is-large .ys-today__next { min-height: 76px; }

.ys-today__course-preview {
  display: grid;
  gap: 0;
  padding: 8px 0 0;
  margin: 0;
  list-style: none;
}

.ys-today__course-preview li {
  display: grid;
  grid-template-columns: 34px 5px minmax(0, 1fr);
  gap: 7px;
  align-items: center;
  min-height: 30px;
  font-size: 11px;
}

.ys-today__course-preview time { font-size: 10px; color: var(--ys-text-3); font-variant-numeric: tabular-nums; }
.ys-today__course-preview i { width: 4px; height: 18px; border-radius: 2px; }
.ys-today__course-preview span { overflow: hidden; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
.ys-today__course-preview small { display: none; color: var(--ys-text-3); }
.ys-today__widget-content.is-large .ys-today__course-preview { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px 18px; }

.ys-today__timeline {
  display: grid;
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

.ys-today__week-chart {
  display: flex;
  gap: 6px;
  align-items: flex-end;
  height: 78px;
  margin-top: 14px;
}

.ys-today__week-bar {
  display: grid;
  flex: 1 1 0;
  grid-template-rows: 14px minmax(0, 1fr) 13px;
  gap: 3px;
  min-width: 0;
  height: 100%;
  text-align: center;
}

.ys-today__week-bar > b { font-size: 9px; font-weight: 650; color: var(--ys-text-2); }

.ys-today__week-bar > i {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 0;
  overflow: hidden;
  font-style: normal;
  background: color-mix(in srgb, var(--ys-accent) 8%, transparent);
  border-radius: 3px 3px 2px 2px;
}

.ys-today__week-bar > i > span {
  display: block;
  width: 100%;
  min-height: 3px;
  background: color-mix(in srgb, var(--ys-accent) 78%, var(--ys-success));
  border-radius: 3px 3px 2px 2px;
  transition: height 180ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.ys-today__week-bar > small { font-size: 9px; color: var(--ys-text-3); }

.ys-today__week-summary {
  margin: 12px 0 0;
  font-size: 10px;
  color: var(--ys-text-2);
}

.ys-today__widget.is-size-standard .ys-today__week-chart,
.ys-today__widget.is-size-2x1 .ys-today__week-chart {
  height: 34px;
  margin-top: 7px;
}

.ys-today__widget.is-size-standard .ys-today__week-bar,
.ys-today__widget.is-size-2x1 .ys-today__week-bar { grid-template-rows: minmax(0, 1fr) 11px; gap: 2px; }
.ys-today__widget.is-size-standard .ys-today__week-bar > b,
.ys-today__widget.is-size-2x1 .ys-today__week-bar > b { display: none; }

.ys-today__widget.is-size-1x2 .ys-today__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 4px;
}

.ys-today__widget.is-size-1x2 .ys-today__stats div:last-child { grid-column: span 2; }
.ys-today__widget.is-size-1x2 .ys-today__week-chart { height: 88px; margin-top: 16px; gap: 3px; }

.ys-today__weather { height: 100%; }

.ys-today__weather-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ys-today__weather-head .ys-today__widget-title { margin-bottom: 0; }
.ys-today__weather-range { font-size: 10px; color: var(--ys-text-3); font-variant-numeric: tabular-nums; }

.ys-today__weather-current { display: flex; gap: 9px; align-items: center; min-width: 0; }
.ys-today__weather-current > div { display: flex; flex-wrap: wrap; gap: 2px 6px; align-items: baseline; min-width: 0; }
.ys-today__weather-current b { font-size: 24px; line-height: 1; font-variant-numeric: tabular-nums; }
.ys-today__weather-current span { font-size: 11px; color: var(--ys-text-2); }

.ys-today__widget-content.is-compact .ys-today__weather-current { margin-top: 14px; }
.ys-today__widget-content.is-wide .ys-today__weather { display: grid; grid-template-columns: 140px minmax(0, 1fr); grid-template-rows: 18px 1fr; column-gap: 18px; }
.ys-today__widget-content.is-wide .ys-today__weather-head { grid-column: 1 / -1; }
.ys-today__widget-content.is-wide .ys-today__weather-current { grid-column: 1; }
.ys-today__widget-content.is-tall .ys-today__weather-current { margin-top: 13px; }
.ys-today__widget-content.is-large .ys-today__weather { display: grid; grid-template-columns: 132px minmax(0, 1fr); grid-template-rows: 22px minmax(0, 1fr); column-gap: 20px; }
.ys-today__widget-content.is-large .ys-today__weather-head { grid-column: 1 / -1; }
.ys-today__widget-content.is-large .ys-today__weather-current { align-self: center; }
.ys-today__widget-content.is-large .ys-today__weather-current > div { display: grid; gap: 4px; }
.ys-today__widget-content.is-large .ys-today__weather-current b { font-size: 34px; }

.ys-today__weather-strip {
  display: grid;
  grid-column: 2;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  height: 66px;
  align-self: end;
}

.ys-today__weather-strip > div,
.ys-today__weather-forecast > div { display: grid; grid-template-rows: 13px minmax(0, 1fr) 14px; gap: 2px; min-width: 0; text-align: center; }
.ys-today__weather-strip time,
.ys-today__weather-forecast time { font-size: 9px; color: var(--ys-text-3); font-variant-numeric: tabular-nums; }
.ys-today__weather-strip i,
.ys-today__weather-forecast i { display: flex; align-items: flex-end; justify-content: center; overflow: hidden; background: color-mix(in srgb, var(--ys-today-weather) 8%, transparent); border-radius: 3px; }
.ys-today__weather-strip i > span,
.ys-today__weather-forecast i > span { width: 100%; min-height: 3px; background: color-mix(in srgb, var(--ys-today-weather) 74%, var(--ys-accent)); border-radius: 3px 3px 1px 1px; }
.ys-today__weather-strip b,
.ys-today__weather-forecast b { font-size: 9px; color: var(--ys-text-2); }

.ys-today__weather-hours { display: grid; gap: 1px; padding: 12px 0 0; margin: 0; list-style: none; }
.ys-today__weather-hours li { display: grid; grid-template-columns: 36px 22px minmax(0, 1fr) auto; gap: 6px; align-items: center; min-height: 30px; font-size: 10px; }
.ys-today__weather-hours time { color: var(--ys-text-3); font-variant-numeric: tabular-nums; }
.ys-today__weather-hours span { color: var(--ys-text-2); }
.ys-today__weather-hours b { font-size: 11px; font-variant-numeric: tabular-nums; }

.ys-today__weather-panel { min-width: 0; }
.ys-today__weather-panel-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 7px; }
.ys-today__weather-panel-head span { font-size: 11px; font-weight: 700; color: var(--ys-text-2); }
.ys-today__weather-panel-head small { font-size: 9px; color: var(--ys-text-3); }
.ys-today__weather-forecast { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 6px; height: 146px; }
.ys-today__weather-forecast > div { grid-template-rows: 13px minmax(0, 1fr) 20px 14px; }
.ys-today__weather-forecast .ys-weather-glyph { justify-self: center; }

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
  .ys-today-content-enter-active,
  .ys-today-content-leave-active,
  .ys-today__week-bar > i > span { transition-duration: 1ms; }
}

.ys-today.is-reduce-motion .ys-today__widget { animation: none; transition-duration: 1ms; }
.ys-today.is-reduce-motion .ys-today-content-enter-active,
.ys-today.is-reduce-motion .ys-today-content-leave-active,
.ys-today.is-reduce-motion .ys-today__week-bar > i > span { transition-duration: 1ms; }
</style>
