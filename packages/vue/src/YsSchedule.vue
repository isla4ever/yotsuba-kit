<script setup lang="ts">
import type {
  BuiltinTransitionName,
  Course,
  CourseTime,
  DayOverride,
  DisplayCourse,
  ThemeTokens,
  TransitionSpec,
  WeatherSnapshot,
  WeekModel,
} from '@yotsuba/schedule-core'
import {
  buildScheduleRows,
  buildWeekModel,
  createCourseColorResolver,
  darkTheme,
  dateFor,
  formatDateKey,
  lightTheme,
  resolveTransition,
  STANDARD_COURSE_TIMES,
  tokensToCssVars,
} from '@yotsuba/schedule-core'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  courses: Course[]
  week?: number
  totalWeeks?: number
  termStart?: Date
  overrides?: DayOverride[]
  courseTimes?: CourseTime[] | 'standard'
  visibleDays?: 5 | 6 | 7
  rowHeight?: number
  breakAfterSection?: number
  header?: 'compact' | 'standard' | 'expanded' | 'none'
  transition?: BuiltinTransitionName | TransitionSpec
  theme?: 'light' | 'dark' | Partial<ThemeTokens>
  weather?: WeatherSnapshot | null
  reduceMotion?: boolean | 'auto'
  swipeable?: boolean
  locale?: { weekdays?: string[], inactiveBadge?: string, breakLabel?: string }
}>(), {
  week: 1,
  totalWeeks: 20,
  overrides: () => [],
  courseTimes: 'standard',
  visibleDays: 7,
  rowHeight: 56,
  breakAfterSection: 4,
  header: 'standard',
  transition: 'wave',
  theme: 'light',
  weather: null,
  reduceMotion: 'auto',
  swipeable: true,
})

const emit = defineEmits<{
  'update:week': [week: number]
  'weekChange': [week: number, previous: number]
  'courseTap': [course: DisplayCourse, stack: DisplayCourse[]]
  'dayTap': [weekday: number, date: Date | null]
  'swipe': [direction: 1 | -1]
  'transitionStart': [spec: TransitionSpec]
  'transitionEnd': [spec: TransitionSpec]
}>()

/* ------------------------------ 基础派生 ------------------------------ */

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

const times = computed<CourseTime[]>(() =>
  props.courseTimes === 'standard' ? STANDARD_COURSE_TIMES : props.courseTimes,
)

const maxSection = computed(() => Math.max(
  times.value.length,
  ...props.courses.map(course => course.endSection),
))

const rows = computed(() => buildScheduleRows(times.value, {
  breakAfterSection: props.breakAfterSection,
  breakLabel: props.locale?.breakLabel ?? '午休',
  maxSection: maxSection.value,
}))

const rowTemplate = computed(() =>
  rows.value.map(row => (row.isBreak ? '34px' : `${props.rowHeight}px`)).join(' '),
)

const weekdayLabels = computed(() =>
  props.locale?.weekdays ?? ['一', '二', '三', '四', '五', '六', '日'],
)

const currentModel = computed<WeekModel>(() =>
  buildWeekModel(props.courses, props.week, {
    termStart: props.termStart,
    overrides: props.overrides,
  }),
)

function sectionToGridLine(section: number): number {
  return section <= props.breakAfterSection ? section : section + 1
}

function dayDate(weekday: number): Date | null {
  return props.termStart ? dateFor(props.termStart, props.week, weekday) : null
}

function dayWeather(weekday: number) {
  const date = dayDate(weekday)
  if (!date || !props.weather) {
    return null
  }
  const key = formatDateKey(date)
  return props.weather.daily.find(item => item.date === key) ?? null
}

function isToday(weekday: number): boolean {
  const date = dayDate(weekday)
  return Boolean(date && formatDateKey(date) === formatDateKey(new Date()))
}

/* ------------------------------ 换周与过渡 ------------------------------ */

const spec = computed(() => resolveTransition(props.transition))

const motionReduced = computed(() => {
  if (props.reduceMotion !== 'auto') {
    return props.reduceMotion
  }
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
})

