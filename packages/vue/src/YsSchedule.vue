<script setup lang="ts">
import type {
  BuiltinTransitionName,
  CardEffect,
  Course,
  CourseTime,
  DayOverride,
  DayPlanMap,
  DetailField,
  DetailHero,
  DisplayCourse,
  GuideConfig,
  GuideStep,
  KeyframeSpec,
  PaletteName,
  ScheduleDensity,
  SheetPlacement,
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
  pendingPlanCount,
  resolvePalette,
  resolveTransition,
  STANDARD_COURSE_TIMES,
  tokensToCssVars,
} from '@iyotsuba/schedule-core'
import { computed, onBeforeUnmount, provide, ref, watch } from 'vue'
import YsBackgroundSheet from './YsBackgroundSheet.vue'
import YsCourseCard from './YsCourseCard.vue'
import YsCourseDetail from './YsCourseDetail.vue'
import YsCourseForm from './YsCourseForm.vue'
import YsDayPlanner from './YsDayPlanner.vue'
import YsGuide from './YsGuide.vue'
import YsTopBar from './YsTopBar.vue'
import YsWeatherScene from './YsWeatherScene.vue'
import YsWeekPicker from './YsWeekPicker.vue'

const props = withDefaults(defineProps<{
  /** 自定义元素场景下属性可能晚于首帧到达，故容忍缺省 */
  courses?: Course[]
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
  /** 编辑模式：空白格拖选新增、详情内编辑/删除（数据受控，通过 course-* 事件回传） */
  editable?: boolean
  /** 内置课程表单；'none' 时拖选仅发出 cell-select / course-form-request */
  courseForm?: 'builtin' | 'none'
  /** 日计划数据（受控）：dateKey → 计划列表，表头显示未完成角标 */
  dayPlans?: DayPlanMap
  /** 内置日计划面板；'none' 时点日期仅发出 day-tap */
  dayPlanner?: 'builtin' | 'none'
  /** 自定义背景（可配合内置上传裁剪面板 openBackgroundPicker()） */
  background?: { image?: string, opacity?: number, blur?: number } | null
  backgroundPicker?: 'builtin' | 'none'
  /** 界面密度：minimal 精简近日历块 / normal / rich 信息全面 */
  density?: ScheduleDensity
  /** 课程卡配色库：六套精选库名或自定义 string[]（白字对比度自行保证） */
  palette?: PaletteName | string[]
  /** 课程卡装饰特效（只作用于本周卡，换周动画期间自动暂停，reduced-motion 关闭） */
  cardEffect?: CardEffect
  /** 小米天气式实时背景场景（依赖 weather.current.kind） */
  weatherScene?: boolean
  /** 内置弹窗体系：位置（底部抽屉/居中对话框/侧滑抽屉）与毛玻璃 */
  sheets?: { placement?: SheetPlacement, glass?: boolean }
  /** 课程详情编排：hero 风格 + 字段显隐与顺序 */
  detail?: { hero?: DetailHero, fields?: DetailField[] }
  locale?: {
    weekdays?: string[]
    inactiveBadge?: string
    makeupBadge?: string
    breakLabel?: string
    weekPickerTitle?: string
  }
}>(), {
  courses: () => [],
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
  editable: false,
  courseForm: 'builtin',
  dayPlans: () => ({}),
  dayPlanner: 'builtin',
  background: null,
  backgroundPicker: 'builtin',
  density: 'normal',
  palette: undefined,
  cardEffect: 'none',
  weatherScene: false,
  sheets: undefined,
  detail: undefined,
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
  'courseAdd': [course: Course]
  'courseUpdate': [course: Course, previousId: string]
  'courseRemove': [course: DisplayCourse]
  'cellSelect': [weekday: number, startSection: number, endSection: number]
  'courseFormRequest': [prefill: Partial<Course>]
  'planAdd': [dateKey: string, text: string]
  'planToggle': [dateKey: string, id: string]
  'planRemove': [dateKey: string, id: string]
  'backgroundChange': [dataUrl: string | null]
}>()

/* ------------------------------ 主题与派生 ------------------------------ */

const tokens = computed<ThemeTokens>(() => {
  const base = props.theme === 'light'
    ? lightTheme
    : props.theme === 'dark'
      ? darkTheme
      : { ...lightTheme, ...props.theme }
  return props.palette ? { ...base, coursePalette: resolvePalette(props.palette) } : base
})

provide('ysSheetConfig', computed(() => props.sheets ?? {}))

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

/** 通用变换合成：按 directional 声明随翻页方向镜像;page/cube 模式 translateX 单位 % */
function composeTransform(frame: KeyframeSpec, direction: 1 | -1, percentX: boolean): string {
  const directional = new Set(frame.directional ?? ['translateX'])
  const parts: string[] = []
  if (frame.translateX != null) {
    const value = directional.has('translateX') ? frame.translateX * direction : frame.translateX
    parts.push(`translateX(${value}${percentX ? '%' : 'px'})`)
  }
  if (frame.translateY != null) {
    const value = directional.has('translateY') ? frame.translateY * direction : frame.translateY
    parts.push(`translateY(${value}px)`)
  }
  if (frame.rotateY != null) {
    const value = directional.has('rotateY') ? frame.rotateY * direction : frame.rotateY
    parts.push(`rotateY(${value}deg)`)
  }
  if (frame.rotateZ != null) {
    const value = directional.has('rotateZ') ? frame.rotateZ * direction : frame.rotateZ
    parts.push(`rotateZ(${value}deg)`)
  }
  if (frame.scale != null) {
    // directional-scale：绕 1 为轴镜像（0.92 ↔ 1.08）
    const value = directional.has('scale') ? 1 + (frame.scale - 1) * direction : frame.scale
    parts.push(`scale(${value})`)
  }
  return parts.length ? parts.join(' ') : 'none'
}

/** transform-origin 方向镜像（cube 铰链随翻页方向换边） */
function composeOrigin(frame: KeyframeSpec, direction: 1 | -1): string | undefined {
  if (!frame.transformOrigin) {
    return undefined
  }
  if ((frame.directional ?? []).includes('transformOrigin') && direction === -1) {
    if (frame.transformOrigin.includes('left')) {
      return frame.transformOrigin.replace('left', 'right')
    }
    if (frame.transformOrigin.includes('right')) {
      return frame.transformOrigin.replace('right', 'left')
    }
  }
  return frame.transformOrigin
}

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
    '--ys-c-from-o': String(spec.value.enter.opacity),
    '--ys-c-from-tf': composeTransform(spec.value.enter, waveDirection.value, false),
    'animation': `ys-cell-in ${spec.value.enterMs}ms ${spec.value.enter.easing} both`,
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
    '--ys-c-to-o': String(spec.value.leave.opacity),
    '--ys-c-to-tf': composeTransform(spec.value.leave, waveDirection.value, false),
    'animation': `ys-cell-out ${spec.value.leaveMs}ms ${spec.value.leave.easing} both`,
    'animationDelay': `${delayMs(course) + spec.value.leaveLagMs}ms`,
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
      '--ys-c-from-o': String(spec.value.enter.opacity),
      '--ys-c-from-tf': composeTransform(spec.value.enter, waveDirection.value, false),
      'animation': `ys-cell-in ${spec.value.enterMs}ms ${spec.value.enter.easing} both`,
      'animationDelay': `${delay}ms`,
    }
  }
  return {
    ...position,
    '--ys-c-to-o': String(spec.value.leave.opacity),
    '--ys-c-to-tf': composeTransform(spec.value.leave, waveDirection.value, false),
    'animation': `ys-cell-out ${spec.value.leaveMs}ms ${spec.value.leave.easing} both`,
    'animationDelay': `${delay + spec.value.leaveLagMs}ms`,
  }
}

