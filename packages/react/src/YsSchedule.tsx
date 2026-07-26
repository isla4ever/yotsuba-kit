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
} from '@iyotsuba/schedule-core'
import type { CSSProperties } from 'react'
import { register } from '@iyotsuba/schedule-elements'
import { createElement } from 'react'
import { useElementBridge } from './useElement'

register()

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
  locale?: Record<string, unknown>
  onWeekChange?: (week: number, previous: number) => void
  /** 受控用法：配合 week 使用 */
  onUpdateWeek?: (week: number) => void
  onCourseTap?: (course: DisplayCourse, stack: DisplayCourse[]) => void
  onDayTap?: (weekday: number, date: Date | null) => void
  onSwipe?: (direction: 1 | -1) => void
  onWeekPickerOpen?: () => void
  onGuideStep?: (step: GuideStep, index: number) => void
  onGuideFinish?: () => void
  className?: string
  style?: CSSProperties
}

export function YsSchedule(props: YsScheduleProps) {
  const {
    className,
    style,
    onWeekChange,
    onUpdateWeek,
    onCourseTap,
    onDayTap,
    onSwipe,
    onWeekPickerOpen,
    onGuideStep,
    onGuideFinish,
    ...properties
  } = props

  const ref = useElementBridge<HTMLElement>(properties, {
    'weekChange': onWeekChange,
    'update:week': onUpdateWeek,
    'courseTap': onCourseTap,
    'dayTap': onDayTap,
    'swipe': onSwipe,
    'weekPickerOpen': onWeekPickerOpen,
    'guideStep': onGuideStep,
    'guideFinish': onGuideFinish,
  })

  return createElement('ys-schedule', { 'ref': ref, 'class': className, style })
}