const leavingModel = ref<WeekModel | null>(null)
const waveDirection = ref<1 | -1>(1)
const waveActive = ref(false)
let waveTimer: ReturnType<typeof setTimeout> | null = null
let stableSignatures = new Set<string>()

function cellSignature(course: DisplayCourse): string {
  return [course.displayId, course.weekday, course.startSection, course.endSection, course.active].join('|')
}

function topSignatures(model: WeekModel): Set<string> {
  // 每个重叠组只有最后渲染的成员是视觉顶卡；单卡即自身
  const order = new Map(model.courses.map((course, index) => [course.displayId, index]))
  const covered = new Set<string>()
  const signatures = new Set<string>()
  for (const group of model.overlapGroups) {
    let top = group.courses[0]!
    for (const member of group.courses) {
      if ((order.get(member.displayId) ?? -1) > (order.get(top.displayId) ?? -1)) {
        top = member
      }
    }
    for (const member of group.courses) {
      if (member.displayId !== top.displayId) {
        covered.add(member.displayId)
      }
    }
  }
  for (const course of model.courses) {
    if (!covered.has(course.displayId)) {
      signatures.add(cellSignature(course))
    }
  }
  for (const group of model.overlapGroups) {
    signatures.add(`badge|${group.weekday}|${group.startSection}|${group.endSection}|${group.courses.length}`)
  }
  return signatures
}

const coveredIds = computed(() => {
  const set = new Set<string>()
  collectCovered(currentModel.value, set)
  if (leavingModel.value) {
    collectCovered(leavingModel.value, set)
  }
  return set
})

function collectCovered(model: WeekModel, set: Set<string>) {
  const order = new Map(model.courses.map((course, index) => [course.displayId, index]))
  for (const group of model.overlapGroups) {
    let top = group.courses[0]!
    for (const member of group.courses) {
      if ((order.get(member.displayId) ?? -1) > (order.get(top.displayId) ?? -1)) {
        top = member
      }
    }
    for (const member of group.courses) {
      if (member.displayId !== top.displayId) {
        set.add(`${model.week}:${member.displayId}`)
      }
    }
  }
}

watch(() => props.week, (week, previous) => {
  if (week === previous || previous === undefined) {
    return
  }
  emit('weekChange', week, previous)
  if (motionReduced.value || spec.value.totalMs === 0) {
    leavingModel.value = null
    waveActive.value = false
    return
  }
  waveDirection.value = week > previous ? 1 : -1
  const previousModel = buildWeekModel(props.courses, previous, {
    termStart: props.termStart,
    overrides: props.overrides,
  })
  const previousSignatures = topSignatures(previousModel)
  stableSignatures = spec.value.stableSkip
    ? new Set([...topSignatures(currentModel.value)].filter(sig => previousSignatures.has(sig)))
    : new Set()
  leavingModel.value = previousModel
  waveActive.value = true
  emit('transitionStart', spec.value)
  if (waveTimer) {
    clearTimeout(waveTimer)
  }
  waveTimer = setTimeout(() => {
    leavingModel.value = null
    waveActive.value = false
    waveTimer = null
    emit('transitionEnd', spec.value)
  }, spec.value.totalMs)
})

function delayMs(course: Pick<DisplayCourse, 'weekday' | 'startSection'>): number {
  return spec.value.delayFor(
    { weekday: course.weekday, startSection: course.startSection },
    { direction: waveDirection.value, columns: props.visibleDays },
  )
}

function enterStyle(course: DisplayCourse, model: WeekModel) {
  const position = gridPosition(course)
  if (!waveActive.value || spec.value.mode !== 'per-cell') {
    return position
  }
  if (coveredIds.value.has(`${model.week}:${course.displayId}`)) {
    return {
      ...position,
      animation: `ys-fade-in 60ms linear both`,
      animationDelay: `${delayMs(course) + spec.value.enterMs + 20}ms`,
    }
  }
  if (stableSignatures.has(cellSignature(course))) {
    return position
  }
  return {
    ...position,
    '--ys-from-opacity': String(spec.value.enter.opacity),
    '--ys-from-y': `${spec.value.enter.translateY ?? 0}px`,
    'animation': `ys-enter ${spec.value.enterMs}ms ${spec.value.enter.easing} both`,
    'animationDelay': `${delayMs(course)}ms`,
  }
}

