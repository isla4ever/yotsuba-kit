# 学期、课程与数据交换

本页用于查询学期日期、课程生效规则、冲突检测和数据交换函数。所有函数均来自 `@iyotsuba/schedule-core`，不依赖界面框架。

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
| `weekOf(date, termStart, totalWeeks)` | `number` | 从日期计算学期周次，并限制在有效范围内 |
| `dateFor(termStart, week, weekday)` | `Date` | 将第 N 周 / 周几换算为日期 |
| `isCourseActive(course, week)` | `boolean` | 判断周次与单双周是否生效 |
| `buildDisplayCourses(courses, week, options)` | `DisplayCourse[]` | 应用调休、假日和本周状态 |
| `buildOverlapGroups(courses)` | `OverlapGroup[]` | 计算需要层叠展示的课程组 |
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

这些函数只负责计算与编码。文件下载、通知权限、系统日历写入、二维码展示、分享和持久化均由宿主完成。

[返回 Core API 总览](/api/core)
