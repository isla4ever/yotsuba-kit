/** 单双周规则 */
export type WeekParity = 'every' | 'odd' | 'even'

/** 课程资料类型；`book` 会同时进入教材与今日携带清单。 */
export type CourseMaterialKind = 'book' | 'device' | 'equipment' | 'document' | 'other'

/** 结构化课程资料。旧版 `materials: string[]` 仍完全兼容。 */
export interface CourseMaterial {
  id?: string
  name: string
  kind?: CourseMaterialKind
  required?: boolean
  quantity?: number
  note?: string
}

/** 结构化教材信息。 */
export interface CourseBook {
  id?: string
  title: string
  author?: string
  isbn?: string
  required?: boolean
  note?: string
}

/** 随课程展示的作业/任务；副作用和持久化仍由宿主负责。 */
export interface CourseTask {
  id: string
  title: string
  description?: string
  /** ISO 8601 日期或日期时间。 */
  dueAt?: string
  done?: boolean
  priority?: 'low' | 'normal' | 'high'
}

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
  /** 携带物品/上课准备；兼容字符串并支持类型、数量与备注。 */
  materials?: Array<string | CourseMaterial>
  /** 课程教材。 */
  books?: CourseBook[]
  /** 课程作业/任务。 */
  tasks?: CourseTask[]
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
  /** 起始 Y 位移，px */
  translateY?: number
  /** 起始 X 位移：page/cube 模式单位 %，其余 px */
  translateX?: number
  /** 起始缩放（directional 含 'scale' 时按 1 为轴随方向镜像：1+(scale-1)×dir） */
  scale?: number
  /** 起始 Y 轴旋转，deg（3D，需 TransitionSpec.perspectivePx） */
  rotateY?: number
  /** 起始 Z 轴旋转，deg */
  rotateZ?: number
  /** transform-origin；directional 含 'transformOrigin' 时 left/right 随方向互换 */
  transformOrigin?: string
  /** 哪些通道随翻页方向(direction=±1)镜像取反；缺省 ['translateX'] */
  directional?: Array<'translateX' | 'translateY' | 'rotateY' | 'rotateZ' | 'scale' | 'transformOrigin'>
  /** CSS 缓动函数字符串 */
  easing: string
}

/**
 * 换周过渡协议。
 * mode `per-cell`：逐格动画（每格用 delayFor 计算延迟）；
 * mode `page`：真实整页位移/翻转（translateX 单位为 %），可叠加 cellStagger 轻量波浪淡入；
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
  /** 3D 预设（如 cube）：静态挂在两层共同父容器上的透视距离 */
  perspectivePx?: number
}

/* ------------------------------ 视觉配置 ------------------------------ */

/** 课程卡配色库名（自定义时直接传 string[]） */
export type PaletteName = 'classic' | 'macaron' | 'morandi' | 'cyber' | 'forest' | 'sunset'

/** 界面密度：精简（近日历块）/ 正常 / 全面（信息饱满） */
export type ScheduleDensity = 'minimal' | 'normal' | 'rich'

/** 详情面板可编排字段 */
export type DetailField = 'time' | 'weeks' | 'location' | 'teacher' | 'weather' | 'note' | 'materials' | 'tasks'

/** 详情 hero 风格：课程色 / 当日天气渐变 / 极简 */
export type DetailHero = 'color' | 'weather' | 'plain'

/** 详情信息密度：精简摘要 / 适中信息 / 全面信息。 */
export type DetailLayout = 'compact' | 'standard' | 'full'

/** 课程详情底部动作；宿主通过事件接管分享、编辑与删除副作用 */
export type DetailAction = 'share' | 'edit' | 'remove'

/** 弹窗位置：底部抽屉 / 居中对话框 / 侧滑抽屉（平板友好） */
export type SheetPlacement = 'bottom' | 'center' | 'right'

/** 内置弹层类型，用于按弹层分别指定默认位置。 */
export type SheetKind = 'weekPicker' | 'courseDetail' | 'courseForm' | 'dayPlanner' | 'background' | 'settings' | 'custom'

/** 内置弹层配置。contained=true 时弹层约束在课表组件内部，而非整个浏览器视口。 */
export interface SheetConfig {
  placement?: SheetPlacement
  placements?: Partial<Record<SheetKind, SheetPlacement>>
  glass?: boolean
  contained?: boolean
  /** 在每个弹层 Header 显示位置切换按钮。 */
  adjustable?: boolean
}

/** 课程卡装饰特效（只作用于本周卡，reduced-motion 自动关闭） */
export type CardEffect = 'none' | 'shimmer' | 'glow' | 'aurora' | 'breathe'

/** 课程卡天气联动；默认只开启局部微动态天气材质，图标与文案可显式启用。 */
export interface WeatherCardConfig {
  enabled?: boolean
  glyph?: boolean
  background?: boolean
  label?: boolean
  /** 0-1，控制天气卡面的可见强度。 */
  intensity?: number
}

/** 星期栏天气信息档位。 */
export type WeekdayWeatherMode = 'none' | 'icon' | 'full'

/* ------------------------------ 天气协议 ------------------------------ */

export type WeatherKind
  = | 'clear' | 'cloudy' | 'overcast' | 'fog'
    | 'drizzle' | 'rain' | 'heavy-rain' | 'storm' | 'snow' | 'neutral'

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
