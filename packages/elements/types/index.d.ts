export interface YsScheduleEventMap {
  weekChange: CustomEvent<[number, number]>
  courseTap: CustomEvent<[unknown, unknown[]]>
  dayTap: CustomEvent<[number, Date | null]>
  transitionStart: CustomEvent<[unknown]>
  transitionEnd: CustomEvent<[unknown]>
  backgroundChange: CustomEvent<[string | null]>
}

export interface YsTodayEventMap {
  courseTap: CustomEvent<[unknown]>
  widgetTap: CustomEvent<[string]>
  layoutChange: CustomEvent<[unknown[]]>
  layoutEditing: CustomEvent<[boolean]>
  widgetMove: CustomEvent<[string, number, number]>
  widgetResize: CustomEvent<[string, string, string]>
}

export interface YsScheduleElementInstance extends HTMLElement {
  setWeek(week: number): void
  getWeek(): number
  next(): void
  previous(): void
  openCourse(courseId: string): void
  openWeekPicker(): void
  openCourseForm(prefill?: Record<string, unknown>): void
  openDayPlanner(date?: Date): void
  openBackgroundPicker(): void
  closeSheets(): void
  startGuide(): void
  addEventListener<K extends keyof YsScheduleEventMap>(
    type: K,
    listener: (this: YsScheduleElementInstance, event: YsScheduleEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void
}

export interface YsTodayElementInstance extends HTMLElement {
  setWidgets(widgets: unknown[]): void
  setArranging(value: boolean, widgetId?: string | null): void
  moveWidget(id: string, offset: -1 | 1): void
  resizeWidget(id: string): void
  toggleWidget(id: string, enabled: boolean): void
  layoutReset(): void
  addEventListener<K extends keyof YsTodayEventMap>(
    type: K,
    listener: (this: YsTodayElementInstance, event: YsTodayEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void
}

export declare const YsScheduleElement: { new (): YsScheduleElementInstance }
export declare const YsTodayElement: { new (): YsTodayElementInstance }

/** 注册 <ys-schedule> 与 <ys-today>（import 时已自动注册，可用于自定义前缀） */
export declare function register(prefix?: string): void
