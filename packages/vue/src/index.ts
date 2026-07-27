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
import YsWeatherGlyph from './YsWeatherGlyph.vue'
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
  YsWeatherGlyph,
  YsWeekPicker,
}
export { defaultScheduleGuideSteps } from './guidePresets'
export type { TodayResizeCorner, TodayWidgetConfig, TodayWidgetSize } from './YsToday.vue'

export function install(app: App): void {
  app.component('YsSchedule', YsSchedule)
  app.component('YsToday', YsToday)
}

export default { install }

export type {
  BuiltinTransitionName,
  CardEffect,
  DetailAction,
  DetailField,
  DetailHero,
  DetailLayout,
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
  SheetConfig,
  SheetKind,
  ThemeTokens,
  TransitionSpec,
  WeatherProvider,
  WeatherSnapshot,
  WeekModel,
} from '@iyotsuba/schedule-core'
