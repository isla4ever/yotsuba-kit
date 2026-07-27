# Course、教材、携带物与任务

`Course` 是 Web 组件、Core API 和 Flutter `YsCourse` 对齐的业务模型。时间、周次和单双周是排课事实；教材、携带物、任务和备注是可选的课程上下文。组件会展示和汇总它们，但不会替宿主保存或同步。

```ts
import type { Course } from '@iyotsuba/schedule-core'

const course: Course = {
  id: 'math-01',
  name: '高等数学',
  teacher: '陈老师',
  location: '教一 201',
  weekday: 1,
  startSection: 1,
  endSection: 2,
  startWeek: 1,
  endWeek: 20,
  parity: 'every',
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
| `id` | `string` | 是 | 稳定唯一 id；跨节次拆分应使用不同 id |
| `name` | `string` | 是 | 课程名 |
| `weekday` | `1..7` | 是 | 周一为 `1`，周日为 `7` |
| `startSection` / `endSection` | `number` | 是 | 节次范围，包含首尾 |
| `startWeek` / `endWeek` | `number` | 是 | 生效周次范围 |
| `parity` | `'every' \| 'odd' \| 'even'` | 否 | 不传等价于 `every` |
| `teacher` / `location` | `string` | 否 | 详情和 rich 密度展示 |
| `color` | CSS color | 否 | 不传时按课程名使用主题配色稳定分配 |
| `custom` | `boolean` | 否 | 宿主自定义课程标记 |
| `books` | `CourseBook[]` | 否 | 教材；会进入 Today 的课前携带清单 |
| `materials` | `(string \| CourseMaterial)[]` | 否 | 兼容旧版字符串，支持结构化物品 |
| `tasks` | `CourseTask[]` | 否 | 显示在课程详情和 Today 任务模块 |
| `note` | `string` | 否 | 课程备注 |
| `meta` | `Record<string, unknown>` | 否 | 组件不解释、原样透传的宿主数据 |

## 结构化资料

`CourseMaterial` 的 `kind` 为 `book / device / equipment / document / other`；可附加 `required`、`quantity` 与 `note`。`CourseBook` 额外支持 `author`、`isbn`。旧版 `materials: string[]` 仍然可用，迁移无需一次完成。

`CourseTask` 的最小字段是 `{ id, title }`；可选 `description`、ISO 8601 `dueAt`、`done` 与 `priority: low | normal | high`。任务完成状态和真实提醒由宿主写回数据源。

## Core 辅助函数

```ts
import { courseCarryItems, normalizeCourseMaterials } from '@iyotsuba/schedule-core'

const materials = normalizeCourseMaterials(course)
const carryList = courseCarryItems(course)
```

`courseCarryItems()` 会合并教材与携带物，按名称去重，并保留结构化信息；Today 的 readiness 模块按同一规则生成清单。

## Flutter 对应

Flutter 使用 `YsCourse`、`YsCourseBook`、`YsCourseMaterial` 和 `YsCourseTask`，字段语义与 Web 相同。完整示例见 [Flutter 接入](/frameworks/flutter#课程数据与今日联动)。
