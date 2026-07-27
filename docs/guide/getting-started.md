# 快速开始

## 安装

当前 NPM 稳定版为 `0.5.0`。`0.6.0` API 正在 current main 和官网演示中验证，发布前请不要按主分支文档直接假设注册表已可安装；详见 [版本与发布状态](/guide/release-status)。

::: code-group

```bash [Vue 3]
pnpm add @iyotsuba/schedule-vue@0.5.0
```

```bash [其他框架（Web Component）]
pnpm add @iyotsuba/schedule-elements@0.5.0
```

:::

## 最小示例（Vue 3）

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
    location: '教1-201',
    weekday: 1,
    startSection: 1,
    endSection: 2,
    startWeek: 1,
    endWeek: 20,
  },
  {
    id: 'pe',
    name: '体育（单周）',
    weekday: 4,
    startSection: 3,
    endSection: 4,
    startWeek: 1,
    endWeek: 16,
    parity: 'odd',
  },
]
</script>

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

左右滑动即可换周（波浪覆盖动画）；`v-model:week` 受控，任何外部 UI（周选择器、按钮）改这个值都会触发同一套过渡。进一步的课程详情、Today、教材任务、天气和弹层编排见[组件](/components/schedule)与[API](/api/core)。

## Web Component（任意框架 / 原生 HTML）

```html
<script type="module">
  import '@iyotsuba/schedule-elements'
  const el = document.querySelector('ys-schedule')
  el.courses = [/* Course[] */]
  el.week = 1
</script>

<ys-schedule style="height: 640px"></ys-schedule>
```
