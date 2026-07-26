import type { App } from 'vue'
import YsCourseCard from './YsCourseCard.vue'
import YsCourseDetail from './YsCourseDetail.vue'
import YsGuide from './YsGuide.vue'
import YsSchedule from './YsSchedule.vue'
import YsSheet from './YsSheet.vue'
import YsToday from './YsToday.vue'
import YsTopBar from './YsTopBar.vue'
import YsWeekPicker from './YsWeekPicker.vue'

export { YsCourseCard, YsCourseDetail, YsGuide, YsSchedule, YsSheet, YsToday, YsTopBar, YsWeekPicker }
export { defaultScheduleGuideSteps } from './guidePresets'
export type { TodayWidgetConfig } from './YsToday.vue'

export function install(app: App): void {
  app.component('YsSchedule', YsSchedule)
  app.component('YsToday', YsToday)
}

export default { install }

export type {
  BuiltinTransitionName,
  Course,
  CourseTime,
  DayOverride,
  DisplayCourse,
  GuideConfig,
  GuideMode,
  GuideStep,
  ThemeTokens,
  TransitionSpec,
  WeatherProvider,
  WeatherSnapshot,
  WeekModel,
} from '@iyotsuba/schedule-core'
