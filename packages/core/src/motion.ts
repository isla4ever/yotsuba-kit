import type { TransitionCell, TransitionContext, TransitionSpec } from './types'

/**
 * 波浪覆盖（招牌预设）：
 * 骨架常驻、旧周垫底、新卡按“列为主、节次为辅”的对角线次序覆盖；
 * 换周前后视觉不变的格子完全静止。任何一帧都不出现空网格。
 */
export const waveTransition: TransitionSpec = {
  name: 'wave',
  mode: 'per-cell',
  totalMs: 500,
  enterMs: 260,
  leaveMs: 200,
  leaveLagMs: 60,
  stableSkip: true,
  delayFor(cell: TransitionCell, ctx: TransitionContext): number {
    const columnOrder = ctx.direction === 1
      ? ctx.columns - cell.weekday
      : cell.weekday - 1
    const delay = Math.max(0, columnOrder) * 30
      + Math.max(0, cell.startSection - 1) * 7
    return Math.min(delay, 210)
  },
  enter: { opacity: 0, translateY: 4, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
  leave: { opacity: 0, easing: 'cubic-bezier(0.4, 0, 0.6, 1)' },
}

/** 方向性滑动交叉：整层轻位移 + 淡入淡出，经典手感 */
export const slideTransition: TransitionSpec = {
  name: 'slide',
  mode: 'layer',
  totalMs: 320,
  enterMs: 300,
  leaveMs: 220,
  leaveLagMs: 0,
  stableSkip: false,
  delayFor: () => 0,
  enter: { opacity: 0, translateX: 24, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
  leave: { opacity: 0, translateX: -16, easing: 'cubic-bezier(0.4, 0, 0.6, 1)' },
}

/** 全局交叉淡入淡出：无位移，最克制 */
export const fadeTransition: TransitionSpec = {
  name: 'fade',
  mode: 'layer',
  totalMs: 220,
  enterMs: 200,
  leaveMs: 160,
  leaveLagMs: 0,
  stableSkip: false,
  delayFor: () => 0,
  enter: { opacity: 0, easing: 'linear' },
  leave: { opacity: 0, easing: 'linear' },
}

/** 直切（无障碍 / 截图场景） */
export const noneTransition: TransitionSpec = {
  name: 'none',
  mode: 'layer',
  totalMs: 0,
  enterMs: 0,
  leaveMs: 0,
  leaveLagMs: 0,
  stableSkip: false,
  delayFor: () => 0,
  enter: { opacity: 1, easing: 'linear' },
  leave: { opacity: 0, easing: 'linear' },
}

export const builtinTransitions = {
  wave: waveTransition,
  slide: slideTransition,
  fade: fadeTransition,
  none: noneTransition,
} as const

export type BuiltinTransitionName = keyof typeof builtinTransitions

export function resolveTransition(
  value: BuiltinTransitionName | TransitionSpec | undefined,
): TransitionSpec {
  if (!value) {
    return waveTransition
  }
  if (typeof value === 'string') {
    return builtinTransitions[value] ?? waveTransition
  }
  return value
}

/** 自定义 TransitionSpec 校验：返回警告列表（空数组 = 通过） */
export function validateTransition(spec: TransitionSpec, ctx: TransitionContext = { direction: 1, columns: 7 }): string[] {
  const warnings: string[] = []
  if (spec.totalMs > 800) {
    warnings.push(`totalMs ${spec.totalMs}ms 过长，换周会显得迟钝（建议 ≤ 800ms）`)
  }
  if (spec.enterMs + maxDelay(spec, ctx) > spec.totalMs) {
    warnings.push('最后一格的进场（maxDelay + enterMs）超出 totalMs，动画会被截断')
  }
  if (spec.leaveLagMs + spec.leaveMs + maxDelay(spec, ctx) > spec.totalMs) {
    warnings.push('最后一格的离场超出 totalMs，旧内容会被硬切移除')
  }
  if (spec.mode === 'per-cell' && !spec.stableSkip) {
    warnings.push('per-cell 模式建议 stableSkip: true，否则未变化的格子会重复脉冲')
  }
  return warnings
}

function maxDelay(spec: TransitionSpec, ctx: TransitionContext): number {
  let max = 0
  for (let weekday = 1; weekday <= ctx.columns; weekday++) {
    for (const startSection of [1, 12]) {
      max = Math.max(max, spec.delayFor({ weekday, startSection }, ctx))
    }
  }
  return max
}
