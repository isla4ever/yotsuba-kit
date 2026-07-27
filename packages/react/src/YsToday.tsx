import type {
  Course,
  CourseTime,
  DayOverride,
  DayPlanMap,
  DisplayCourse,
  ThemeTokens,
  WeatherSnapshot,
} from '@iyotsuba/schedule-core'
import type { CSSProperties } from 'react'
import { register } from '@iyotsuba/schedule-elements'
import { createElement, forwardRef } from 'react'
import { useElementBridge } from './useElement'

register()

export type TodayWidgetSize = 'compact' | 'standard' | 'large' | '1x1' | '1x2' | '2x1' | '2x2'
export type TodayResizeCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface TodayWidgetConfig {
  id: string
  enabled?: boolean
  size?: TodayWidgetSize
}

export interface YsTodayProps {
  courses: Course[]
  termStart: Date
  totalWeeks?: number
  overrides?: DayOverride[]
  courseTimes?: CourseTime[] | 'standard'
  widgets?: TodayWidgetConfig[]
  theme?: 'light' | 'dark' | Partial<ThemeTokens>
  weather?: WeatherSnapshot | null
  now?: Date
  title?: string
  dayPlans?: DayPlanMap
  arrangeable?: boolean
  weatherScene?: boolean
  reduceMotion?: boolean
  emptyText?: string
  emptyTexts?: Record<string, string>
  onCourseTap?: (course: DisplayCourse) => void
  onWidgetTap?: (id: string) => void
  onWidgetsChange?: (widgets: TodayWidgetConfig[]) => void
  onLayoutChange?: (widgets: TodayWidgetConfig[]) => void
  onLayoutEditing?: (editing: boolean) => void
  onWidgetMove?: (id: string, from: number, to: number) => void
  onWidgetResize?: (id: string, size: TodayWidgetSize, corner: TodayResizeCorner) => void
  className?: string
  style?: CSSProperties
}

export interface YsTodayElement extends HTMLElement {
  setWidgets: (widgets: TodayWidgetConfig[]) => void
  setArranging: (value: boolean, widgetId?: string | null) => void
  moveWidget: (id: string, offset: -1 | 1) => void
  resizeWidget: (id: string) => void
  toggleWidget: (id: string, enabled: boolean) => void
  layoutReset: () => void
}

export const YsToday = forwardRef<YsTodayElement, YsTodayProps>(function YsToday(props, forwardedRef) {
  const {
    className,
    style,
    onCourseTap,
    onWidgetTap,
    onWidgetsChange,
    onLayoutChange,
    onLayoutEditing,
    onWidgetMove,
    onWidgetResize,
    ...properties
  } = props

  const ref = useElementBridge<YsTodayElement>(properties, {
    courseTap: onCourseTap,
    widgetTap: onWidgetTap,
    'update:widgets': onWidgetsChange,
    layoutChange: onLayoutChange,
    layoutEditing: onLayoutEditing,
    widgetMove: onWidgetMove,
    widgetResize: onWidgetResize,
  }, forwardedRef)

  return createElement('ys-today', { 'ref': ref, 'class': className, style })
})
