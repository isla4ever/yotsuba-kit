<script setup lang="ts">
import type {
  BuiltinTransitionName,
  Course,
  CourseTime,
  DayOverride,
  DisplayCourse,
  GuideConfig,
  GuideStep,
  ThemeTokens,
  TransitionSpec,
  WeatherSnapshot,
  WeekModel,
} from '@iyotsuba/schedule-core'
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
} from '@iyotsuba/schedule-core'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import YsCourseCard from './YsCourseCard.vue'
import YsCourseDetail from './YsCourseDetail.vue'
import YsGuide from './YsGuide.vue'
import YsTopBar from './YsTopBar.vue'
import YsWeekPicker from './YsWeekPicker.vue'

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
  /** 顶部周信息栏（compact 单行极简 / standard 微信版复刻 / expanded 双行信息面板） */
  topBar?: 'compact' | 'standard' | 'expanded' | 'none'
  topBarTitle?: string
  /** 星期/日期表头行 */
  weekdayBar?: boolean
  transition?: BuiltinTransitionName | TransitionSpec
  theme?: 'light' | 'dark' | Partial<ThemeTokens>
  weather?: WeatherSnapshot | null
  reduceMotion?: boolean | 'auto'
  swipeable?: boolean
  /** 内置周选择器；'none' 时点击周数仅发出 week-picker-open 事件由宿主接管 */
  weekPicker?: 'builtin' | 'none'
  /** 内置课程详情；'none' 时点课仅发出 course-tap 事件由宿主接管 */
  courseDetail?: 'builtin' | 'none'
  /** 引导配置（tips / spotlight / walkthrough 三模式），配合 startGuide() 触发 */
  guide?: GuideConfig | false
  locale?: {
    weekdays?: string[]
    inactiveBadge?: string
    makeupBadge?: string
    breakLabel?: string
    weekPickerTitle?: string
  }
}>(), {
  week: 1,
  totalWeeks: 20,
  overrides: () => [],
  courseTimes: 'standard',
  visibleDays: 7,
  rowHeight: 56,
  breakAfterSection: 4,
  topBar: 'standard',
  topBarTitle: '本学期课表',
  weekdayBar: true,
  transition: 'wave',
  theme: 'light',
  weather: null,
  reduceMotion: 'auto',
  swipeable: true,
  weekPicker: 'builtin',
  courseDetail: 'builtin',
  guide: false,
})

const emit = defineEmits<{
  'update:week': [week: number]
  'weekChange': [week: number, previous: number]
  'courseTap': [course: DisplayCourse, stack: DisplayCourse[]]
  'dayTap': [weekday: number, date: Date | null]
  'swipe': [direction: 1 | -1]
  'weekPickerOpen': []
  'transitionStart': [spec: TransitionSpec]
  'transitionEnd': [spec: TransitionSpec]
  'guideStep': [step: GuideStep, index: number]
  'guideFinish': []
}>()

/* ------------------------------ 主题与派生 ------------------------------ */

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

function isToday(weekday: number): boolean {
  const date = dayDate(weekday)
  return Boolean(date && formatDateKey(date) === formatDateKey(new Date()))
}

const weatherText = computed(() => {
  const current = props.weather?.current
  if (!current) {
    return undefined
  }
  return current.temperatureC != null ? `${Math.round(current.temperatureC)}°` : current.label
})

function stackFor(model: WeekModel, course: DisplayCourse): DisplayCourse[] {
  return model.overlapGroups.find(group =>
    group.courses.some(item => item.displayId === course.displayId),
  )?.courses ?? [course]
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
  if (!waveActive.value) {
    return position
  }
  if (spec.value.mode === 'page') {
    const stagger = spec.value.cellStagger
    if (!stagger) {
      return position
    }
    // 真实换页 + 轻量波浪淡入（复刻 Flutter 旧版：周一列先亮，节次微差）
    return {
      ...position,
      '--ys-stagger-from': String(stagger.fromOpacity),
      'animation': `ys-cell-stagger ${stagger.durationMs}ms ${stagger.easing} both`,
      'animationDelay': `${(course.weekday - 1) * stagger.stepMs + Math.max(0, course.startSection - 1) * 4}ms`,
    }
  }
  if (spec.value.mode !== 'per-cell') {
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
  if (!waveActive.value) {
    return undefined
  }
  const keyframe = layer === 'enter' ? spec.value.enter : spec.value.leave
  const sign = waveDirection.value
  if (spec.value.mode === 'page') {
    // 真实整页滑动：translateX 单位为 %
    if (layer === 'enter') {
      return {
        '--ys-from-x': `${(keyframe.translateX ?? 100) * sign}%`,
        'animation': `ys-page-enter ${spec.value.enterMs}ms ${keyframe.easing} both`,
      }
    }
    return {
      '--ys-to-x': `${(keyframe.translateX ?? -100) * sign}%`,
      'animation': `ys-page-leave ${spec.value.leaveMs}ms ${keyframe.easing} both`,
    }
  }
  if (spec.value.mode !== 'layer') {
    return undefined
  }
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
    guideRef.value?.notify(direction === 1 ? 'swipe-left' : 'swipe-right')
    setWeek(props.week + direction)
  }
}