function leaveStyle(course: DisplayCourse, model: WeekModel) {
  const position = gridPosition(course)
  if (spec.value.mode !== 'per-cell') {
    return position
  }
  if (coveredIds.value.has(`${model.week}:${course.displayId}`)) {
    return { ...position, animation: `ys-fade-out 1ms linear both`, animationDelay: `${delayMs(course)}ms` }
  }
  if (stableSignatures.has(cellSignature(course))) {
    return position
  }
  return {
    ...position,
    animation: `ys-fade-out ${spec.value.leaveMs}ms ${spec.value.leave.easing} both`,
    animationDelay: `${delayMs(course) + spec.value.leaveLagMs}ms`,
  }
}

function badgeStyle(group: WeekModel['overlapGroups'][number], layer: 'enter' | 'leave') {
  const position = {
    gridColumn: `${group.weekday} / ${group.weekday + 1}`,
    gridRow: `${sectionToGridLine(group.startSection)} / ${sectionToGridLine(group.endSection) + 1}`,
  }
  if (!waveActive.value || spec.value.mode !== 'per-cell') {
    return position
  }
  const signature = `badge|${group.weekday}|${group.startSection}|${group.endSection}|${group.courses.length}`
  if (stableSignatures.has(signature)) {
    return position
  }
  const delay = delayMs({ weekday: group.weekday, startSection: group.startSection })
  if (layer === 'enter') {
    return {
      ...position,
      '--ys-from-opacity': String(spec.value.enter.opacity),
      '--ys-from-y': `${spec.value.enter.translateY ?? 0}px`,
      'animation': `ys-enter ${spec.value.enterMs}ms ${spec.value.enter.easing} both`,
      'animationDelay': `${delay}ms`,
    }
  }
  return {
    ...position,
    animation: `ys-fade-out ${spec.value.leaveMs}ms ${spec.value.leave.easing} both`,
    animationDelay: `${delay + spec.value.leaveLagMs}ms`,
  }
}

function layerStyle(layer: 'enter' | 'leave') {
  if (!waveActive.value || spec.value.mode !== 'layer') {
    return undefined
  }
  const keyframe = layer === 'enter' ? spec.value.enter : spec.value.leave
  const sign = waveDirection.value
  const translateX = (keyframe.translateX ?? 0) * sign
  if (layer === 'enter') {
    return {
      '--ys-from-opacity': String(keyframe.opacity),
      '--ys-from-x': `${translateX}px`,
      'animation': `ys-layer-enter ${spec.value.enterMs}ms ${keyframe.easing} both`,
    }
  }
  return {
    '--ys-to-x': `${translateX}px`,
    'animation': `ys-layer-leave ${spec.value.leaveMs}ms ${keyframe.easing} both`,
  }
}

function gridPosition(course: Pick<DisplayCourse, 'weekday' | 'startSection' | 'endSection'>) {
  return {
    gridColumn: `${course.weekday} / ${course.weekday + 1}`,
    gridRow: `${sectionToGridLine(course.startSection)} / ${sectionToGridLine(course.endSection) + 1}`,
  }
}

/* ------------------------------ 手势 ------------------------------ */

const scroller = ref<HTMLElement | null>(null)
let swipeOrigin: { x: number, y: number, time: number } | null = null
let swipeAxis: 'horizontal' | 'vertical' | null = null

function onPointerDown(event: PointerEvent) {
  if (!props.swipeable || event.pointerType === 'mouse') {
    return
  }
  swipeOrigin = { x: event.clientX, y: event.clientY, time: performance.now() }
  swipeAxis = null
}