function layerStyle(layer: 'enter' | 'leave') {
  if (!waveActive.value || spec.value.mode === 'per-cell') {
    return undefined
  }
  const percentX = spec.value.mode === 'page'
  if (layer === 'enter') {
    const frame = spec.value.enter
    return {
      '--ys-l-from-o': String(frame.opacity),
      '--ys-l-from-tf': composeTransform(frame, waveDirection.value, percentX),
      'transformOrigin': composeOrigin(frame, waveDirection.value),
      'animation': `ys-layer-in ${spec.value.enterMs}ms ${frame.easing} both`,
    }
  }
  const frame = spec.value.leave
  return {
    '--ys-l-to-o': String(frame.opacity),
    '--ys-l-to-tf': composeTransform(frame, waveDirection.value, percentX),
    'transformOrigin': composeOrigin(frame, waveDirection.value),
    'animation': `ys-layer-out ${spec.value.leaveMs}ms ${frame.easing} both`,
    'animationDelay': `${spec.value.leaveLagMs}ms`,
  }
}

/** cube 等 3D 预设：透视静态挂在两层共同父容器（board）上 */
const boardPerspective = computed(() =>
  waveActive.value && spec.value.perspectivePx
    ? { perspective: `${spec.value.perspectivePx}px` }
    : undefined,
)

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
  if (!props.swipeable || props.editable || event.pointerType === 'mouse') {
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
const formOpen = ref(false)
const formInitial = ref<Partial<Course> | null>(null)
const plannerOpen = ref(false)
const plannerDateKey = ref('')
const plannerDateLabel = ref('')
const backgroundOpen = ref(false)

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

/** 详情里该课程"当日天气"文案 */
const detailWeatherText = computed(() => {
  const course = detailStack.value[0]
  if (!course || !props.termStart || !props.weather) {
    return undefined
  }
  const key = formatDateKey(dateFor(props.termStart, props.week, course.weekday))
  const daily = props.weather.daily.find(item => item.date === key)
  if (!daily) {
    return undefined
  }
  const range = daily.highC != null ? ` ${Math.round(daily.lowC ?? 0)}~${Math.round(daily.highC)}°` : ''
  return `${daily.label ?? daily.kind}${range}`
})

function openCourseForm(prefill: Partial<Course> | null = null) {
  if (props.courseForm === 'builtin') {
    formInitial.value = prefill
    formOpen.value = true
  }
  else {
    emit('courseFormRequest', prefill ?? {})
  }
}

function handleDetailEdit(course: DisplayCourse) {
  detailOpen.value = false
  openCourseForm(course)
}

function handleDetailRemove(course: DisplayCourse) {
  detailOpen.value = false
  emit('courseRemove', course)
}

function handleFormSubmit(course: Course) {
  formOpen.value = false
  if (formInitial.value?.id) {
    emit('courseUpdate', course, formInitial.value.id)
  }
  else {
    emit('courseAdd', course)
  }
}

function handleDayTap(weekday: number) {
  const date = dayDate(weekday)
  emit('dayTap', weekday, date)
  if (props.dayPlanner === 'builtin' && date) {
    plannerDateKey.value = formatDateKey(date)
    plannerDateLabel.value = `${date.getMonth() + 1}月${date.getDate()}日 周${weekdayLabels.value[weekday - 1]}`
    plannerOpen.value = true
  }
}

function dayPendingCount(weekday: number): number {
  const date = dayDate(weekday)
  return date ? pendingPlanCount(props.dayPlans, date) : 0
}

function openDayPlanner(dateKey: string) {
  plannerDateKey.value = dateKey
  plannerDateLabel.value = dateKey
  plannerOpen.value = true
}

function openBackgroundPicker() {
  if (props.backgroundPicker === 'builtin') {
    backgroundOpen.value = true
  }
}

const backgroundStyle = computed(() => {
  if (!props.background?.image) {
    return null
  }
  return {
    backgroundImage: `url(${props.background.image})`,
    opacity: props.background.opacity ?? 0.5,
    filter: props.background.blur ? `blur(${props.background.blur}px)` : undefined,
  }
})

/* ------------------------------ 编辑模式：空白格拖选 ------------------------------ */

const cellSelection = ref<{ weekday: number, start: number, end: number } | null>(null)
let cellDragging = false

function cellIsSelected(weekday: number, section: number): boolean {
  const selection = cellSelection.value
  return Boolean(
    selection
    && selection.weekday === weekday
    && section >= Math.min(selection.start, selection.end)
    && section <= Math.max(selection.start, selection.end),
  )
}

function onCellPointerDown(event: PointerEvent, weekday: number, section: number) {
  if (!props.editable) {
    return
  }
  cellDragging = true
  cellSelection.value = { weekday, start: section, end: section }
  ;(event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId)
}

function onCellPointerMove(event: PointerEvent) {
  if (!cellDragging || !cellSelection.value) {
    return
  }
  event.preventDefault()
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-ys-cell]')
  if (!target) {
    return
  }
  const weekday = Number(target.dataset.weekday)
  const section = Number(target.dataset.section)
  if (weekday === cellSelection.value.weekday && section) {
    cellSelection.value = { ...cellSelection.value, end: section }
  }
}

