# Core API

`@iyotsuba/schedule-core` 不依赖 Vue、React 或浏览器。它负责学期规则、重叠分组、主题、动效协议、数据交换、提醒、天气和引导状态机；框架组件只消费这些结果。

## 学期、日期与冲突

```ts
import {
  buildWeekModel,
  buildDisplayCourses,
  buildOverlapGroups,
  dateFor,
  findConflicts,
  isCourseActive,
  weekOf,
} from '@iyotsuba/schedule-core'

const model = buildWeekModel(courses, week, { termStart, overrides })
const conflicts = findConflicts(courses, editedCourse)
```

| API | 返回 | 用途 |
| --- | --- | --- |
| `weekOf(date, termStart, totalWeeks)` | `number` | 从日期计算学期周次，自动限制范围 |
| `dateFor(termStart, week, weekday)` | `Date` | 将第 N 周 / 周几换算为日期 |
| `isCourseActive(course, week)` | `boolean` | 判断周次与单双周是否生效 |
| `buildDisplayCourses(courses, week, options)` | `DisplayCourse[]` | 应用调休、假日和本周状态 |
| `buildOverlapGroups(courses)` | `OverlapGroup[]` | 计算重叠课程连通组 |
| `buildWeekModel(courses, week, options)` | `WeekModel` | 生成组件直接使用的周模型 |
| `findConflicts(courses, candidate)` | `Course[]` | 编辑前检测同一时段冲突 |
| `buildScheduleRows(times, options)` | `ScheduleRow[]` | 生成节次与午休分隔行 |

## 交换、提醒与课程资料

```ts
import {
  computeReminders,
  createShareCode,
  exportICS,
  parseShareCode,
  courseCarryItems,
} from '@iyotsuba/schedule-core'

const ics = exportICS(courses, { termStart, courseTimes, totalWeeks: 20 })
const shareCode = createShareCode(courses)
const restored = parseShareCode(shareCode)
const reminders = computeReminders(courses, { termStart, courseTimes, leadMinutes: 15, from: new Date() })
```

这些函数只计算和编码数据：下载文件、通知权限、系统日历写入、二维码、分享和持久化都由宿主完成。

## 天气、主题与动效

```ts
import {
  createCourseColorResolver,
  darkTheme,
  lightTheme,
  resolvePalette,
  resolveTransition,
  validateTransition,
} from '@iyotsuba/schedule-core'
import { createOpenMeteoProvider } from '@iyotsuba/schedule-core/weather/open-meteo'

const provider = createOpenMeteoProvider({ latitude, longitude })
const weather = await provider.getSnapshot()
```

### 天气、主题与动效

| API | 用途 |
| --- | --- |
| `createOpenMeteoProvider(options)` | 可选的 Open-Meteo WeatherProvider 参考实现；宿主仍决定何时定位、请求和缓存 |
| `lightTheme` / `darkTheme` | 默认主题令牌 |
| `tokensToCssVars(tokens)` | 将主题令牌转为 `--ys-*` CSS 变量 |
| `resolvePalette(nameOrColors)` | 解析六套内置或自定义课程色板 |
| `createCourseColorResolver(tokens)` | 按课程名生成稳定颜色 |
| `resolveTransition(nameOrSpec)` | 取得内置或自定义 `TransitionSpec` |
| `validateTransition(spec)` | 在接入前验证自定义换周动画协议 |
| `createGuideMachine(config)` | 创建引导状态机，可给非课表页面复用 |

内置转换包括 `wave`、`slide`、`fade`、`cube`、`drop`、`zoom` 和 `none`。自定义 `TransitionSpec` 描述进出场关键帧、时长、延迟和稳定格跳过策略，不需要 fork 组件。
