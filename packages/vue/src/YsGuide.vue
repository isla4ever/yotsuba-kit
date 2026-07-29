<script setup lang="ts">
// 引导三模式：
// tips        — 非阻塞小气泡逐条讲解
// spotlight   — 遮罩挖孔高亮 + 讲解卡（上一步/下一步）
// walkthrough — 手把手：每步要求用户真实完成动作（点这里/滑一下）才前进，
//               遮罩用四块矩形拼成，挖孔区域保持可点；超时播放脉冲提示。
import type { GuideConfig, GuideStep } from '@iyotsuba/schedule-core'
import { createGuideMachine } from '@iyotsuba/schedule-core'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps<{
  config: GuideConfig
  /** 解析语义锚点的作用域根元素 */
  root?: HTMLElement | null
  vars?: Record<string, string>
}>()

const emit = defineEmits<{ finish: [], step: [step: GuideStep, index: number] }>()

const state = reactive({
  active: false,
  stepIndex: -1,
  step: null as GuideStep | null,
  awaitingAction: false,
})

interface GuideHole {
  top: number
  left: number
  width: number
  height: number
  borderRadius: string
}

const HOLE_PADDING = 4
const HOLE_RADIUS_FALLBACK = 8
const VIEWPORT_EDGE_INSET = 1
const hole = ref<GuideHole | null>(null)
const hinting = ref(false)
let unsubscribeMachine: (() => void) | null = null
let machine = createMachine()
let hintTimer: ReturnType<typeof setTimeout> | null = null
let missingTargetTimer: ReturnType<typeof setTimeout> | null = null
let targetEl: HTMLElement | null = null
let tapListener: (() => void) | null = null

function createMachine() {
  const created = createGuideMachine(props.config, {
    storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
  })
  unsubscribeMachine = created.subscribe((next) => {
    const wasActive = state.active
    Object.assign(state, next)
    if (!next.active && wasActive) {
      cleanupStep()
      emit('finish')
      return
    }
    if (next.step) {
      emit('step', next.step, next.stepIndex)
      attachStep(next.step)
    }
  })
  return created
}

// 按内容比较：宿主用内联对象传 config 时（每次渲染新引用）不应重置进行中的引导
watch(() => JSON.stringify(props.config), () => {
  cleanupStep()
  unsubscribeMachine?.()
  Object.assign(state, { active: false, stepIndex: -1, step: null, awaitingAction: false })
  machine = createMachine()
  if (props.config.autoStart) {
    void nextTick(() => machine.start())
  }
})

function resolveTarget(step: GuideStep): HTMLElement | null {
  const scope: ParentNode = props.root ?? document
  return scope.querySelector<HTMLElement>(`[data-ys="${step.target}"]`)
    ?? scope.querySelector<HTMLElement>(step.target)
    ?? (scope === document ? null : document.querySelector<HTMLElement>(`[data-ys="${step.target}"]`))
    ?? (scope === document ? null : document.querySelector<HTMLElement>(step.target))
}

function radiusInPixels(value: string, rect: DOMRect): number {
  const token = value.trim().split(/\s+/)[0] ?? ''
  const parsed = Number.parseFloat(token)
  if (!Number.isFinite(parsed)) {
    return 0
  }
  if (token.endsWith('%')) {
    return Math.min(rect.width, rect.height) * parsed / 100
  }
  return parsed
}

function cornerRadii(element: HTMLElement, rect: DOMRect): number[] {
  const styles = window.getComputedStyle(element)
  return [
    styles.borderTopLeftRadius,
    styles.borderTopRightRadius,
    styles.borderBottomRightRadius,
    styles.borderBottomLeftRadius,
  ].map(value => radiusInPixels(value, rect))
}

