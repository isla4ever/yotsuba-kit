import type {
  BuiltinTransitionName,
  CardEffect,
  Course,
  CourseTime,
  DayOverride,
  DayPlanMap,
  DetailAction,
  DetailField,
  DetailHero,
  DetailLayout,
  DisplayCourse,
  GuideConfig,
  GuideStep,
  PaletteName,
  ScheduleDensity,
  SheetConfig,
  ThemeTokens,
  TransitionSpec,
  WeatherSnapshot,
  WeatherCardConfig,
  WeekdayWeatherMode,
} from '@iyotsuba/schedule-core'
import type { CSSProperties } from 'react'
import { register } from '@iyotsuba/schedule-elements'
import { createElement, forwardRef } from 'react'
import { useElementBridge } from './useElement'

register()

export interface ScheduleBackground {
  image?: string
  opacity?: number
  blur?: number
}

export interface ScheduleDetailConfig {
  hero?: DetailHero
  layout?: DetailLayout
  fields?: DetailField[]
  actions?: DetailAction[]
  adjustable?: boolean
  emptyText?: string
  emptyTexts?: Partial<Record<DetailField, string>>
}

export interface YsScheduleProps {
  courses: Course[]
  week?: number
  totalWeeks?: number
  termStart?: Date
  overrides?: DayOverride[]
  courseTimes?: CourseTime[] | 'standard'
  visibleDays?: 5 | 6 | 7
  rowHeight?: number
  breakAfterSection?: number
  topBar?: 'compact' | 'standard' | 'expanded' | 'none'
  topBarTitle?: string
  weekdayBar?: boolean
  transition?: BuiltinTransitionName | TransitionSpec
  theme?: 'light' | 'dark' | Partial<ThemeTokens>
  weather?: WeatherSnapshot | null
  reduceMotion?: boolean | 'auto'
  swipeable?: boolean
  weekPicker?: 'builtin' | 'none'
  courseDetail?: 'builtin' | 'none'
  guide?: GuideConfig | false
  editable?: boolean
  courseForm?: 'builtin' | 'none'
  dayPlans?: DayPlanMap
  dayPlanner?: 'builtin' | 'none'
  background?: ScheduleBackground | null
  backgroundPicker?: 'builtin' | 'none'
  density?: ScheduleDensity
  palette?: PaletteName | string[]
  cardEffect?: CardEffect
  weatherCard?: WeatherCardConfig | false
  weekdayWeather?: WeekdayWeatherMode
  weatherScene?: boolean
  sheets?: SheetConfig
  detail?: ScheduleDetailConfig
  locale?: Record<string, unknown>
  onWeekChange?: (week: number, previous: number) => void
  /** 受控用法：配合 week 使用 */
  onUpdateWeek?: (week: number) => void
  onCourseTap?: (course: DisplayCourse, stack: DisplayCourse[]) => void
  onDayTap?: (weekday: number, date: Date | null) => void
  onSwipe?: (direction: 1 | -1) => void
  onWeekPickerOpen?: () => void
  onTransitionStart?: (spec: TransitionSpec) => void
  onTransitionEnd?: (spec: TransitionSpec) => void
  onGuideStep?: (step: GuideStep, index: number) => void
  onGuideFinish?: () => void
  onCourseAdd?: (course: Course) => void
  onCourseUpdate?: (course: Course, previousId: string) => void
  onCourseRemove?: (course: DisplayCourse) => void
  onCellSelect?: (weekday: number, startSection: number, endSection: number) => void
  onCourseFormRequest?: (prefill: Partial<Course>) => void
  onPlanAdd?: (dateKey: string, text: string) => void
  onPlanToggle?: (dateKey: string, id: string) => void
  onPlanRemove?: (dateKey: string, id: string) => void
  onBackgroundChange?: (dataUrl: string | null) => void
  onCourseShare?: (course: DisplayCourse) => void
  onDetailLayoutChange?: (layout: DetailLayout) => void
  className?: string
  style?: CSSProperties
}

export interface YsScheduleElement extends HTMLElement {
  setWeek: (week: number) => void
  getWeek: () => number
  next: () => void
  previous: () => void
  openCourse: (courseId: string) => void
  openWeekPicker: () => void
  openCourseForm: (prefill?: Partial<Course>) => void
  openDayPlanner: (date?: Date) => void
  openBackgroundPicker: () => void
  closeSheets: () => void
  startGuide: () => void
}

export const YsSchedule = forwardRef<YsScheduleElement, YsScheduleProps>(function YsSchedule(props, forwardedRef) {
  const {
    className,
    style,
    onWeekChange,
    onUpdateWeek,
    onCourseTap,
    onDayTap,
    onSwipe,
    onWeekPickerOpen,
    onTransitionStart,
    onTransitionEnd,
    onGuideStep,
    onGuideFinish,
    onCourseAdd,
    onCourseUpdate,
    onCourseRemove,
    onCellSelect,
    onCourseFormRequest,
    onPlanAdd,
    onPlanToggle,
    onPlanRemove,
    onBackgroundChange,
    onCourseShare,
    onDetailLayoutChange,
    ...properties
  } = props

  const ref = useElementBridge<YsScheduleElement>(properties, {
    'weekChange': onWeekChange,
    'update:week': onUpdateWeek,
    'courseTap': onCourseTap,
    'dayTap': onDayTap,
    'swipe': onSwipe,
    'weekPickerOpen': onWeekPickerOpen,
    'transitionStart': onTransitionStart,
    'transitionEnd': onTransitionEnd,
    'guideStep': onGuideStep,
    'guideFinish': onGuideFinish,
    'courseAdd': onCourseAdd,
    'courseUpdate': onCourseUpdate,
    'courseRemove': onCourseRemove,
    'cellSelect': onCellSelect,
    'courseFormRequest': onCourseFormRequest,
    'planAdd': onPlanAdd,
    'planToggle': onPlanToggle,
    'planRemove': onPlanRemove,
    'backgroundChange': onBackgroundChange,
    'courseShare': onCourseShare,
    'detailLayoutChange': onDetailLayoutChange,
  }, forwardedRef)

  return createElement('ys-schedule', { 'ref': ref, 'class': className, style })
})
