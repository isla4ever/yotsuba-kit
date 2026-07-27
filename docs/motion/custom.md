# 自定义 TransitionSpec

当内置预设无法满足产品节奏时，可以向 `transition` Prop 传入完整的 `TransitionSpec`。协议只描述过渡行为，不改变课表数据或组件结构。

```ts
import type { TransitionSpec } from '@iyotsuba/schedule-vue'

const diagonalDrop: TransitionSpec = {
  name: 'diagonal-drop',
  mode: 'per-cell',
  totalMs: 600,
  enterMs: 300,
  leaveMs: 200,
  leaveLagMs: 80,
  stableSkip: true,
  delayFor: ({ weekday, startSection }, { columns }) =>
    Math.min((weekday - 1) * 24 + (startSection - 1) * 12, 260),
  enter: { opacity: 0, translateY: -8, easing: 'cubic-bezier(0.34, 1.2, 0.44, 1)' },
  leave: { opacity: 0, easing: 'ease-in' },
}
```

## 接入前校验

发布前使用 `validateTransition` 检查配置。时长过长、时间轴溢出，或 `per-cell` 模式未启用 `stableSkip` 时，校验器会返回警告。

```ts
import { validateTransition } from '@iyotsuba/schedule-core'

console.warn(validateTransition(diagonalDrop))
```

## 约束

- 仅使用 `opacity` 和 `transform`，避免在动画期间触发布局计算。
- `mode: 'per-cell'` 时，`delayFor` 会收到方向与列数；延迟顺序应跟随 `direction`。
- 系统启用减少动态效果时，组件会自动改为直切，自定义配置无需重复处理。
