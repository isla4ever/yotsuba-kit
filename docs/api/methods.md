# 方法

Vue 通过 template ref 调用方法；React 与原生 Custom Element 通过元素 ref 调用同名方法。方法只操作当前组件 UI，不会改变宿主持久化数据。

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
| `getWeek()` | 读取当前周 |
| `next()` / `previous()` | 前后翻周 |
| `openCourse(id)` | 打开指定课程的内置详情 |
| `openWeekPicker()` | 打开内置周选择器或发出接管事件 |
| `openCourseForm(prefill?)` | 打开内置课程表单 |
| `openDayPlanner(date?)` | 打开指定日期的计划面板 |
| `openBackgroundPicker()` | 打开背景上传与裁剪面板 |
| `closeSheets()` | 关闭全部内置弹层 |
| `startGuide()` | 启动配置好的引导 |

## YsToday

| 方法 | 说明 |
| --- | --- |
| `setWidgets(widgets)` | 设置并回传完整布局 |
| `setArranging(value, widgetId?)` | 进入或退出布局编辑，可选中指定卡片 |
| `moveWidget(id, offset)` | 将卡片前移或后移一位，`offset` 为 `-1` 或 `1` |
| `resizeWidget(id)` | 轮换卡片尺寸 |
| `toggleWidget(id, enabled)` | 显示或隐藏卡片 |
| `layoutReset()` | 恢复初始 widgets 布局 |

方法用于显式的界面命令。对于业务数据更新，请始终修改 `courses`、`widgets`、`dayPlans` 等受控输入。