function onCellPointerUp() {
  if (!cellDragging || !cellSelection.value) {
    return
  }
  cellDragging = false
  const { weekday, start, end } = cellSelection.value
  const startSection = Math.min(start, end)
  const endSection = Math.max(start, end)
  cellSelection.value = null
  emit('cellSelect', weekday, startSection, endSection)
  openCourseForm({ weekday, startSection, endSection, startWeek: 1, endWeek: props.totalWeeks })
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
  formOpen.value = false
  plannerOpen.value = false
  backgroundOpen.value = false
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
  openCourseForm,
  openDayPlanner,
  openBackgroundPicker,
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
  <div
    ref="rootEl"
    class="ys-schedule"
    :class="[
      `ys-density-${density}`,
      { 'ys-dark': theme === 'dark', 'is-editing': editable, 'has-bg': Boolean(backgroundStyle) },
    ]"
    :data-ys-effect="!waveActive && cardEffect !== 'none' ? cardEffect : undefined"
    :style="cssVars"
  >
    <div v-if="backgroundStyle" class="ys-schedule__bg" :style="backgroundStyle" aria-hidden="true" />
    <YsWeatherScene
      v-if="weatherScene && weather?.current"
      class="ys-schedule__scene"
      :kind="weather.current.kind"
      :dark="theme === 'dark'"
      :intensity="0.5"
    />
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
        @click="handleDayTap(weekday)"
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
          <b v-if="dayPendingCount(weekday)" class="ys-schedule__day-count">
            {{ dayPendingCount(weekday) > 9 ? '9+' : dayPendingCount(weekday) }}
          </b>
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

      <div class="ys-schedule__board" :style="[{ gridTemplateRows: rowTemplate }, boardPerspective]">
        <!-- 编辑模式：空白格拖选层（位于课程层之下） -->
        <template v-if="editable">
          <template v-for="row in rows" :key="`cells-${row.key}`">
            <template v-if="row.section">
              <button
                v-for="weekday in visibleDays"
                :key="`${weekday}-${row.section}`"
                type="button"
                class="ys-schedule__cell"
                :class="{ 'is-selected': cellIsSelected(weekday, row.section) }"
                :style="{
                  gridColumn: `${weekday} / ${weekday + 1}`,
                  gridRow: `${sectionToGridLine(row.section)} / ${sectionToGridLine(row.section) + 1}`,
                }"
                :data-weekday="weekday"
                :data-section="row.section"
                data-ys-cell
                :aria-label="`周${weekday}第${row.section}节空白时间`"
                @pointerdown="onCellPointerDown($event, weekday, row.section)"
                @pointermove="onCellPointerMove"
                @pointerup="onCellPointerUp"
                @pointercancel="cellSelection = null; cellDragging = false"
              />
            </template>
          </template>
        </template>

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
                :density="density"
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
                :density="density"
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
      :editable="editable"
      :weather-text="detailWeatherText"
      :hero="detail?.hero ?? 'color'"
      :fields="detail?.fields"
      :weather-kind="weather?.current?.kind"
      :vars="cssVars"
      @close="detailOpen = false"
      @edit="handleDetailEdit"
      @remove="handleDetailRemove"
    >
      <template #detail-extra="slotProps">
        <slot name="detail-extra" v-bind="slotProps" />
      </template>
      <template #detail-actions="slotProps">
        <slot name="detail-actions" v-bind="slotProps" />
      </template>
    </YsCourseDetail>

    <YsCourseForm
      :open="formOpen"
      :initial="formInitial"
      :courses="courses"
      :total-weeks="totalWeeks"
      :tokens="tokens"
      :weekday-labels="weekdayLabels"
      :vars="cssVars"
      @close="formOpen = false"
      @submit="handleFormSubmit"
    />

    <YsDayPlanner
      :open="plannerOpen"
      :date-key="plannerDateKey"
      :date-label="plannerDateLabel"
      :plans="dayPlans[plannerDateKey] ?? []"
      :vars="cssVars"
      @close="plannerOpen = false"
      @add="(dateKey, text) => emit('planAdd', dateKey, text)"
      @toggle="(dateKey, id) => emit('planToggle', dateKey, id)"
      @remove="(dateKey, id) => emit('planRemove', dateKey, id)"
    />

    <YsBackgroundSheet
      :open="backgroundOpen"
      :vars="cssVars"
      @close="backgroundOpen = false"
      @apply="(dataUrl) => { backgroundOpen = false; emit('backgroundChange', dataUrl) }"
      @clear="backgroundOpen = false; emit('backgroundChange', null)"
    />
  </div>
