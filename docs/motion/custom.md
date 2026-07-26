# 自定义 TransitionSpec

`transition` prop 接受完整的 `TransitionSpec` 对象:

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

## 校验器

发布前用 `validateTransition` 自检(超长时长、时间轴溢出、per-cell 未开 stableSkip 都会给出警告):

```ts
import { validateTransition } from '@iyotsuba/schedule-core'

console.warn(validateTransition(diagonalDrop))
```

## 约束

- 只允许 `opacity` / `transform`(合成器友好,保证 60fps);
- `mode: 'per-cell'` 下 `delayFor` 会收到方向与列数,请让波浪方向跟随 `direction`;
- `reduceMotion` 生效时组件自动直切,你的 spec 无需处理。
