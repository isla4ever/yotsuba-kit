# Schedule 课表

`<YsSchedule>` 是核心课表组件:顶部周信息栏 + 星期表头 + 周视图网格 + 换周过渡 + 手势 + 内置周选择器/课程详情。

内置面板均为"现成方案 + 完全可替换":`weekPicker` / `courseDetail` 设为 `'none'` 后只发事件,由宿主接管;保留内置方案时可用 slots 与 `--ys-*` 变量深度微调样式。

## Props

| 分组 | 属性 | 类型 / 取值 | 默认 | 说明 |
| --- | --- | --- | --- | --- |
| 数据 | `courses` | `Course[]` | — | 课程数据(受控) |
| | `week` | `number` | `1` | 当前周,支持 `v-model:week` |
| | `totalWeeks` | `number` | `20` | 总周数(setWeek 自动 clamp) |
| | `termStart` | `Date` | — | 第 1 周周一;传入后日期/今日高亮/补班生效 |
| | `overrides` | `DayOverride[]` | `[]` | 调休(makeup)/假日(holiday) |
| | `courseTimes` | `CourseTime[] \| 'standard'` | `'standard'` | 作息表 |
| 布局 | `visibleDays` | `5 \| 6 \| 7` | `7` | 显示天数 |
| | `rowHeight` | `number` | `56` | 节次行高(px) |
| | `breakAfterSection` | `number` | `4` | 午休分隔位置 |
| 顶栏 | `topBar` | `'compact' \| 'standard' \| 'expanded' \| 'none'` | `'standard'` | 顶部周信息栏三档形态:compact 单行极简 / standard 微信版复刻 / expanded 双行信息面板(日期范围+学期进度) |
| | `topBarTitle` | `string` | `'本学期课表'` | 顶栏标题 |
| 表头 | `weekdayBar` | `boolean` | `true` | 星期/日期表头行 |
| 动效 | `transition` | `'wave' \| 'slide' \| 'none' \| TransitionSpec` | `'wave'` | 换周过渡 |
| | `reduceMotion` | `boolean \| 'auto'` | `'auto'` | 减弱动效;auto 跟随系统 |
| | `swipeable` | `boolean` | `true` | 触摸滑动换周 |
| 面板 | `weekPicker` | `'builtin' \| 'none'` | `'builtin'` | 内置周选择器 |
| | `courseDetail` | `'builtin' \| 'none'` | `'builtin'` | 内置课程详情(重叠课先选后看) |
| 外观 | `theme` | `'light' \| 'dark' \| Partial<ThemeTokens>` | `'light'` | 主题令牌 |
| | `weather` | `WeatherSnapshot \| null` | `null` | 天气数据(expanded 顶栏展示) |
| | `locale` | `{ weekdays?, inactiveBadge?, makeupBadge?, breakLabel?, weekPickerTitle? }` | — | 文案定制 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:week` | `(week)` | v-model 配套 |
| `week-change` | `(week, previous)` | 周变化(滑动/选择器/外部 setWeek) |
| `course-tap` | `(course, stack)` | 点课;stack 为该格重叠组全部课程。`courseDetail: 'none'` 时以此接管详情 |
| `day-tap` | `(weekday, date)` | 点表头某天 |
| `swipe` | `(direction)` | 滑动触发翻周(1 下一周 / -1 上一周) |
| `week-picker-open` | — | 点击顶栏周数。`weekPicker: 'none'` 时以此接管选择器 |
| `transition-start` / `transition-end` | `(spec)` | 过渡生命周期 |

## Methods(ref 暴露)

| 方法 | 说明 |
| --- | --- |
| `setWeek(week)` | 跳转周(自动 clamp,带过渡) |
| `getWeek()` | 当前周 |
| `next()` / `previous()` | 前后翻周 |
| `openCourse(id)` | 打开某课程的内置详情 |
| `openWeekPicker()` | 打开周选择器(或触发接管事件) |
| `closeSheets()` | 关闭全部内置面板 |

## Slots

| 插槽 | 作用域 | 说明 |
| --- | --- | --- |
| `top-bar` | `{ week, totalWeeks, openWeekPicker }` | 整体替换顶栏 |
| `top-bar-tools` | — | 顶栏右侧工具位(天气按钮、管理入口等) |
| `day` | `{ weekday, label, date }` | 整体替换表头单日 |
| `course` | `{ course, active, color }` | 整体替换课程卡 |
| `detail-extra` | `{ course }` | 内置详情追加内容(作业、计划等) |
| `detail-actions` | `{ course, close }` | 内置详情底部操作区 |

## 编辑模式

`editable: true` 开启微信版同款编辑体验:空白格**点击或拖选节次范围** → 打开内置课程表单(名称/地点/教师/星期/节次/周次/单双周/调色板/携带物品/备注,冲突实时提示);详情面板出现 **编辑** 与 **两段确认删除**。

数据完全受控——组件只发事件,由宿主写回 `courses`:

```vue
<YsSchedule
  :courses="courses"
  editable
  @course-add="c => courses.push(c)"
  @course-update="(c, prevId) => replaceById(prevId, c)"
  @course-remove="c => removeById(c.id)"
