import type { App } from 'vue'
import YsBackgroundSheet from './YsBackgroundSheet.vue'
import YsCourseCard from './YsCourseCard.vue'
import YsCourseDetail from './YsCourseDetail.vue'
import YsCourseForm from './YsCourseForm.vue'
import YsDayPlanner from './YsDayPlanner.vue'
import YsGuide from './YsGuide.vue'
import YsSchedule from './YsSchedule.vue'
import YsSheet from './YsSheet.vue'
import YsToday from './YsToday.vue'
import YsTopBar from './YsTopBar.vue'
import YsWeatherScene from './YsWeatherScene.vue'
import YsWeekPicker from './YsWeekPicker.vue'

export {
  YsBackgroundSheet,
  YsCourseCard,
  YsCourseDetail,
  YsCourseForm,
  YsDayPlanner,
  YsGuide,
  YsSchedule,
  YsSheet,
  YsToday,
  YsTopBar,
  YsWeatherScene,
  YsWeekPicker,
}
export { defaultScheduleGuideSteps } from './guidePresets'
export type { TodayWidgetConfig } from './YsToday.vue'

export function install(app: App): void {
  app.component('YsSchedule', YsSchedule)
  app.component('YsToday', YsToday)
}

export default { install }

export type {
  BuiltinTransitionName,
  CardEffect,
  DetailField,
  DetailHero,
  PaletteName,
  ScheduleDensity,
  SheetPlacement,
  Course,
  CourseTime,
  DayOverride,
  DayPlan,
  DayPlanMap,
  DisplayCourse,
  GuideConfig,
  GuideMode,
  GuideStep,
  Reminder,
  ThemeTokens,
  TransitionSpec,
  WeatherProvider,
  WeatherSnapshot,
  WeekModel,
} from '@iyotsuba/schedule-core'
