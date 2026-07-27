# Vue 3

Vue 包提供完整 `<YsSchedule>` 与 `<YsToday>`，包含所有 Slots、受控事件和 template ref 方法。

## 安装

```bash
pnpm add @iyotsuba/schedule-vue@0.5.0
```

当前 main 的 `0.6.0` API 尚未发布到注册表。请先阅读 [版本与发布状态](/guide/release-status)，避免把 main 文档与已发布包混用。

## 受控课表

```vue
<script setup lang="ts">
import { YsSchedule, YsToday, type Course, type TodayWidgetConfig } from '@iyotsuba/schedule-vue'
import { ref } from 'vue'

const week = ref(1)
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

课程与 Today 使用同一份响应式引用即可联动。不要在组件内部复制数据；编辑、计划、任务完成等业务副作用应写在事件处理函数中。

## 样式与主题

组件将令牌应用为 `--ys-*` CSS 变量。优先通过 `theme` 传 `Partial<ThemeTokens>` 或在宿主容器上覆盖变量；避免使用深层选择器破坏内部交互。

```vue
<YsSchedule
  :theme="{ accent: '#176b87', surface1: '#ffffff' }"
  :palette="['#176b87', '#4b7892', '#c86b54']"
/>
```

需要替换结构时使用 [插槽](/api/slots)，需要命令式打开某个面板时使用 [方法](/api/methods)。
