# Guide 引导

内置三档引导模式,由 core 的 `GuideMachine` 状态机驱动,通过 `guide` prop 配置、`startGuide()` 触发:

| 模式 | 交互 | 适用 |
| --- | --- | --- |
| `tips` | 非阻塞小气泡逐条讲解,无遮罩 | 轻提示 |
| `spotlight` | 遮罩挖孔高亮 + 讲解卡(上一步/下一步/跳过) | 常规首次引导 |
| `walkthrough` | **手把手**:每步要求用户真实完成动作(点击高亮区 / 滑动课表)才前进;超时播放脉冲 + 手势暗示动画 | 最强的上手教学 |

## 用法

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
      storageKey: 'schedule-guide-done', // 只自动展示一次
    }"
    @guide-step="(step, i) => console.log('step', i, step.id)"
    @guide-finish="() => console.log('done')"
  />
  <button @click="schedule.startGuide()">重播引导</button>
</template>
```

## 自定义剧本

`steps` 完全可自定义。`target` 支持两种写法:

- **语义锚点**:组件内置 `grid` / `top-bar-week` / `weekday-bar` / `course-card`;
- **任意 CSS 选择器**:高亮宿主页面的任何元素(如你自己的 dock 按钮)。

```ts
const steps: GuideStep[] = [
  {
    id: 'my-dock',
    target: '.my-dock-button', // 宿主元素
    title: '打开工具',
    body: '这里可以导入课表和切换设置。',
    expect: 'tap',       // walkthrough 模式下要求真实点击
    hintAfterMs: 3000,   // 3 秒未操作播放脉冲提示
  },
]
```

`expect` 支持 `tap` / `swipe-left` / `swipe-right` / `longpress`;`tips` 与 `spotlight` 模式忽略 `expect`,按钮前进。

## Events / Methods

- 事件:`guide-step (step, index)`、`guide-finish`
- 方法:`startGuide()`;`YsGuide` 组件也可独立使用(`config` + `root` + `start()`),给非课表页面做引导。
