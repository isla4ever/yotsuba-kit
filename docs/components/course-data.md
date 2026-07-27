# 课程数据

`Course` 是课表、今日视图和 Core API 共用的课程模型。先提供排课所需的基础字段，再按业务需要补充教材、携带物、任务和备注。组件负责计算与展示，数据的保存、同步和提醒仍由宿主应用处理。

## 最小课程

一门课程至少需要名称、上课日、节次范围和生效周次：

```ts
import type { Course } from '@iyotsuba/schedule-core'

const course: Course = {
  id: 'math-01',
  name: '高等数学',
  weekday: 1,
  startSection: 1,
  endSection: 2,
  startWeek: 1,
  endWeek: 20,
}
```

`weekday` 使用 `1` 至 `7` 表示周一至周日。未传 `parity` 时，课程默认每周生效。

## 教材、携带物与任务

这些字段会同时进入课程详情和 Today 今日视图，可用于生成课前准备清单与待办汇总：

```ts
import type { Course } from '@iyotsuba/schedule-core'

const enrichedCourse: Course = {
  ...course,
  teacher: '陈老师',
  location: '教一 201',
  books: [
    { id: 'math-book', title: '高等数学（第八版）', author: '同济大学数学科学学院', required: true },
  ],
  materials: [
    '计算器',
    { id: 'laptop', name: '笔记本电脑', kind: 'device', quantity: 1, required: true },
  ],
  tasks: [
    { id: 'chapter-3', title: '完成第三章课后题', dueAt: '2026-09-10T21:00:00+08:00', priority: 'high', done: false },
  ],
  note: '课前完成本周习题。',
  meta: { campusCourseId: 'MATH101' },
}
```

## 字段

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 稳定且唯一的标识；拆分后的课程应使用不同 id |
| `name` | `string` | 是 | 课程名 |
| `weekday` | `1..7` | 是 | 周一为 `1`，周日为 `7` |
| `startSection` / `endSection` | `number` | 是 | 节次范围，包含首尾 |
| `startWeek` / `endWeek` | `number` | 是 | 生效周次范围 |
| `parity` | `'every' \| 'odd' \| 'even'` | 否 | 不传等价于 `every` |
| `teacher` / `location` | `string` | 否 | 在课程卡和详情中展示 |
| `color` | CSS color | 否 | 不传时按课程名使用主题配色稳定分配 |
| `custom` | `boolean` | 否 | 宿主自定义课程标记 |
| `books` | `CourseBook[]` | 否 | 教材；会进入 Today 的课前携带清单 |
| `materials` | `(string \| CourseMaterial)[]` | 否 | 兼容旧版字符串，支持结构化物品 |
| `tasks` | `CourseTask[]` | 否 | 显示在课程详情和 Today 任务模块 |
| `note` | `string` | 否 | 课程备注 |
| `meta` | `Record<string, unknown>` | 否 | 组件不解释、原样透传的宿主数据 |

## 扩展字段

`CourseMaterial.kind` 支持 `book`、`device`、`equipment`、`document` 和 `other`，并可附加 `required`、`quantity` 与 `note`。`CourseBook` 额外支持 `author` 和 `isbn`。旧版 `materials: string[]` 仍可使用，现有数据可以逐步迁移。

`CourseTask` 的最小字段是 `{ id, title }`，还可提供 `description`、ISO 8601 格式的 `dueAt`、`done` 和 `priority`。组件只展示当前状态；任务完成、通知提醒和数据写回由宿主负责。

## Core 辅助函数

```ts
import { courseCarryItems, normalizeCourseMaterials } from '@iyotsuba/schedule-core'

const materials = normalizeCourseMaterials(enrichedCourse)
const carryList = courseCarryItems(enrichedCourse)
```

`courseCarryItems()` 会合并教材与携带物，按名称去重，并保留结构化信息。Today 的课前准备模块使用同一套规则生成清单。

## Flutter 对应

Flutter 使用 `YsCourse`、`YsCourseBook`、`YsCourseMaterial` 和 `YsCourseTask`，字段语义与 Web 版本一致。完整示例见 [Flutter 接入](/frameworks/flutter#课程数据与今日联动)。
