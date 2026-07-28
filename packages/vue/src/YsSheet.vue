<script setup lang="ts">
// 通用弹层：placement 三态（bottom 底部抽屉 / center 居中对话框 / right 侧滑抽屉）+ glass 毛玻璃。
// 配置优先级：显式 props > YsSchedule 注入的 sheets 配置 > 默认 bottom。
// Teleport 到 body 后拿不到组件根上的 CSS 变量，因此由 vars 显式下发。
import type { SheetConfig, SheetKind, SheetPlacement } from '@iyotsuba/schedule-core'
import type { ComputedRef } from 'vue'
import { computed, inject, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  vars?: Record<string, string>
  kind?: SheetKind
  placement?: SheetPlacement
  glass?: boolean
  /** 不 Teleport 到 body，改为覆盖最近的定位容器 */
  contained?: boolean
  /** 允许用户从当前弹层 Header 单独切换位置 */
  adjustable?: boolean
}>(), {
  kind: 'custom',
  glass: undefined,
  contained: undefined,
  adjustable: undefined,
})

const emit = defineEmits<{ close: [], placementChange: [placement: SheetPlacement] }>()

const injected = inject<ComputedRef<SheetConfig>>('ysSheetConfig', computed(() => ({})))

const configuredPlacement = computed<SheetPlacement>(() =>
  props.placement
  ?? injected.value.placements?.[props.kind]
  ?? injected.value.placement
  ?? 'bottom',
)
const localPlacement = ref<SheetPlacement | null>(null)
const placement = computed<SheetPlacement>(() => localPlacement.value ?? configuredPlacement.value)
const glass = computed<boolean>(() => props.glass ?? injected.value.glass ?? false)
const contained = computed<boolean>(() => props.contained ?? injected.value.contained ?? false)
const adjustable = computed<boolean>(() => props.adjustable ?? injected.value.adjustable ?? false)

const placementLabels: Record<SheetPlacement, string> = {
  bottom: '底部',
  center: '居中',
  right: '右侧',
}

watch(configuredPlacement, () => {
  localPlacement.value = null
})

function cyclePlacement() {
  const placements: SheetPlacement[] = ['bottom', 'center', 'right']
  const index = placements.indexOf(placement.value)
  const next = placements[(index + 1) % placements.length]!
  localPlacement.value = next
  emit('placementChange', next)
}
</script>

<template>
  <Teleport to="body" :disabled="contained">
    <Transition name="ys-sheet-fade" appear :duration="340">
      <div
        v-if="open"
        class="ys-sheet__overlay"
        :class="[`ys-sheet__overlay--${placement}`, { 'is-contained': contained, 'is-glass': glass }]"
        :style="vars"
        @click.self="emit('close')"
      >
        <Transition :name="`ys-sheet-${placement}`" appear :duration="340">
          <section class="ys-sheet" :class="[`ys-sheet--${placement}`, { 'is-glass': glass }]" role="dialog" aria-modal="true">
            <header v-if="title || $slots.title || $slots['header-tools'] || adjustable" class="ys-sheet__head">
              <slot name="title">
                <h2>{{ title }}</h2>
              </slot>
              <div class="ys-sheet__tools">
                <slot name="header-tools" />
                <button
                  v-if="adjustable"
                  type="button"
                  class="ys-sheet__tool"
                  :aria-label="`切换弹层位置，当前${placementLabels[placement]}`"
                  :title="`弹层位置：${placementLabels[placement]}`"
                  @click="cyclePlacement"
                >
                  <i class="ys-sheet__placement-icon" :class="`is-${placement}`" aria-hidden="true" />
                </button>
                <button type="button" class="ys-sheet__close" aria-label="关闭" title="关闭" @click="emit('close')">✕</button>
              </div>
            </header>
            <div class="ys-sheet__body">
              <slot />
            </div>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.ys-sheet__overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  isolation: isolate;
  background: rgb(12 16 22 / 42%);
  overscroll-behavior: contain;
}

.ys-sheet__overlay.is-contained {
  position: absolute;
  overscroll-behavior: contain;
}

/* 模糊固定在不移动的遮罩层上，避免带 backdrop-filter 的面板位移时频闪。 */
.ys-sheet__overlay.is-glass {
  background: rgb(12 16 22 / 28%);
  backdrop-filter: blur(11px) saturate(1.12);
  -webkit-backdrop-filter: blur(11px) saturate(1.12);
}

.ys-sheet__overlay--bottom { align-items: flex-end; justify-content: center; }
.ys-sheet__overlay--center { align-items: center; justify-content: center; padding: 20px; }
.ys-sheet__overlay--right { align-items: stretch; justify-content: flex-end; }