/* ------------------------------ 内置面板 ------------------------------ */

const weekPickerOpen = ref(false)
const detailOpen = ref(false)
const detailStack = ref<DisplayCourse[]>([])

function requestWeekPicker() {
  emit('weekPickerOpen')
  if (props.weekPicker === 'builtin') {
    weekPickerOpen.value = true
  }
}

function pickWeek(week: number) {
  weekPickerOpen.value = false
  setWeek(week)
}

function handleCourseTap(course: DisplayCourse) {
  const stack = stackFor(currentModel.value, course)
  emit('courseTap', course, stack)
  if (props.courseDetail === 'builtin') {
    detailStack.value = stack
    detailOpen.value = true
  }
}

/* ------------------------------ 对外方法 ------------------------------ */

function setWeek(week: number) {
  const clamped = Math.min(props.totalWeeks, Math.max(1, week))
  if (clamped !== props.week) {
    emit('update:week', clamped)
  }
}

function openCourse(courseId: string) {
  const course = currentModel.value.courses.find(
    item => item.id === courseId || item.displayId === courseId,
  )
  if (course) {
    detailStack.value = stackFor(currentModel.value, course)
    detailOpen.value = true
  }
}

function closeSheets() {
  weekPickerOpen.value = false
  detailOpen.value = false
}

const rootEl = ref<HTMLElement | null>(null)
const guideRef = ref<InstanceType<typeof YsGuide> | null>(null)

function startGuide() {
  guideRef.value?.start()
}

defineExpose({
  setWeek,
  getWeek: () => props.week,
  next: () => setWeek(props.week + 1),
  previous: () => setWeek(props.week - 1),
  openCourse,
  openWeekPicker: requestWeekPicker,
  closeSheets,
  startGuide,
})

onBeforeUnmount(() => {
  if (waveTimer) {
    clearTimeout(waveTimer)
  }
})
</script>

