import type { App } from 'vue'
import YsCourseCard from './YsCourseCard.vue'
import YsCourseDetail from './YsCourseDetail.vue'
import YsSchedule from './YsSchedule.vue'
import YsSheet from './YsSheet.vue'
import YsTopBar from './YsTopBar.vue'
import YsWeekPicker from './YsWeekPicker.vue'

export { YsCourseCard, YsCourseDetail, YsSchedule, YsSheet, YsTopBar, YsWeekPicker }

export function install(app: App): void {
  app.component('YsSchedule', YsSchedule)
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
