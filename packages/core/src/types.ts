/** 单双周规则 */
export type WeekParity = 'every' | 'odd' | 'even'

/** 组件库标准课程模型（干净模型；教务原始格式请用 adapters 转换） */
export interface Course {
  /** 稳定唯一 id；同一门课跨节次拆分时应保持不同 id */
  id: string
  name: string
  teacher?: string
  location?: string
  /** 1-7，周一为 1 */
  weekday: number
  startSection: number
  endSection: number
  startWeek: number
  endWeek: number
  parity?: WeekParity
  /** 任意合法 CSS 颜色；缺省时由主题的调色板自动分配 */
  color?: string
  custom?: boolean
  /** 携带物品/上课准备（教材、实验服、球拍…），详情与今日板块展示"记得带" */
  materials?: string[]
  /** 备注 */
  note?: string
  /** 宿主自定义附加数据，组件库原样透传 */
  meta?: Record<string, unknown>
}

export interface CourseTime {
  start: string
  end: string
}

/** 调休 / 补班 / 假日 */
export interface DayOverride {
  /** YYYY-MM-DD */
  date: string
  kind: 'makeup' | 'holiday'
  /** makeup：课程来自哪个星期（1-7） */
  sourceWeekday?: number
  name?: string
}

/** 某周展示用的课程（补班复制后 weekday 为展示星期） */
export interface DisplayCourse extends Course {
  displayId: string
  active: boolean
  makeup?: {
    sourceWeekday: number
    date: string
    name?: string
  }
}

export interface OverlapGroup {
  id: string
  weekday: number
  startSection: number
  endSection: number
  courses: DisplayCourse[]
}

export interface WeekModel {
  week: number
  courses: DisplayCourse[]
  overlapGroups: OverlapGroup[]
}

export interface ScheduleRow {
  key: string
  section: number | null
  time: CourseTime | null
  label: string
  isBreak: boolean
}

/* ------------------------------ 过渡动画协议 ------------------------------ */

export interface TransitionCell {
  weekday: number
  startSection: number
}

export interface TransitionContext {
  /** 1 = 去下一周（波从右向左扫），-1 = 上一周 */
  direction: 1 | -1
  /** 可见列数（5/6/7） */
  columns: number
}

export interface KeyframeSpec {
  /** 起始不透明度（终点恒为进场 1 / 离场 0） */
  opacity: number
  /** 起始 Y 位移，px（仅进场使用） */
  translateY?: number
  /** 起始 X 位移，px（layer 模式使用） */
  translateX?: number
  /** CSS 缓动函数字符串 */
  easing: string
}

/**
 * 换周过渡协议。
 * mode `per-cell`：逐格波浪（每格用 delayFor 计算延迟）；
 * mode `page`：真实整页滑动（translateX 单位为 %），可叠加 cellStagger 轻量波浪淡入；
 * mode `layer`：整层交叉过渡（delayFor 恒为 0）。
 */
export interface TransitionSpec {
  name: string
  mode: 'per-cell' | 'page' | 'layer'
  totalMs: number
  enterMs: number
  leaveMs: number
  /** 离场相对进场的滞后，保证两层交叠 */
  leaveLagMs: number
  delayFor: (cell: TransitionCell, ctx: TransitionContext) => number
  enter: KeyframeSpec
  leave: KeyframeSpec
  /** 换周前后视觉不变的格子是否完全静止（per-cell 推荐 true） */
  stableSkip: boolean
  /** page 模式：进场卡片的轻量逐列淡入 */
  cellStagger?: {
    fromOpacity: number
    /** 每列递增延迟 */
    stepMs: number
    durationMs: number
    easing: string
  }
}

/* ------------------------------ 天气协议 ------------------------------ */

export type WeatherKind
  = | 'clear' | 'cloudy' | 'overcast' | 'fog'
    | 'drizzle' | 'rain' | 'storm' | 'snow' | 'neutral'

export interface DailyWeather {
  /** YYYY-MM-DD */
  date: string
  kind: WeatherKind
  highC?: number
  lowC?: number
  label?: string
}

export interface WeatherSnapshot {
  current?: { kind: WeatherKind, temperatureC?: number, label?: string }
  daily: DailyWeather[]
  updatedAt: number
}

/**
 * 天气由宿主注入，组件库绝不私自发起网络请求。
 * 参考实现见 `@iyotsuba/schedule-core/weather/open-meteo`。
 */
export interface WeatherProvider {
  getSnapshot: () => Promise<WeatherSnapshot>
  subscribe?: (listener: (snapshot: WeatherSnapshot) => void) => () => void
}

/* ------------------------------ 引导协议 ------------------------------ */

export type GuideMode = 'tips' | 'spotlight' | 'walkthrough'

export interface GuideStep {
  id: string
  title: string
  body: string
  /** 目标元素选择器或语义锚点名（适配层解析） */
  target: string
  /** walkthrough 模式下要求用户完成的真实动作 */
  expect?: 'tap' | 'swipe-left' | 'swipe-right' | 'longpress'
  /** expect 超时后播放手势暗示动画的等待毫秒数 */
  hintAfterMs?: number
}

export interface GuideConfig {
  mode: GuideMode
  steps: GuideStep[]
  /** 完成状态持久化 key；不传则每次都可触发 */
  storageKey?: string
  autoStart?: boolean
}
