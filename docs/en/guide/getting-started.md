# Getting Started

## Install

::: code-group

```bash [Vue 3]
pnpm add @iyotsuba/schedule-vue
```

```bash [React]
pnpm add @iyotsuba/schedule-react
```

```bash [Web Component]
pnpm add @iyotsuba/schedule-elements
```

:::

## Minimal example (Vue 3)

```vue
<script setup lang="ts">
import type { Course } from '@iyotsuba/schedule-vue'
import { YsSchedule } from '@iyotsuba/schedule-vue'
import { ref } from 'vue'

const week = ref(1)
const courses: Course[] = [
  {
    id: 'math',
    name: 'Calculus',
    location: 'Bldg 1-201',
    weekday: 1,
    startSection: 1,
    endSection: 2,
    startWeek: 1,
    endWeek: 20,
  },
  {
    id: 'pe',
    name: 'PE (odd weeks)',
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

Swipe horizontally to change weeks (wave-cover transition). `v-model:week` is fully controlled — any external UI that changes the value triggers the same transition.

## React

```tsx
import { YsSchedule } from '@iyotsuba/schedule-react'
import { useState } from 'react'

export function Schedule({ courses }) {
  const [week, setWeek] = useState(1)
  return (
    <YsSchedule
      courses={courses}
      week={week}
      onUpdateWeek={setWeek}
      style={{ height: 640 }}
    />
  )
}
```

## Plain HTML / any framework

```html
<script type="module">
  import '@iyotsuba/schedule-elements'
  const el = document.querySelector('ys-schedule')
  el.courses = [/* Course[] */]
  el.week = 1
</script>

<ys-schedule style="height: 640px"></ys-schedule>
```
