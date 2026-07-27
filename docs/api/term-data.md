# 学期、冲突与交换

`@iyotsuba/schedule-core` 提供与框架无关的学期计算、课程冲突、数据交换和提醒能力。宿主只需要传入课程、学期开始日期和节次配置。

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

[返回 Core API 总览](/api/core)
