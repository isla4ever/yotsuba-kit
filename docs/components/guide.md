# Guide 新手引导

Guide 用于解释首次使用流程，也可以独立接入非课表页面。引导状态由 Core 的 `GuideMachine` 管理；组件负责定位目标、展示步骤和报告进度，是否自动启动及完成状态如何保存由宿主决定。

## 模式选择

| 模式 | 交互方式 | 建议场景 |
| --- | --- | --- |
| `tips` | 无遮罩的非阻塞提示 | 介绍新增功能或次要入口 |
| `spotlight` | 聚焦目标，并提供上一步、下一步和跳过 | 常规首次使用引导 |
| `walkthrough` | 完成点击、滑动等指定操作后才进入下一步 | 需要用户实际练习的关键流程 |

优先选择限制较少的模式。只有在操作本身难以通过说明理解时，才使用 `walkthrough` 阻塞流程。

## 基础用法 {#用法}

```vue
<script setup lang="ts">
import { defaultScheduleGuideSteps, YsSchedule } from '@iyotsuba/schedule-vue'
import { ref } from 'vue'

const schedule = ref()
</script>

<template>
  <YsSchedule
    ref="schedule"
    :courses="courses"
    :guide="{
      mode: 'walkthrough',
      steps: defaultScheduleGuideSteps,
      storageKey: 'schedule-guide-done', // 自动展示一次后记录完成状态
    }"
    @guide-step="(step, i) => console.log('step', i, step.id)"
    @guide-finish="() => console.log('done')"
  />
  <button type="button" @click="schedule?.startGuide()">重新查看引导</button>
</template>
```

## 自定义剧本

`steps` 用于定义步骤顺序、目标和预期操作。`target` 支持两种写法：

- 语义锚点：组件内置 `grid`、`top-bar-week`、`weekday-bar` 和 `course-card`。
- CSS 选择器：定位宿主页面中的元素，例如自定义工具按钮。

```ts
const steps: GuideStep[] = [
  {
    id: 'my-dock',
    target: '.my-dock-button', // 宿主元素
    title: '打开工具',
    body: '这里可以导入课表和切换设置。',
    expect: 'tap',
    hintAfterMs: 3000,
  },
]
```

`expect` 支持 `tap`、`swipe-left`、`swipe-right` 和 `longpress`。该字段只在 `walkthrough` 模式生效；其余模式由用户通过按钮切换步骤。

## 事件与方法 {#events-methods}

| 类型 | 名称 | 说明 |
| --- | --- | --- |
| 事件 | `guide-step(step, index)` | 当前步骤发生变化 |
| 事件 | `guide-finish` | 用户完成或结束引导 |
| 方法 | `startGuide()` | 从第一步启动已配置的引导 |

`YsGuide` 也可作为独立组件使用，通过 `config`、`root` 和 `start()` 为其他页面提供相同的引导能力。
