import type { App } from 'vue'
import YsSchedule from './YsSchedule.vue'

export { YsSchedule }

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
} from '@yotsuba/schedule-core'
