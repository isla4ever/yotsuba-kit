<script setup lang="ts">
// 引导三模式：
// tips        — 非阻塞小气泡逐条讲解
// spotlight   — 遮罩挖孔高亮 + 讲解卡（上一步/下一步）
// walkthrough — 手把手：每步要求用户真实完成动作（点这里/滑一下）才前进，
//               遮罩用四块矩形拼成，挖孔区域保持可点；超时播放脉冲提示。
import type { GuideConfig, GuideStep } from '@iyotsuba/schedule-core'
import { createGuideMachine } from '@iyotsuba/schedule-core'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

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

const hole = ref<{ top: number, left: number, width: number, height: number } | null>(null)
const hinting = ref(false)
let machine = createMachine()
let hintTimer: ReturnType<typeof setTimeout> | null = null
let targetEl: HTMLElement | null = null
let tapListener: (() => void) | null = null

function createMachine() {
  const created = createGuideMachine(props.config, {
    storage: typeof localStorage !== 'undefined' ? localStorage : undefined,
  })
  created.subscribe((next) => {
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
  Object.assign(state, { active: false, stepIndex: -1, step: null, awaitingAction: false })
  machine = createMachine()
})

function resolveTarget(step: GuideStep): HTMLElement | null {
  const scope: ParentNode = props.root ?? document
  return scope.querySelector<HTMLElement>(`[data-ys="${step.target}"]`)
    ?? scope.querySelector<HTMLElement>(step.target)
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
  const rect = targetEl.getBoundingClientRect()
  const pad = 6
  hole.value = {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  }
}

function attachStep(step: GuideStep) {
  cleanupStep()
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
}

function cleanupStep() {
  if (hintTimer) {
    clearTimeout(hintTimer)
    hintTimer = null
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

if (typeof window !== 'undefined') {
  window.addEventListener('resize', onViewportChange)
  window.addEventListener('scroll', onViewportChange, true)
}

onBeforeUnmount(() => {
  cleanupStep()
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', onViewportChange)
    window.removeEventListener('scroll', onViewportChange, true)
  }
})

/** 宿主动作桥：swipe 等由 YsSchedule 通知 */
function notify(action: NonNullable<GuideStep['expect']>) {
  machine.completeAction(action)
}

function start() {
  machine.start()
}

defineExpose({ start, skip: () => machine.skip(), notify })

const showMask = computed(() => state.active && props.config.mode !== 'tips')
const isLast = computed(() => state.stepIndex >= props.config.steps.length - 1)

const actionHint = computed(() => {
  switch (state.step?.expect) {
    case 'tap': return '点击高亮区域继续'
    case 'swipe-left': return '在高亮区域向左滑动'
    case 'swipe-right': return '在高亮区域向右滑动'
    case 'longpress': return '长按高亮区域'
    default: return ''
  }
})

const cardStyle = computed(() => {
  if (!hole.value) {
    return { left: '16px', right: '16px', bottom: '24px' }
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
  return { left: '16px', right: '16px', bottom: '24px' }
})
</script>

<template>
  <Teleport to="body">
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
          :style="{ top: `${hole.top}px`, left: `${hole.left}px`, width: `${hole.width}px`, height: `${hole.height}px` }"
        >
          <i v-if="hinting && state.step.expect === 'swipe-left'" class="ys-guide__swipe-hint" aria-hidden="true" />
        </div>
      </template>

      <div class="ys-guide__card" :class="{ 'is-tips': config.mode === 'tips' }" :style="cardStyle" role="dialog" aria-live="polite">
        <div class="ys-guide__meta">{{ state.stepIndex + 1 }} / {{ config.steps.length }}</div>
        <strong class="ys-guide__title">{{ state.step.title }}</strong>
        <p class="ys-guide__body">{{ state.step.body }}</p>
        <p v-if="state.awaitingAction" class="ys-guide__action">👆 {{ actionHint }}</p>
        <div class="ys-guide__buttons">
          <button type="button" class="ys-guide__btn ys-guide__btn--ghost" @click="machine.skip()">跳过</button>
          <span class="ys-guide__flex" />
          <template v-if="!state.awaitingAction">
            <button v-if="state.stepIndex > 0" type="button" class="ys-guide__btn ys-guide__btn--ghost" @click="machine.previous()">上一步</button>
            <button type="button" class="ys-guide__btn ys-guide__btn--primary" @click="machine.next()">
              {{ isLast ? '完成' : '下一步' }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
.ys-guide {
  position: fixed;
  inset: 0;
  z-index: 1200;
  pointer-events: none;
}

.ys-guide__mask {
  position: absolute;
  pointer-events: auto;
  background: rgb(10 14 20 / 56%);
}

.ys-guide__ring {
  position: absolute;
  pointer-events: none;
  border: 2px solid var(--ys-accent, #3d76dd);
  border-radius: 10px;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ys-accent, #3d76dd) 30%, transparent);
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
  max-width: 420px;
  padding: 13px 14px 11px;
  margin: 0 auto;
  color: var(--ys-text-1, #1c232d);
  pointer-events: auto;
  background: var(--ys-surface-1, #fff);
  border-radius: 12px;
  box-shadow: 0 10px 34px rgb(0 0 0 / 26%);
}

.ys-guide__card.is-tips {
  box-shadow: 0 6px 22px rgb(0 0 0 / 18%);
}

.ys-guide__meta {
  font-size: 10px;
  color: var(--ys-text-3, #8a94a3);
}

.ys-guide__title {
  display: block;
  margin-top: 2px;
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
  margin: 6px 0 0;
  font-size: 12px;
  font-weight: 700;
  color: var(--ys-accent, #3d76dd);
}

.ys-guide__buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
}

.ys-guide__flex { flex: 1; }

.ys-guide__btn {
  padding: 6px 13px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  border: 0;
  border-radius: 7px;
}

.ys-guide__btn--ghost {
  color: var(--ys-text-3, #8a94a3);
  background: var(--ys-surface-2, #eef1f5);
}

.ys-guide__btn--primary {
  color: #fff;
  background: var(--ys-accent, #3d76dd);
}

@keyframes ys-guide-pulse {
  0%, 100% { box-shadow: 0 0 0 3px color-mix(in srgb, var(--ys-accent, #3d76dd) 30%, transparent); }
  50% { box-shadow: 0 0 0 9px color-mix(in srgb, var(--ys-accent, #3d76dd) 14%, transparent); }
}

@keyframes ys-guide-swipe {
  0% { transform: translateX(0); opacity: 0; }
  25% { opacity: 0.9; }
  100% { transform: translateX(-70px); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ys-guide__ring.is-hinting,
  .ys-guide__swipe-hint {
    animation: none;
  }
}
</style>
