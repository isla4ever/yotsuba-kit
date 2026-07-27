# 方法

方法用于执行跳转周次、打开详情或进入布局编辑等明确的界面命令。Vue 通过模板引用调用，React 与原生 Custom Element 通过元素引用调用同名方法。

::: tip 方法与数据更新
方法只操作当前组件。课程、任务和 Today 布局等业务数据仍应通过受控 Props 更新，并由宿主持久化。
:::

## YsSchedule

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { YsSchedule } from '@iyotsuba/schedule-vue'

const schedule = ref<InstanceType<typeof YsSchedule> | null>(null)
</script>

<template>
  <button @click="schedule?.openCourse('math-01')">查看课程</button>
  <YsSchedule ref="schedule" :courses="courses" :term-start="termStart" />
</template>
```

| 方法 | 说明 |
| --- | --- |
| `setWeek(week)` | 跳转到合法周次并触发受控 `update:week` |
| `getWeek()` | 读取组件当前显示的周次 |
| `next()` / `previous()` | 前后翻周 |
| `openCourse(id)` | 打开指定课程的内置详情 |
| `openWeekPicker()` | 打开内置周选择器；被宿主接管时发出对应事件 |
| `openCourseForm(prefill?)` | 打开内置课程表单 |
| `openDayPlanner(date?)` | 打开指定日期的计划面板 |
| `openBackgroundPicker()` | 打开背景上传与裁剪面板 |
| `closeSheets()` | 关闭全部内置弹层 |
| `startGuide()` | 启动配置好的引导 |

## YsToday

| 方法 | 说明 |
| --- | --- |
| `setWidgets(widgets)` | 设置并回传完整 Today 布局 |
| `setArranging(value, widgetId?)` | 进入或退出布局编辑，可选中指定卡片 |
| `moveWidget(id, offset)` | 将卡片前移或后移一位，`offset` 为 `-1` 或 `1` |
| `resizeWidget(id)` | 在支持的尺寸之间切换指定模块 |
| `toggleWidget(id, enabled)` | 显示或隐藏卡片 |
| `layoutReset()` | 恢复初始模块布局 |

完整的输入字段和变更事件分别见 [Today 今日视图](/components/today) 与 [事件](/api/events)。
