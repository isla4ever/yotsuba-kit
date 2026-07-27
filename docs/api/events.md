# 事件

组件通过事件报告用户操作和受控数据变化。监听事件后，由宿主更新状态、访问网络或调用系统能力；组件不会直接修改外部数据源。

## YsSchedule

| 事件 | 参数 | 场景 |
| --- | --- | --- |
| `update:week` | `(week)` | `v-model:week` 回写 |
| `week-change` | `(week, previous)` | 周次改变 |
| `course-tap` | `(course, stack)` | 点击课程；`stack` 包含同一位置的重叠课程 |
| `day-tap` | `(weekday, date)` | 点击日期表头 |
| `swipe` | `(direction)` | 手势翻周；`1` 表示下一周，`-1` 表示上一周 |
| `week-picker-open` | — | 请求打开周选择器 |
| `transition-start` / `transition-end` | `(spec)` | 换周过渡生命周期 |
| `guide-step` / `guide-finish` | `(step, index)` / — | 引导进度 |
| `course-add` | `(course)` | 内置编辑表单新增 |
| `course-update` | `(course, previousId)` | 内置编辑表单更新 |
| `course-remove` | `(course)` | 用户在内置详情中确认删除 |
| `cell-select` | `(weekday, startSection, endSection)` | 编辑模式选中空白节次 |
| `course-form-request` | `(prefill)` | 请求宿主打开课程表单 |
| `plan-add` / `plan-toggle` / `plan-remove` | 计划相关参数 | 日计划受控数据变更 |
| `background-change` | `(dataUrl \| null)` | 背景选择器输出 |
| `course-share` | `(course)` | 详情请求宿主分享 |
| `detail-layout-change` | `(layout)` | 用户在详情中切换信息密度 |

Vue 模板使用 kebab-case 事件名；React 使用对应的 `onWeekChange`、`onCourseTap`、`onCourseAdd` 等 camelCase Props。完整映射见 [React 与 Custom Elements](/frameworks/react-elements)。

## YsToday

| 事件 | 参数 | 场景 |
| --- | --- | --- |
| `course-tap` | `(course)` | 点击下一节课或时间线课程 |
| `widget-tap` | `(id)` | 点击普通模块区域 |
| `update:widgets` | `(widgets)` | `v-model:widgets` 回写 |
| `layout-change` | `(widgets)` | 拖动、缩放、显隐后的完整布局 |
| `layout-editing` | `(editing)` | 进入或退出布局编辑 |
| `widget-move` | `(id, from, to)` | 模块排序完成 |
| `widget-resize` | `(id, size, corner)` | 四角缩放完成 |

Flutter 使用 `onWeekChanged`、`onCourseTap`、`onWidgetsChanged`、`onWidgetMove` 和 `onWidgetResize` 等回调，详见 [Flutter 接入](/frameworks/flutter)。