function onPointerMove(event: PointerEvent) {
  if (!swipeOrigin) {
    return
  }
  const deltaX = event.clientX - swipeOrigin.x
  const deltaY = event.clientY - swipeOrigin.y
  if (!swipeAxis && Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= 7) {
    swipeAxis = Math.abs(deltaX) > Math.abs(deltaY) * 1.12 ? 'horizontal' : 'vertical'
  }
  if (swipeAxis === 'horizontal') {
    event.preventDefault()
  }
}

function onPointerEnd(event: PointerEvent) {
  if (!swipeOrigin || swipeAxis !== 'horizontal') {
    swipeOrigin = null
    swipeAxis = null
    return
  }
  const deltaX = event.clientX - swipeOrigin.x
  const elapsed = Math.max(1, performance.now() - swipeOrigin.time)
  const velocity = Math.abs(deltaX) / elapsed
  const width = scroller.value?.clientWidth || 390
  swipeOrigin = null
  swipeAxis = null
  if (event.type === 'pointercancel') {
    return
  }
  if (Math.abs(deltaX) >= width * 0.2 || velocity >= 0.52) {
    const direction: 1 | -1 = deltaX < 0 ? 1 : -1
    emit('swipe', direction)
    setWeek(props.week + direction)
  }
}

/* ------------------------------ 对外方法 ------------------------------ */

function setWeek(week: number) {
  const clamped = Math.min(props.totalWeeks, Math.max(1, week))
  if (clamped !== props.week) {
    emit('update:week', clamped)
  }
}

defineExpose({
  setWeek,
  getWeek: () => props.week,
  next: () => setWeek(props.week + 1),
  previous: () => setWeek(props.week - 1),
})

onBeforeUnmount(() => {
  if (waveTimer) {
    clearTimeout(waveTimer)
  }
})
</script>