/>
```

不想用内置表单:`course-form: 'none'`,监听 `cell-select(weekday, start, end)` / `course-form-request(prefill)` 自行接管;或随时用方法 `openCourseForm(prefill?)` 主动唤起。

## 日计划

传入受控的 `dayPlans`(`dateKey → DayPlan[]`),表头日期自动出现**未完成角标**;点日期打开内置日计划面板(增/勾/删都只发事件:`plan-add/plan-toggle/plan-remove`)。`day-planner: 'none'` 可关,`openDayPlanner(dateKey)` 可开。与 `<YsToday>` 传同一份 `dayPlans` 即联动出"今日计划"widget。

## 自定义背景

```vue
<YsSchedule
  :background="{ image: url, opacity: 0.35, blur: 0 }"
  @background-change="url => save(url)"
/>
```

`openBackgroundPicker()` 打开内置**上传 + 拖动/缩放裁剪**面板(按课表容器比例出图,产出 dataURL 由宿主持久化);设置背景后顶栏与表头自动切换毛玻璃。`background-picker: 'none'` 可完全自行实现。

## 导出、分享与提醒（core 纯函数）

```ts
import { computeReminders, createShareCode, exportICS, parseShareCode } from '@iyotsuba/schedule-core'

// ICS：写 .ics 文件 / 日历订阅源,导入系统日历、Google Calendar、Outlook
const ics = exportICS(courses, { termStart, courseTimes, totalWeeks: 20 })

// 课表分享码：口令/二维码皆可
const code = createShareCode(courses)
const restored = parseShareCode(code)

// 上课提醒时刻表：对接 Notification / Service Worker / App 推送
const reminders = computeReminders(courses, { termStart, courseTimes, leadMinutes: 15, from: new Date() })
```


## 次世代视觉体系（0.5.0）

| Prop | 取值 | 说明 |
| --- | --- | --- |
| `density` | `'minimal' \| 'normal' \| 'rich'` | 三档界面密度:精简近日历块 / 现状 / 信息全面(教师行、携带 🎒 角标) |
| `palette` | 六库名 \| `string[]` | 课程配色库:`classic / macaron / morandi / cyber / forest / sunset`(50 色全部通过白字对比度 ≥3:1 验证)或自定义数组 |
| `cardEffect` | `'none' \| 'shimmer' \| 'glow' \| 'aurora' \| 'breathe'` | 卡片装饰特效:流光 / 呼吸辉光 / 极光描边 / 微呼吸。只作用本周卡,换周动画期间自动暂停,reduced-motion 关闭,合成器动画零重绘(aurora 除外,已带低端机关闭规则) |
| `weatherScene` | `boolean` | 小米天气式实时背景场景:晴/多云/阴/雨/雷/雪/雾 纯 CSS 分层动画,依赖 `weather.current.kind`,强度上限不喧宾夺主 |
| `sheets` | `{ placement, glass }` | 全部内置弹窗统一配置:`bottom` 底部抽屉 / `center` 居中对话框 / `right` 侧滑抽屉(平板友好)+ 毛玻璃开关(自动降级) |
| `detail` | `{ hero, fields }` | 详情编排:hero `'color'/'weather'/'plain'` 三风格;`fields` 数组控制 time/weeks/location/teacher/weather/note/materials 的显隐与顺序 |
