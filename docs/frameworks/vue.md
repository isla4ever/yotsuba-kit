# Vue 3

使用 `@iyotsuba/schedule-vue` 在 Vue 3 项目中接入完整课表和 Today 今日视图。该包提供类型化 Props、`v-model`、事件、插槽和模板引用方法，适合需要由 Vue 状态统一管理课程与布局的项目。

## 安装

```bash
pnpm add @iyotsuba/schedule-vue@0.5.0
```

::: info 版本说明
NPM 当前稳定版为 `0.5.0`。官网同时展示 `0.6.0` 候选 API，生产项目升级前请查看[版本状态](/guide/release-status)。
:::

## 最小受控接入

```vue
<script setup lang="ts">
import { YsSchedule, YsToday, type Course, type TodayWidgetConfig } from '@iyotsuba/schedule-vue'
import { ref } from 'vue'

const week = ref(1)
const termStart = new Date(2026, 8, 7)
const courses = ref<Course[]>([])
const widgets = ref<TodayWidgetConfig[]>([
  { id: 'next-course', size: '2x1' },
  { id: 'course-tasks', size: '2x1' },
])
</script>

<template>
  <YsSchedule
    v-model:week="week"
    :courses="courses"
    :term-start="termStart"
    @course-update="(course, previousId) => replaceCourse(course, previousId)"
  />
  <YsToday v-model:widgets="widgets" :courses="courses" :term-start="termStart" />
</template>
```

课表与 Today 直接使用同一份课程状态即可联动。编辑课程、完成任务和保存布局等业务操作应在事件处理函数中写回你的状态或服务端。

## 样式与主题

组件将主题令牌映射为 `--ys-*` CSS 变量。优先通过 `theme` 传入 `Partial<ThemeTokens>`，或在宿主容器上覆盖变量。不要依赖内部 DOM 结构编写深层选择器。

```vue
<YsSchedule
  :theme="{ accent: '#176b87', surface1: '#ffffff' }"
  :palette="['#176b87', '#4b7892', '#c86b54']"
/>
```

## 下一步

| 目标 | 文档 |
| --- | --- |
| 完整配置课表与详情 | [Schedule 课表组件](/components/schedule) |
| 组织今日课程、任务和自定义模块 | [Today 今日视图](/components/today) |
| 接收用户操作并写回状态 | [事件](/api/events) |
| 替换结构或打开内置面板 | [插槽](/api/slots)与[方法](/api/methods) |