<template>
  <div class="ys-schedule" :class="[`ys-header--${header}`]" :style="cssVars">
    <div v-if="header !== 'none'" class="ys-schedule__header">
      <div class="ys-schedule__rail-head" aria-hidden="true">
        <span>星期</span>
        <small v-if="termStart">日期</small>
      </div>
      <button
        v-for="weekday in visibleDays"
        :key="weekday"
        type="button"
        class="ys-schedule__day"
        :class="{ 'is-today': isToday(weekday) }"
        @click="emit('dayTap', weekday, dayDate(weekday))"
      >
        <slot
          name="day"
          :weekday="weekday"
          :label="weekdayLabels[weekday - 1]"
          :date="dayDate(weekday)"
          :weather="dayWeather(weekday)"
        >
          <span class="ys-schedule__day-label">{{ weekdayLabels[weekday - 1] }}</span>
          <span v-if="header !== 'compact' && termStart" class="ys-schedule__day-date">
            {{ (dayDate(weekday)?.getMonth() ?? 0) + 1 }}/{{ dayDate(weekday)?.getDate() }}
          </span>
          <span v-if="header === 'expanded' && dayWeather(weekday)" class="ys-schedule__day-weather">
            <i class="ys-weather-dot" :data-kind="dayWeather(weekday)?.kind" />
            <template v-if="dayWeather(weekday)?.highC != null">
              {{ Math.round(dayWeather(weekday)!.lowC ?? 0) }}~{{ Math.round(dayWeather(weekday)!.highC ?? 0) }}°
            </template>
          </span>
        </slot>
      </button>
    </div>

    <div
      ref="scroller"
      class="ys-schedule__body"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerEnd"
      @pointercancel="onPointerEnd"
    >
      <div class="ys-schedule__rail" :style="{ gridTemplateRows: rowTemplate }">
        <div
          v-for="row in rows"
          :key="row.key"
          class="ys-schedule__rail-row"
          :class="{ 'is-break': row.isBreak }"
        >
          <template v-if="row.section">
            <strong>{{ row.section }}</strong>
            <span v-if="row.time">{{ row.time.start }}<br>{{ row.time.end }}</span>
          </template>
          <small v-else>{{ row.label }}</small>
        </div>
      </div>

      <div class="ys-schedule__board" :style="{ gridTemplateRows: rowTemplate }">
        <div
          v-if="leavingModel && waveActive"
          :key="`leave-${leavingModel.week}`"
          class="ys-schedule__layer ys-schedule__layer--leaving"
          :style="[{ gridTemplateRows: rowTemplate }, layerStyle('leave')]"
          aria-hidden="true"
        >
          <div
            v-for="group in leavingModel.overlapGroups"
            :key="group.id"
            class="ys-schedule__badge"
            :style="badgeStyle(group, 'leave')"
          >
            {{ group.courses.length }}
          </div>
          <div
            v-for="course in leavingModel.courses"
            :key="course.displayId"
            class="ys-schedule__card-slot"
            :style="leaveStyle(course, leavingModel)"
          >
            <slot name="course" :course="course" :active="course.active" :color="colorFor(course.name, course.color)">
              <div class="ys-course" :class="{ 'is-inactive': !course.active }" :style="{ '--ys-course-color': colorFor(course.name, course.color) }">
                <span v-if="!course.active" class="ys-course__badge">{{ locale?.inactiveBadge ?? '非本周' }}</span>
                <strong class="ys-course__name">{{ course.name }}</strong>
                <span v-if="course.location" class="ys-course__location">@{{ course.location }}</span>
                <span class="ys-course__weeks">({{ course.startWeek }}-{{ course.endWeek }}周)</span>
              </div>
            </slot>
          </div>
        </div>

        <div
          :key="`enter-${currentModel.week}`"
          class="ys-schedule__layer ys-schedule__layer--current"
          :style="[{ gridTemplateRows: rowTemplate }, layerStyle('enter')]"
        >
          <div
            v-for="group in currentModel.overlapGroups"
            :key="group.id"
            class="ys-schedule__badge"
            :style="badgeStyle(group, 'enter')"
            :aria-label="`${group.courses.length}门重叠课程`"
          >
            {{ group.courses.length }}
          </div>
          <div
            v-for="course in currentModel.courses"
            :key="course.displayId"
            class="ys-schedule__card-slot"
            :style="enterStyle(course, currentModel)"
            @click="emit('courseTap', course, currentModel.overlapGroups.find(g => g.courses.some(c => c.displayId === course.displayId))?.courses ?? [course])"
          >
            <slot name="course" :course="course" :active="course.active" :color="colorFor(course.name, course.color)">
              <div class="ys-course" :class="{ 'is-inactive': !course.active }" :style="{ '--ys-course-color': colorFor(course.name, course.color) }">
                <span v-if="!course.active" class="ys-course__badge">{{ locale?.inactiveBadge ?? '非本周' }}</span>
                <strong class="ys-course__name">{{ course.name }}</strong>
                <span v-if="course.location" class="ys-course__location">@{{ course.location }}</span>
                <span class="ys-course__weeks">({{ course.startWeek }}-{{ course.endWeek }}周)</span>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.ys-schedule {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: inherit;
  color: var(--ys-text-1);
  background: var(--ys-canvas);
}

.ys-schedule__header {
  display: grid;
  grid-template-columns: 48px repeat(v-bind(visibleDays), minmax(0, 1fr));
  flex-shrink: 0;
  border-bottom: 1px solid var(--ys-border);
}

.ys-header--compact .ys-schedule__header { height: 44px; }
.ys-header--standard .ys-schedule__header { height: 66px; }
.ys-header--expanded .ys-schedule__header { height: 92px; }

.ys-schedule__rail-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--ys-text-3);
}

.ys-schedule__day {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 0;
  font: inherit;
  color: var(--ys-text-2);
  background: transparent;
  border: 0;
}

.ys-schedule__day.is-today {
  color: var(--ys-accent);
  background: var(--ys-accent-soft);
}

.ys-schedule__day-label { font-size: 13px; font-weight: 700; }
.ys-schedule__day-date { font-size: 9px; color: var(--ys-text-3); }
.ys-schedule__day-weather { display: inline-flex; gap: 3px; align-items: center; font-size: 9px; color: var(--ys-text-3); }