.ys-sheet {
  box-sizing: border-box;
  width: 100%;
  padding: 4px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  overflow-y: auto;
  scrollbar-width: none;
  color: var(--ys-text-1);
  background: var(--ys-surface-1);
  backface-visibility: hidden;
  contain: paint;
  transform: translateZ(0);
}

.ys-sheet::-webkit-scrollbar { display: none; }

.ys-sheet--bottom {
  max-width: 460px;
  max-height: 78vh;
  border-radius: 14px 14px 0 0;
}

.ys-sheet__overlay.is-contained .ys-sheet--bottom { max-height: 78%; }

.ys-sheet--center {
  max-width: 400px;
  max-height: 82vh;
  padding-bottom: 16px;
  border-radius: 16px;
  box-shadow: 0 18px 60px rgb(0 0 0 / 30%);
}

.ys-sheet__overlay.is-contained .ys-sheet--center { max-height: 82%; }

.ys-sheet--right {
  width: min(86%, 420px);
  height: 100%;
  padding-top: max(10px, env(safe-area-inset-top, 0px));
  border-radius: 16px 0 0 16px;
}

/* 移动面板只保留半透明材质，模糊由静态遮罩层承担。 */
.ys-sheet.is-glass {
  background: color-mix(in srgb, var(--ys-surface-1) 90%, transparent);
  box-shadow: 0 18px 60px rgb(0 0 0 / 22%);
}

@supports not (backdrop-filter: blur(1px)) {
  .ys-sheet.is-glass { background: var(--ys-surface-1); }
}

@media (prefers-reduced-transparency: reduce) {
  .ys-sheet__overlay.is-glass {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .ys-sheet.is-glass {
    background: var(--ys-surface-1);
  }
}

.ys-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0 6px;
}

.ys-sheet__tools {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-left: auto;
}

.ys-sheet__head h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
}

.ys-sheet__tool,
.ys-sheet__close {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  font-size: 12px;
  color: var(--ys-text-3);
  cursor: pointer;
  background: var(--ys-surface-2);
  border: 0;
  border-radius: 50%;
  line-height: 1;
}

.ys-sheet__tool:focus-visible,
.ys-sheet__close:focus-visible {
  outline: 3px solid var(--ys-focus-ring);
  outline-offset: 1px;
}

.ys-sheet__placement-icon {
  position: relative;
  display: block;
  width: 14px;
  height: 12px;
  border: 1px solid currentcolor;
  border-radius: 2px;
}

.ys-sheet__placement-icon::after {
  position: absolute;
  content: '';
  background: currentcolor;
  border-radius: 1px;
  opacity: 0.72;
}

.ys-sheet__placement-icon.is-bottom::after { right: 2px; bottom: 2px; left: 2px; height: 3px; }
.ys-sheet__placement-icon.is-center::after { inset: 3px; }
.ys-sheet__placement-icon.is-right::after { top: 2px; right: 2px; bottom: 2px; width: 3px; }

/* 进出场：全部 transform/opacity */
.ys-sheet-fade-enter-active,
.ys-sheet-fade-leave-active {
  transition: opacity 300ms ease;
}

.ys-sheet-fade-enter-from,
.ys-sheet-fade-leave-to {
  opacity: 0;
}

.ys-sheet-bottom-enter-active,
.ys-sheet-bottom-leave-active { transition: opacity 220ms ease, transform 300ms cubic-bezier(0.22, 0.61, 0.36, 1); }
.ys-sheet-bottom-enter-from,
.ys-sheet-bottom-leave-to { opacity: 0; transform: translate3d(0, 32px, 0); }

.ys-sheet-center-enter-active,
.ys-sheet-center-leave-active { transition: opacity 200ms ease, transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1); }
.ys-sheet-center-enter-from,
.ys-sheet-center-leave-to { opacity: 0; transform: translate3d(0, 10px, 0); }

.ys-sheet-right-enter-active,
.ys-sheet-right-leave-active { transition: opacity 220ms ease, transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1); }
.ys-sheet-right-enter-from,
.ys-sheet-right-leave-to { opacity: 0; transform: translate3d(44px, 0, 0); }

@media (prefers-reduced-motion: reduce) {
  .ys-sheet-fade-enter-active,
  .ys-sheet-fade-leave-active,
  .ys-sheet-bottom-enter-active,
  .ys-sheet-bottom-leave-active,
  .ys-sheet-center-enter-active,
  .ys-sheet-center-leave-active,
  .ys-sheet-right-enter-active,
  .ys-sheet-right-leave-active {
    transition-duration: 1ms;
  }
}
</style>
