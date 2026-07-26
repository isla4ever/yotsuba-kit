import type {
  Course,
  CourseTime,
  DayOverride,
  DisplayCourse,
  ThemeTokens,
  WeatherSnapshot,
} from '@iyotsuba/schedule-core'
import type { CSSProperties } from 'react'
import { register } from '@iyotsuba/schedule-elements'
import { createElement } from 'react'
import { useElementBridge } from './useElement'

register()

export interface YsTodayProps {
  courses: Course[]
  termStart: Date
  totalWeeks?: number
  overrides?: DayOverride[]
  courseTimes?: CourseTime[] | 'standard'
  widgets?: Array<{ id: string, enabled?: boolean }>
  theme?: 'light' | 'dark' | Partial<ThemeTokens>
  weather?: WeatherSnapshot | null
  now?: Date
  title?: string
  onCourseTap?: (course: DisplayCourse) => void
  onWidgetTap?: (id: string) => void
  className?: string
  style?: CSSProperties
}

export function YsToday(props: YsTodayProps) {
  const { className, style, onCourseTap, onWidgetTap, ...properties } = props

  const ref = useElementBridge<HTMLElement>(properties, {
    courseTap: onCourseTap,
    widgetTap: onWidgetTap,
  })

  return createElement('ys-today', { 'ref': ref, 'class': className, style })
}