.ys-weather-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ys-text-3);
}

.ys-weather-dot[data-kind="clear"] { background: #f2b13c; }
.ys-weather-dot[data-kind="cloudy"], .ys-weather-dot[data-kind="overcast"] { background: #9aa7b8; }
.ys-weather-dot[data-kind="rain"], .ys-weather-dot[data-kind="drizzle"] { background: #4a90d9; }
.ys-weather-dot[data-kind="storm"] { background: #6f5bd0; }
.ys-weather-dot[data-kind="snow"] { background: #8fc7e8; }

.ys-schedule__body {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  flex: 1;
  overflow-y: auto;
  touch-action: pan-y;
}

.ys-schedule__rail { display: grid; }

.ys-schedule__rail-row {
  display: flex;
  flex-direction: column;
  gap: 1px;
  align-items: center;
  justify-content: center;
  font-variant-numeric: tabular-nums;
  color: var(--ys-text-3);
}

.ys-schedule__rail-row strong { font-size: 15px; color: var(--ys-text-2); }
.ys-schedule__rail-row span { font-size: 8px; line-height: 1.25; text-align: center; }
.ys-schedule__rail-row small { font-size: 9px; }

.ys-schedule__board {
  position: relative;
  display: grid;
  grid-template-columns: repeat(v-bind(visibleDays), minmax(0, 1fr));
}

.ys-schedule__layer {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(v-bind(visibleDays), minmax(0, 1fr));
  pointer-events: none;
  contain: layout;
}

.ys-schedule__layer--leaving { z-index: 1; }
.ys-schedule__layer--current { z-index: 2; }
.ys-schedule__layer--current > .ys-schedule__card-slot { pointer-events: auto; }

.ys-schedule__card-slot {
  /* grid item 上的 z-index 建立堆叠上下文，保证整卡（背景+文字）按 DOM 序原子绘制，
     否则前一张被盖卡的文字会按 CSS 绘制序浮到后一张卡的背景之上 */
  z-index: 0;
  min-width: 0;
  min-height: 0;
  cursor: pointer;
}

.ys-schedule__badge {
  z-index: 3;
  display: grid;
  place-items: center;
  place-self: start end;
  width: 16px;
  height: 16px;
  margin: -3px -3px 0 0;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  pointer-events: none;
  background: #1c232d;
  border: 1px solid rgb(255 255 255 / 82%);
  border-radius: 50%;
}

.ys-course {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  justify-content: center;
  height: calc(100% - 6px);
  padding: 4px 3px;
  margin: 3px 2px;
  overflow: hidden;
  color: #fff;
  text-align: center;
  background: var(--ys-course-color);
  border-radius: 8px;
}

.ys-course.is-inactive {
  color: var(--ys-text-2);
  background: var(--ys-surface-2);
  border: 1px solid var(--ys-border);
}

.ys-course__badge {
  padding: 0 4px;
  font-size: 7px;
  font-weight: 700;
  background: var(--ys-surface-1);
  border-radius: 3px;
}

.ys-course__name {
  display: -webkit-box;
  overflow: hidden;
  font-size: 11px;
  line-height: 1.2;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.ys-course__location {
  overflow: hidden;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.86;
}

.ys-course__weeks { font-size: 8px; opacity: 0.85; }

@keyframes ys-enter {
  from {
    opacity: var(--ys-from-opacity, 0);
    transform: translate3d(0, var(--ys-from-y, 0), 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes ys-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes ys-fade-out {
  to { opacity: 0; }
}

@keyframes ys-layer-enter {
  from {
    opacity: var(--ys-from-opacity, 0);
    transform: translate3d(var(--ys-from-x, 0), 0, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes ys-layer-leave {
  to {
    opacity: 0;
    transform: translate3d(var(--ys-to-x, 0), 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .ys-schedule__layer,
  .ys-schedule__card-slot,
  .ys-schedule__badge {
    animation-duration: 1ms !important;
    animation-delay: 0ms !important;
  }
}
</style>
