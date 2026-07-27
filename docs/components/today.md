# Today 今日指挥台

`<YsToday>` 是由 widget 注册表驱动的移动端日程界面。它与 `<YsSchedule>` 共用课程、学期、天气和日计划数据；长按卡片或点击 Header 入口进入排版，整卡可拖动让位。点按某张卡片后，仅该卡片显示贴边的四角控点并可连续缩放。

```vue
<YsToday
  v-model:widgets="widgets"
  :courses="courses"
  :term-start="termStart"
  :weather="weatherSnapshot"
  :day-plans="dayPlans"
  empty-text="暂无信息"
  arrangeable
  @course-tap="openCourse"
/>
```

## 内置 widget

| id | 内容 | 常用尺寸 |
| --- | --- | --- |
| `next-course` | 正在上课或下一节课、倒计时、地点 | `2x1` |
| `today-timeline` | 今日课程时间线与状态 | `2x1` |
| `readiness` | 下一节课教材和携带物清单 | `2x1` |
| `course-tasks` | 课程任务与未完成状态 | `2x1` |
| `plans` | 今日计划，复用 `dayPlans` | `2x1` |
| `week-glance` | 当前周、今日课程和完成摘要 | `1x1` |
| `weather` | 当前天气和温区 | `1x1` |

`size` 支持旧别名 `compact / standard / large`，也支持明确网格尺寸 `1x1 / 1x2 / 2x1 / 2x2`。

尺寸不是单纯拉伸外框。内置「本周一览」会按空间逐级披露内容，自定义 widget 也可通过插槽作用域实现同样的响应式内容：

| 尺寸 | 推荐内容层级 | 内置示例 |
| --- | --- | --- |
| `1x1` | 一个核心数字和短标签 | 当前周、今日课程摘要 |
| `1x2` | 核心数字加纵向列表或窄图表 | 周节奏与七日分布 |
| `2x1` | 横向摘要加紧凑趋势 | 三项指标与迷你柱状图 |
| `2x2` | 完整指标、图表和补充结论 | 七日课程柱状图与周总结 |

拖动跨过网格尺寸阈值时，卡片尺寸、周围卡片让位和内容层级会一起过渡；`reduceMotion` 或系统减少动态效果开启时自动退化为即时切换。

## 配置与布局

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `widgets` | `TodayWidgetConfig[]` | 七个内置模块 | 顺序就是显示顺序，`enabled: false` 隐藏 |
| `courses` / `termStart` / `overrides` / `courseTimes` / `totalWeeks` | 与 Schedule 相同 | — | 传入同一份数据即可联动 |
| `dayPlans` | `DayPlanMap` | `{}` | 驱动 plans 模块 |
| `weather` / `weatherScene` | `WeatherSnapshot \| null` / `boolean` | `null` / `true` | 天气模块和背景场景 |
| `theme` | 与 Schedule 相同 | `'light'` | 可复用主题令牌 |
| `now` | `Date` | 当前时间 | 演示与测试可注入固定时间 |
| `title` | `string` | `'今日'` | 标题 |
| `arrangeable` | `boolean` | `true` | 是否显示布局编辑入口并接受长按 |
| `reduceMotion` | `boolean` | `false` | 减少拖动、背景和过渡动画 |
| `emptyText` | `string` | 内置文案 | 统一空状态文案 |
| `emptyTexts` | `Record<string, string>` | `{}` | 按 widget id 覆盖空状态 |

拖动和缩放始终通过 `update:widgets` / `layout-change` 回传；不要让组件在内部持久化布局。

## 自定义 widget

把任意 id 写进 `widgets`，再提供 `#widget-<id>`。内置 id 使用同名插槽时会被整体替换：

```vue
<YsToday :widgets="[{ id: 'focus' }, { id: 'next-course' }]" :courses="courses" :term-start="termStart">
  <template #widget-focus="{ todayCourses, weather, layout, resizing }">
    <h3>专注计划</h3>
    <p>{{ todayCourses.length }} 节课 · {{ weather?.current?.label ?? '暂无信息' }}</p>
    <FocusBars v-if="layout.columns === 2" :compact="layout.rows === 1" />
    <FocusList v-else-if="layout.rows === 2" />
    <strong v-else>126 分钟</strong>
    <small v-if="resizing">正在调整内容层级</small>
  </template>
</YsToday>
```

插槽作用域还包括 `week`、`ongoing`、`upcoming`、`readiness`、`courseTasks`、当前 `size`、`layout: { columns, rows }` 与 `resizing`。完整作用域见 [插槽](/api/slots)。

## 受控布局示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { TodayWidgetConfig } from '@iyotsuba/schedule-vue'

const widgets = ref<TodayWidgetConfig[]>([
  { id: 'next-course', size: '2x1' },
  { id: 'weather', size: '1x1' },
  { id: 'course-tasks', size: '2x1' },
])
</script>

<template>
  <YsToday v-model:widgets="widgets" :courses="courses" :term-start="termStart" />
</template>
```

布局事件、方法和自定义 slot 分别见 [事件](/api/events#ystoday)、[方法](/api/methods#ystoday) 和 [插槽](/api/slots#ystoday)。
