# 事件

所有事件都只报告意图与受控数据。接口不会替宿主写 store、访问网络或发起系统能力。

## YsSchedule

| 事件 | 参数 | 场景 |
| --- | --- | --- |
| `update:week` | `(week)` | `v-model:week` 回写 |
| `week-change` | `(week, previous)` | 周次改变 |
| `course-tap` | `(course, stack)` | 点击课程；`stack` 是同格重叠课程 |
| `day-tap` | `(weekday, date)` | 点击日期表头 |
| `swipe` | `(direction)` | 手势翻周，`1` 为下一周 |
| `week-picker-open` | — | 请求打开周选择器 |
| `transition-start` / `transition-end` | `(spec)` | 换周过渡生命周期 |
| `guide-step` / `guide-finish` | `(step, index)` / — | 引导进度 |
| `course-add` | `(course)` | 内置编辑表单新增 |
| `course-update` | `(course, previousId)` | 内置编辑表单更新 |
| `course-remove` | `(course)` | 内置详情删除确认后 |
| `cell-select` | `(weekday, startSection, endSection)` | 编辑模式选中空白节次 |
| `course-form-request` | `(prefill)` | 请求宿主打开课程表单 |
| `plan-add` / `plan-toggle` / `plan-remove` | 计划相关参数 | 日计划受控数据变更 |
| `background-change` | `(dataUrl \| null)` | 背景选择器输出 |
| `course-share` | `(course)` | 详情请求宿主分享 |
| `detail-layout-change` | `(layout)` | 用户在详情中切换信息密度 |

Vue 使用 kebab-case 模板事件；React 使用对应的 `onWeekChange`、`onCourseTap`、`onCourseAdd` 等 camelCase Props，完整映射见 [React 与 Elements](/frameworks/react-elements)。

## YsToday

| 事件 | 参数 | 场景 |
| --- | --- | --- |
| `course-tap` | `(course)` | 点击下一节课或时间线课程 |
| `widget-tap` | `(id)` | 点击普通 widget 区域 |
| `update:widgets` | `(widgets)` | `v-model:widgets` 回写 |
| `layout-change` | `(widgets)` | 拖动、缩放、显隐后的完整布局 |
| `layout-editing` | `(editing)` | 进入或退出布局编辑 |
| `widget-move` | `(id, from, to)` | 整卡排序完成 |
| `widget-resize` | `(id, size, corner)` | 四角缩放完成 |

Flutter 对应回调为 `onWeekChanged`、`onCourseTap`、`onWidgetsChanged`、`onWidgetMove` 和 `onWidgetResize`，详见 [Flutter 接入](/frameworks/flutter)。
