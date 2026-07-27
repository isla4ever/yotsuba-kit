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

/**
 * 真实整页滑动（复刻 Flutter PageView 手感）：
 * 整页按方向滑出/滑入（translateX 100%），进场卡片叠加轻量逐列淡入。
 */
export const slideTransition: TransitionSpec = {
  name: 'slide',
  mode: 'page',
  totalMs: 380,
  enterMs: 340,
  leaveMs: 340,
  leaveLagMs: 0,
  stableSkip: false,
  delayFor: () => 0,
  enter: { opacity: 1, translateX: 100, easing: 'cubic-bezier(0.25, 0.72, 0.2, 1)' },
  leave: { opacity: 1, translateX: -100, easing: 'cubic-bezier(0.25, 0.72, 0.2, 1)' },
  cellStagger: { fromOpacity: 0.3, stepMs: 16, durationMs: 260, easing: 'ease-out' },
}

/** 纯淡入淡出：旧周始终保留到离场完成，适合低干扰切换。 */
export const fadeTransition: TransitionSpec = {
  name: 'fade',
  mode: 'layer',
  totalMs: 320,
  enterMs: 300,
  leaveMs: 280,
  leaveLagMs: 0,
  stableSkip: false,
  delayFor: () => 0,
  enter: { opacity: 0, easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)' },
  leave: { opacity: 0, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
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

/**
 * 3D 立方体翻页（旗舰预设）：整页作为立方体的一个面翻走,新周作为相邻面翻入。
 * 几何要求：两面同时长同缓动、leaveLagMs=0,perspective 静态挂在共同父容器,
 * 铰链(各自 transform-origin)在数学上严格重合。
 */
export const cubeTransition: TransitionSpec = {
  name: 'cube',
  mode: 'page',
  totalMs: 620,
  enterMs: 580,
  leaveMs: 580,
  leaveLagMs: 0,
  stableSkip: false,
  perspectivePx: 1200,
  delayFor: () => 0,
  enter: {
    opacity: 0.18,
    translateX: 100,
    rotateY: 90,
    transformOrigin: 'left center',
    directional: ['translateX', 'rotateY', 'transformOrigin'],
    easing: 'cubic-bezier(0.22, 0.68, 0.24, 1)',
  },
  leave: {
    opacity: 0.02,
    translateX: -100,
    rotateY: -90,
    transformOrigin: 'right center',
    directional: ['translateX', 'rotateY', 'transformOrigin'],
    easing: 'cubic-bezier(0.32, 0, 0.28, 1)',
  },
}

/**
 * 深度缩放交叠（Shared-Axis Z）：下一周从"更深处"浮上来,旧周冲向镜头淡出;
 * 上一周反之。Z 轴纵深语言,四预设中最轻(两层 scale+opacity)。
 */
export const zoomTransition: TransitionSpec = {
  name: 'zoom',
  mode: 'layer',
  totalMs: 520,
  enterMs: 500,
  leaveMs: 480,
  leaveLagMs: 0,
  stableSkip: false,
  delayFor: () => 0,
  enter: {
    opacity: 0.08,
    scale: 0.94,
    transformOrigin: '50% 40%',
    directional: ['scale'],
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
  leave: {
    opacity: 0,
    scale: 1.04,
    transformOrigin: '50% 40%',
    directional: ['scale'],
    easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
  },
}

/**
 * 逐格重力坠落 + 回弹：新周课程像雨点坠入各自格位(easeOutBack 微回弹),
 * 确定性哈希抖动打破机械感;stableSkip 让动画只发生在"变化的课"上,兼作换周 diff 高亮。
 */
export const dropTransition: TransitionSpec = {
  name: 'drop',
  mode: 'per-cell',
  totalMs: 640,
  enterMs: 360,
  leaveMs: 160,
  leaveLagMs: 80,
  stableSkip: true,
  delayFor(cell: TransitionCell, ctx: TransitionContext): number {
    const column = ctx.direction === 1 ? cell.weekday - 1 : ctx.columns - cell.weekday
    const row = cell.startSection - 1
    const jitter = ((cell.weekday * 7 + cell.startSection * 13) % 4) * 8
    return Math.min(row * 16 + Math.max(0, column) * 12 + jitter, 280)
  },
  enter: {
    opacity: 0,
    translateY: -24,
    directional: ['translateY'],
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  leave: {
    opacity: 0,
    translateY: 10,
    directional: ['translateY'],
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
  },
}

export const builtinTransitions = {
  wave: waveTransition,
  slide: slideTransition,
  fade: fadeTransition,
  cube: cubeTransition,
  zoom: zoomTransition,
  drop: dropTransition,
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
  if (spec.cellStagger) {
    const staggerEnd = spec.cellStagger.stepMs * (ctx.columns - 1) + spec.cellStagger.durationMs
    if (staggerEnd > spec.totalMs) {
      warnings.push('cellStagger 最后一列的淡入超出 totalMs，会被硬切')
    }
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
