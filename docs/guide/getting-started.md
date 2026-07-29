# 5 分钟接入

本页使用 Vue 3 完成最小接入。你将安装稳定版、准备两门课程，并渲染一个支持触摸换周的课表。

如果项目使用 React、原生 HTML 或 Flutter，请先前往 [选择接入方式](/guide/frameworks)。

::: info 版本说明
本页与在线演示均对应 `0.7.1`。Web 四包需要保持同一 minor 版本，避免 Core 与框架适配层协议不一致。
:::

## 1. 安装

```bash
pnpm add @iyotsuba/schedule-vue@0.7.1
```

## 2. 准备课程数据

每门课程至少需要名称、星期、节次和生效周次。单双周课程通过 `parity` 声明。

```vue
<script setup lang="ts">
import type { Course } from '@iyotsuba/schedule-vue'
import { YsSchedule } from '@iyotsuba/schedule-vue'
import { ref } from 'vue'

const week = ref(1)
const courses: Course[] = [
  {
    id: 'math',
    name: '高等数学',
    location: '教一 201',
    weekday: 1,
    startSection: 1,
    endSection: 2,
    startWeek: 1,
    endWeek: 20,
  },
  {
    id: 'pe',
    name: '体育',
    weekday: 4,
    startSection: 3,
    endSection: 4,
    startWeek: 1,
    endWeek: 16,
    parity: 'odd',
  },
]
</script>
```

## 3. 渲染课表

`term-start` 表示第 1 周周一。`week` 是受控状态：用户滑动换周或外部修改周次时，组件都会通过 `v-model:week` 同步结果。

```vue
<template>
  <YsSchedule
    v-model:week="week"
    :courses="courses"
    :term-start="new Date(2026, 8, 7)"
    transition="wave"
    style="height: 640px"
  />
</template>
```

此时页面应显示两门课程。左右滑动或修改 `week`，课表会使用同一套换周过渡更新。

## 4. 选择下一步

| 接下来要做什么 | 阅读页面 |
| --- | --- |
| 添加详情、编辑、背景或天气 | [Schedule 课表组件](/components/schedule) |
| 展示今日课程、教材和任务 | [Today 今日视图](/components/today) |
| 定义教材、携带物和任务 | [课程数据模型](/components/course-data) |
| 接管业务操作 | [事件](/api/events)、[方法](/api/methods)与[插槽](/api/slots) |
| 切换框架或平台 | [选择接入方式](/guide/frameworks) |