function focusGeometry(element: HTMLElement): { rect: DOMRect, radii: number[] } {
  const rect = element.getBoundingClientRect()
  const radii = cornerRadii(element, rect)
  if (radii.every(value => value <= 0)) {
    for (const child of Array.from(element.children)) {
      if (!(child instanceof HTMLElement)) {
        continue
      }
      const childRect = child.getBoundingClientRect()
      const contained = childRect.left >= rect.left - 1
        && childRect.right <= rect.right + 1
        && childRect.top >= rect.top - 1
        && childRect.bottom <= rect.bottom + 1
      const fillsTarget = childRect.width >= rect.width * 0.72
        && childRect.height >= rect.height * 0.72
      const childRadii = cornerRadii(child, childRect)
      if (contained && fillsTarget && childRadii.some(value => value > 0)) {
        return { rect: childRect, radii: childRadii }
      }
    }
  }
  return { rect, radii }
}

function targetBorderRadius(sourceRadii: number[], holeWidth: number, holeHeight: number): string {
  const maxRadius = Math.min(holeWidth, holeHeight) / 2
  const expansion = HOLE_PADDING
  const values = sourceRadii.map((targetRadius) => {
    const radius = targetRadius > 0 ? targetRadius + expansion : HOLE_RADIUS_FALLBACK
    return Math.round(Math.min(maxRadius, radius) * 10) / 10
  })
  return values.map(value => `${value}px`).join(' ')
}

function measure() {
  if (!state.step) {
    hole.value = null
    return
  }
  targetEl = resolveTarget(state.step)
  if (!targetEl) {
    hole.value = null
    return
  }
  const geometry = focusGeometry(targetEl)
  const rect = geometry.rect
  const pad = HOLE_PADDING
  const viewportW = typeof window !== 'undefined' ? window.innerWidth : rect.right + pad
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : rect.bottom + pad
  const top = Math.max(VIEWPORT_EDGE_INSET, rect.top - pad)
  const left = Math.max(VIEWPORT_EDGE_INSET, rect.left - pad)
  const right = Math.min(viewportW - VIEWPORT_EDGE_INSET, rect.right + pad)
  const bottom = Math.min(viewportH - VIEWPORT_EDGE_INSET, rect.bottom + pad)
  const width = Math.max(18, right - left)
  const height = Math.max(18, bottom - top)
  hole.value = {
    top,
    left,
    width,
    height,
    borderRadius: targetBorderRadius(geometry.radii, width, height),
  }
}

