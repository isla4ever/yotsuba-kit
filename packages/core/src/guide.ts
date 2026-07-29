import type { GuideConfig, GuideStep } from './types'

export interface GuideState {
  active: boolean
  stepIndex: number
  step: GuideStep | null
  /** walkthrough：当前步骤等待用户真实动作 */
  awaitingAction: boolean
}

export interface GuideMachine {
  state: () => GuideState
  /** 默认尊重 storageKey；force 用于用户主动点击“再次查看”。 */
  start: (options?: { force?: boolean }) => void
  next: () => void
  previous: () => void
  skip: () => void
  /** walkthrough：适配层在用户完成 expect 动作后调用 */
  completeAction: (action: NonNullable<GuideStep['expect']>) => boolean
  subscribe: (listener: (state: GuideState) => void) => () => void
}

/**
 * 框架无关的引导状态机。
 * DOM 高亮、遮罩、手势暗示动画由适配层实现；这里只管步骤流转与动作校验。
 */
export function createGuideMachine(
  config: GuideConfig,
  options: { storage?: Pick<Storage, 'getItem' | 'setItem'> } = {},
): GuideMachine {
  const storage = options.storage
  let stepIndex = -1
  let active = false
  const listeners = new Set<(state: GuideState) => void>()

  const state = (): GuideState => {
    const step = active ? config.steps[stepIndex] ?? null : null
    return {
      active,
      stepIndex,
      step,
      awaitingAction: Boolean(active && config.mode === 'walkthrough' && step?.expect),
    }
  }

  const emit = () => {
    const snapshot = state()
    listeners.forEach(listener => listener(snapshot))
  }

  const finish = () => {
    active = false
    stepIndex = -1
    if (config.storageKey) {
      storage?.setItem(config.storageKey, '1')
    }
    emit()
  }

  return {
    state,
    start(options = {}) {
      if (!options.force && config.storageKey && storage?.getItem(config.storageKey)) {
        return
      }
      if (!config.steps.length) {
        return
      }
      active = true
      stepIndex = 0
      emit()
    },
    next() {
      if (!active) {
        return
      }
      if (stepIndex >= config.steps.length - 1) {
        finish()
        return
      }
      stepIndex += 1
      emit()
    },
    previous() {
      if (!active || stepIndex <= 0) {
        return
      }
      stepIndex -= 1
      emit()
    },
    skip: finish,
    completeAction(action) {
      const current = state()
      if (!current.awaitingAction || current.step?.expect !== action) {
        return false
      }
      this.next()
      return true
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