<template>
  <div ref="rootEl" class="ys-schedule" :class="{ 'ys-dark': theme === 'dark' }" :style="cssVars">
    <slot
      name="top-bar"
      :week="week"
      :total-weeks="totalWeeks"
      :open-week-picker="requestWeekPicker"
    >
      <YsTopBar
        v-if="topBar !== 'none'"
        :preset="topBar"
        :week="week"
        :total-weeks="totalWeeks"
        :term-start="termStart"
        :title="topBarTitle"
        :weather-text="weatherText"
        @pick-week="requestWeekPicker"
      >
        <template #tools>
          <slot name="top-bar-tools" />
        </template>
      </YsTopBar>
    </slot>

    <div v-if="weekdayBar" class="ys-schedule__weekday-bar" data-ys="weekday-bar">
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
        >
          <span class="ys-schedule__day-label">{{ weekdayLabels[weekday - 1] }}</span>
          <span v-if="termStart" class="ys-schedule__day-date">
            {{ (dayDate(weekday)?.getMonth() ?? 0) + 1 }}/{{ dayDate(weekday)?.getDate() }}
          </span>
          <i v-if="isToday(weekday)" class="ys-schedule__day-dot" aria-hidden="true" />
        </slot>
      </button>
    </div>

    <div
      ref="scroller"
      class="ys-schedule__body"
      data-ys="grid"
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
            v-for="course in leavingModel.courses"
            :key="course.displayId"
            class="ys-schedule__card-slot"
            :style="leaveStyle(course, leavingModel)"
          >
            <slot name="course" :course="course" :active="course.active" :color="colorFor(course.name, course.color)">
              <YsCourseCard
                :course="course"
                :color="colorFor(course.name, course.color)"
                :inactive-badge="locale?.inactiveBadge ?? '非本周'"
                :makeup-badge="locale?.makeupBadge ?? '补班'"
              />
            </slot>
          </div>
          <div
            v-for="group in leavingModel.overlapGroups"
            :key="group.id"
            class="ys-schedule__badge"
            :style="badgeStyle(group, 'leave')"
          >
            {{ group.courses.length }}
          </div>
        </div>

        <div
          :key="`enter-${currentModel.week}`"
          class="ys-schedule__layer ys-schedule__layer--current"
          :style="[{ gridTemplateRows: rowTemplate }, layerStyle('enter')]"
        >
          <div
            v-for="(course, courseIndex) in currentModel.courses"
            :key="course.displayId"
            class="ys-schedule__card-slot"
            :data-ys="courseIndex === currentModel.courses.length - 1 ? 'course-card' : undefined"
            :style="enterStyle(course, currentModel)"
          >
            <slot name="course" :course="course" :active="course.active" :color="colorFor(course.name, course.color)">
              <YsCourseCard
                :course="course"
                :color="colorFor(course.name, course.color)"
                :inactive-badge="locale?.inactiveBadge ?? '非本周'"
                :makeup-badge="locale?.makeupBadge ?? '补班'"
                @select="handleCourseTap"
              />
            </slot>
          </div>
          <div
            v-for="group in currentModel.overlapGroups"
            :key="group.id"
            class="ys-schedule__badge"
            :style="badgeStyle(group, 'enter')"
            :aria-label="`${group.courses.length}门重叠课程`"
          >
            {{ group.courses.length }}
          </div>
        </div>
      </div>
    </div>

    <YsWeekPicker
      :open="weekPickerOpen"
      :week="week"
      :total-weeks="totalWeeks"
      :title="locale?.weekPickerTitle ?? '选择教学周'"
      :vars="cssVars"
      @close="weekPickerOpen = false"
      @select="pickWeek"
    />

    <YsGuide
      v-if="guide"
      ref="guideRef"
      :config="guide"
      :root="rootEl"
      :vars="cssVars"
      @step="(step, index) => emit('guideStep', step, index)"
      @finish="emit('guideFinish')"
    />

    <YsCourseDetail
      :open="detailOpen"
      :stack="detailStack"
      :color-for="colorFor"
      :vars="cssVars"
      @close="detailOpen = false"
    >
      <template #detail-extra="slotProps">
        <slot name="detail-extra" v-bind="slotProps" />
      </template>
      <template #detail-actions="slotProps">
        <slot name="detail-actions" v-bind="slotProps" />
      </template>
    </YsCourseDetail>
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

.ys-schedule__weekday-bar {
  display: grid;
  grid-template-columns: 48px repeat(v-bind(visibleDays), minmax(0, 1fr));
  flex-shrink: 0;
  height: 54px;
  border-bottom: 1px solid var(--ys-border);
}

.ys-schedule__rail-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--ys-text-3);
}

.ys-schedule__day {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 0;
  font: inherit;
  color: var(--ys-text-2);
  cursor: pointer;
  background: transparent;
  border: 0;
}

.ys-schedule__day.is-today {
  color: var(--ys-accent);
  background: var(--ys-accent-soft);
}

.ys-schedule__day-label { font-size: 13px; font-weight: 750; }
.ys-schedule__day-date { font-size: 9px; color: var(--ys-text-3); }

.ys-schedule__day-dot {
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  background: var(--ys-accent);
  border-radius: 50%;
}

.ys-schedule__body {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  flex: 1;
  overflow-y: auto;
  touch-action: pan-y;
}

/* 顶部 6px 呼吸位：保证首行卡片的重叠角标（-3px 出血）不被裁剪 */
.ys-schedule__rail,
.ys-schedule__board,
.ys-schedule__layer {
  box-sizing: border-box;
  padding-top: 6px;
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
}

.ys-schedule__badge {
  z-index: 18;
  display: grid;
  place-items: center;
  place-self: start end;
  width: 16px;
  height: 16px;
  margin: -3px -3px 0 0;
  font-size: 9px;
  font-weight: 750;
  color: #fff;
  pointer-events: none;
  background: #1c232d;
  border: 1px solid rgb(255 255 255 / 82%);
  border-radius: 50%;
  box-shadow: 0 2px 7px rgb(0 0 0 / 28%);
}

.ys-schedule.ys-dark .ys-schedule__badge {
  color: #17191d;
  background: #f3f5f7;
  border-color: rgb(255 255 255 / 36%);
}

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

@keyframes ys-cell-stagger {
  from { opacity: var(--ys-stagger-from, 0.3); }
  to { opacity: 1; }
}

@keyframes ys-page-enter {
  from { transform: translate3d(var(--ys-from-x, 100%), 0, 0); }
  to { transform: translate3d(0, 0, 0); }
}

@keyframes ys-page-leave {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(var(--ys-to-x, -100%), 0, 0); }
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