function attachStep(step: GuideStep) {
  cleanupStep()
  requestAnimationFrame(() => {
    targetEl = resolveTarget(step)
    if (!targetEl && props.config.mode !== 'tips') {
      hole.value = null
      missingTargetTimer = setTimeout(() => {
        if (state.active && state.step?.id === step.id) {
          machine.next()
        }
      }, 120)
      return
    }

    const rect = targetEl?.getBoundingClientRect()
    const outsideViewport = rect && typeof window !== 'undefined'
      && (rect.top < 12 || rect.bottom > window.innerHeight - 12)
    if (outsideViewport && typeof targetEl?.scrollIntoView === 'function') {
      ;(targetEl.scrollIntoView as (options?: ScrollIntoViewOptions) => void)({
        block: 'center',
        behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
    }

    requestAnimationFrame(() => {
      measure()
      // walkthrough tap 步骤：真实点击目标即前进
      if (props.config.mode === 'walkthrough' && step.expect === 'tap') {
        const el = targetEl
        if (el) {
          tapListener = () => machine.completeAction('tap')
          el.addEventListener('click', tapListener, { once: true, capture: true })
        }
      }
      if (props.config.mode === 'walkthrough' && step.expect) {
        hintTimer = setTimeout(() => {
          hinting.value = true
        }, step.hintAfterMs ?? 3000)
      }
    })
  })
}

function cleanupStep() {
  if (hintTimer) {
    clearTimeout(hintTimer)
    hintTimer = null
  }
  if (missingTargetTimer) {
    clearTimeout(missingTargetTimer)
    missingTargetTimer = null
  }
  if (tapListener && targetEl) {
    targetEl.removeEventListener('click', tapListener, { capture: true })
  }
  tapListener = null
  hinting.value = false
}

function onViewportChange() {
  if (state.active) {
    measure()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!state.active) {
    return
  }
  if (event.key === 'Escape') {
    machine.skip()
    return
  }
  if (state.awaitingAction) {
    return
  }
  if (event.key === 'ArrowRight') {
    machine.next()
  }
  else if (event.key === 'ArrowLeft') {
    machine.previous()
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
  window.addEventListener('keydown', onKeydown)
}

onMounted(() => {
  if (props.config.autoStart) {
    void nextTick(() => machine.start())
  }
})

onBeforeUnmount(() => {
  cleanupStep()
  unsubscribeMachine?.()
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', onViewportChange)
    window.removeEventListener('scroll', onViewportChange, true)
    window.removeEventListener('keydown', onKeydown)
  }
})

/** 宿主动作桥：swipe 等由 YsSchedule 通知 */
function notify(action: NonNullable<GuideStep['expect']>) {
  machine.completeAction(action)
}

function start(force = true) {
  machine.start({ force })
}

defineExpose({ start, skip: () => machine.skip(), notify })

const showMask = computed(() => state.active && props.config.mode !== 'tips')
const isLast = computed(() => state.stepIndex >= props.config.steps.length - 1)
const progress = computed(() => `${(state.stepIndex + 1) / Math.max(1, props.config.steps.length) * 100}%`)

const actionHint = computed(() => {
  switch (state.step?.expect) {
    case 'tap': return '点按高亮区域继续'
    case 'swipe-left': return '在高亮区域向左滑动'
    case 'swipe-right': return '在高亮区域向右滑动'
    case 'longpress': return '长按高亮区域'
    default: return ''
  }
})

const cardStyle = computed(() => {
  if (!hole.value) {
    return { left: '16px', right: '16px', bottom: 'max(24px, env(safe-area-inset-bottom))' }
  }
  const viewportH = typeof window !== 'undefined' ? window.innerHeight : 800
  const below = hole.value.top + hole.value.height + 12
  if (below + 190 < viewportH) {
    return { left: '16px', right: '16px', top: `${below}px` } // 高亮区下方
  }
  if (hole.value.top > 200) {
    return { left: '16px', right: '16px', bottom: `${viewportH - hole.value.top + 12}px` } // 高亮区上方
  }
  // 高亮区占满大半屏（如整个网格）：卡片贴屏幕底部，不遮挡操作提示
  return { left: '16px', right: '16px', bottom: 'max(24px, env(safe-area-inset-bottom))' }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="ys-guide-shell" appear>
      <div v-if="state.active && state.step" class="ys-guide" :style="vars">
        <!-- 遮罩：四块矩形拼合，挖孔区域保持可交互 -->
        <template v-if="showMask && hole">
          <div class="ys-guide__mask" :style="{ top: 0, left: 0, right: 0, height: `${hole.top}px` }" />
          <div class="ys-guide__mask" :style="{ top: `${hole.top}px`, left: 0, width: `${hole.left}px`, height: `${hole.height}px` }" />
          <div class="ys-guide__mask" :style="{ top: `${hole.top}px`, left: `${hole.left + hole.width}px`, right: 0, height: `${hole.height}px` }" />
          <div class="ys-guide__mask" :style="{ top: `${hole.top + hole.height}px`, left: 0, right: 0, bottom: 0 }" />
          <div
            class="ys-guide__ring"
            :class="{ 'is-hinting': hinting, 'is-swipe': state.step.expect?.startsWith('swipe') }"
            :style="{ top: `${hole.top}px`, left: `${hole.left}px`, width: `${hole.width}px`, height: `${hole.height}px`, borderRadius: hole.borderRadius }"
          >
            <i v-if="hinting && state.step.expect === 'swipe-left'" class="ys-guide__swipe-hint" aria-hidden="true" />
          </div>
        </template>

        <Transition name="ys-guide-card" mode="out-in" appear>
          <div
            :key="state.step.id"
            class="ys-guide__card"
            :class="{ 'is-tips': config.mode === 'tips' }"
            :style="cardStyle"
            role="dialog"
            :aria-modal="showMask"
            :aria-label="`${state.step.title}，第 ${state.stepIndex + 1} 步，共 ${config.steps.length} 步`"
            aria-live="polite"
          >
            <div class="ys-guide__meta">
              <span>模块导览</span>
              <b>{{ state.stepIndex + 1 }} / {{ config.steps.length }}</b>
            </div>
            <div class="ys-guide__progress" aria-hidden="true"><i :style="{ width: progress }" /></div>
            <strong class="ys-guide__title">{{ state.step.title }}</strong>
            <p class="ys-guide__body">{{ state.step.body }}</p>
            <p v-if="state.awaitingAction" class="ys-guide__action"><i aria-hidden="true" />{{ actionHint }}</p>
            <div class="ys-guide__buttons">
              <button type="button" class="ys-guide__btn ys-guide__btn--quiet" @click="machine.skip()">跳过</button>
              <span class="ys-guide__flex" />
              <template v-if="!state.awaitingAction">
                <button v-if="state.stepIndex > 0" type="button" class="ys-guide__btn ys-guide__btn--ghost" @click="machine.previous()">上一步</button>
                <button type="button" class="ys-guide__btn ys-guide__btn--primary" @click="machine.next()">
                  {{ isLast ? '完成' : '下一步' }}
                </button>
              </template>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.ys-guide {
  position: fixed;
  inset: 0;
  z-index: 1200;
  overflow: hidden;
  pointer-events: none;
}

.ys-guide__mask {
  position: absolute;
  pointer-events: auto;
  background: transparent;
  transition: top 380ms cubic-bezier(0.22, 1, 0.36, 1), left 380ms cubic-bezier(0.22, 1, 0.36, 1), width 380ms cubic-bezier(0.22, 1, 0.36, 1), height 380ms cubic-bezier(0.22, 1, 0.36, 1);
}

.ys-guide__ring {
  position: absolute;
  pointer-events: none;
  border: 1px solid rgb(255 255 255 / 86%);
  border-radius: 10px;
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--ys-accent, #3d76dd) 72%, transparent),
    0 0 26px color-mix(in srgb, var(--ys-accent, #3d76dd) 28%, transparent),
    0 0 0 100vmax rgb(16 21 29 / 66%);
  transition: top 380ms cubic-bezier(0.22, 1, 0.36, 1), left 380ms cubic-bezier(0.22, 1, 0.36, 1), width 380ms cubic-bezier(0.22, 1, 0.36, 1), height 380ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 380ms cubic-bezier(0.22, 1, 0.36, 1);
}

.ys-guide__ring.is-hinting {
  animation: ys-guide-pulse 1.1s ease-in-out infinite;
}

.ys-guide__swipe-hint {
  position: absolute;
  top: 50%;
  right: 12%;
  width: 34px;
  height: 3px;
  background: #fff;
  border-radius: 2px;
  opacity: 0.9;
  animation: ys-guide-swipe 1.3s ease-in-out infinite;
}

.ys-guide__card {
  position: absolute;
  box-sizing: border-box;
  width: min(420px, calc(100vw - 32px));
  max-width: 420px;
  padding: 15px 16px 13px;
  margin: 0 auto;
  color: var(--ys-text-1, #1c232d);
  pointer-events: auto;
  background: var(--ys-surface-1, #fff);
  border: 1px solid color-mix(in srgb, var(--ys-border, #d8dee8) 78%, transparent);
  border-radius: 10px;
  box-shadow: 0 18px 48px rgb(0 0 0 / 30%);
}

.ys-guide__card.is-tips {
  box-shadow: 0 6px 22px rgb(0 0 0 / 18%);
}

.ys-guide__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 650;
  color: var(--ys-text-3, #8a94a3);
}

.ys-guide__meta b { color: var(--ys-text-2, #45505e); font-variant-numeric: tabular-nums; }

.ys-guide__progress {
  height: 2px;
  margin-top: 7px;
  overflow: hidden;
  background: var(--ys-surface-2, #eef1f5);
  border-radius: 2px;
}

.ys-guide__progress i {
  display: block;
  height: 100%;
  background: var(--ys-accent, #3d76dd);
  border-radius: inherit;
  transition: width 360ms cubic-bezier(0.22, 1, 0.36, 1);
}

.ys-guide__title {
  display: block;
  margin-top: 10px;
  font-size: 15px;
  font-weight: 750;
}

.ys-guide__body {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--ys-text-2, #45505e);
}

.ys-guide__action {
  display: flex;
  gap: 7px;
  align-items: center;
  margin: 6px 0 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--ys-accent, #3d76dd);
}

.ys-guide__action i {
  width: 8px;
  height: 8px;
  background: currentcolor;
  border-radius: 50%;
  box-shadow: 0 0 0 5px color-mix(in srgb, currentcolor 14%, transparent);
}

.ys-guide__buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
}

.ys-guide__flex { flex: 1; }

.ys-guide__btn {
  min-height: 34px;
  padding: 6px 13px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 0;
  border-radius: 7px;
  transition: color 160ms ease, background 160ms ease, transform 160ms ease;
}

.ys-guide__btn:hover { transform: translateY(-1px); }
.ys-guide__btn:active { transform: translateY(0) scale(0.97); }
.ys-guide__btn:focus-visible { outline: 3px solid var(--ys-focus-ring, rgb(61 118 221 / 28%)); outline-offset: 2px; }

.ys-guide__btn--quiet { color: var(--ys-text-3, #8a94a3); background: transparent; }

.ys-guide__btn--ghost {
  color: var(--ys-text-3, #8a94a3);
  background: var(--ys-surface-2, #eef1f5);
}

.ys-guide__btn--primary {
  color: #fff;
  background: var(--ys-accent, #3d76dd);
}

@keyframes ys-guide-pulse {
  0%, 100% {
    box-shadow:
      0 0 0 3px color-mix(in srgb, var(--ys-accent, #3d76dd) 72%, transparent),
      0 0 22px color-mix(in srgb, var(--ys-accent, #3d76dd) 22%, transparent),
      0 0 0 100vmax rgb(16 21 29 / 66%);
  }
  50% {
    box-shadow:
      0 0 0 9px color-mix(in srgb, var(--ys-accent, #3d76dd) 18%, transparent),
      0 0 34px color-mix(in srgb, var(--ys-accent, #3d76dd) 34%, transparent),
      0 0 0 100vmax rgb(16 21 29 / 66%);
  }
}

@keyframes ys-guide-swipe {
  0% { transform: translateX(0); opacity: 0; }
  25% { opacity: 0.9; }
  100% { transform: translateX(-70px); opacity: 0; }
}

.ys-guide-shell-enter-active,
.ys-guide-shell-leave-active { transition: opacity 300ms ease; }
.ys-guide-shell-enter-from,
.ys-guide-shell-leave-to { opacity: 0; }

.ys-guide-card-enter-active,
.ys-guide-card-leave-active { transition: opacity 220ms ease, transform 320ms cubic-bezier(0.22, 1, 0.36, 1); }
.ys-guide-card-enter-from { opacity: 0; transform: translateY(10px) scale(0.985); }
.ys-guide-card-leave-to { opacity: 0; transform: translateY(-5px) scale(0.99); }

@media (prefers-reduced-motion: reduce) {
  .ys-guide__mask,
  .ys-guide__ring,
  .ys-guide__progress i,
  .ys-guide-shell-enter-active,
  .ys-guide-shell-leave-active,
  .ys-guide-card-enter-active,
  .ys-guide-card-leave-active,
  .ys-guide__btn,
  .ys-guide__ring.is-hinting,
  .ys-guide__swipe-hint {
    transition: none;
    animation: none;
  }
}
</style>