</template>

<style>
.ys-schedule {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: inherit;
  color: var(--ys-text-1);
  background: var(--ys-canvas);
  isolation: isolate;
}

.ys-schedule__scene {
  z-index: -1;
}

.ys-schedule__bg {
  position: absolute;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background-position: center;
  background-size: cover;
}

.ys-schedule.has-bg .ys-schedule__weekday-bar,
.ys-schedule.has-bg .ys-topbar {
  background: color-mix(in srgb, var(--ys-surface-1) 72%, transparent);
  backdrop-filter: blur(10px);
}

.ys-schedule__day-count {
  position: absolute;
  top: 4px;
  right: 6px;
  display: grid;
  place-items: center;
  min-width: 15px;
  height: 15px;
  padding: 0 3px;
  font-size: 8px;
  font-weight: 750;
  color: #fff;
  background: var(--ys-danger);
  border-radius: 8px;
}

.ys-schedule__cell {
  z-index: 0;
  min-width: 0;
  min-height: 0;
  padding: 0;
  touch-action: none;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-right: 1px solid var(--ys-grid-line);
  border-bottom: 1px solid var(--ys-grid-line);
  -webkit-tap-highlight-color: transparent;
}

.ys-schedule__cell.is-selected {
  background: color-mix(in srgb, var(--ys-accent) 13%, transparent);
  box-shadow: inset 0 0 0 2px var(--ys-accent);
  border-radius: 6px;
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
  line-height: 1;
  padding-bottom: 0.5px;
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

@keyframes ys-cell-in {
  from {
    opacity: var(--ys-c-from-o, 0);
    transform: var(--ys-c-from-tf, none);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes ys-cell-out {
  to {
    opacity: var(--ys-c-to-o, 0);
    transform: var(--ys-c-to-tf, none);
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

@keyframes ys-layer-in {
  from {
    opacity: var(--ys-l-from-o, 0);
    transform: var(--ys-l-from-tf, none);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes ys-layer-out {
  to {
    opacity: var(--ys-l-to-o, 0);
    transform: var(--ys-l-to-tf, none);
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
