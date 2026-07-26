<script setup lang="ts">
// 通用弹层：placement 三态（bottom 底部抽屉 / center 居中对话框 / right 侧滑抽屉）+ glass 毛玻璃。
// 配置优先级：显式 props > YsSchedule 注入的 sheets 配置 > 默认 bottom。
// Teleport 到 body 后拿不到组件根上的 CSS 变量，因此由 vars 显式下发。
import type { SheetPlacement } from '@iyotsuba/schedule-core'
import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'

const props = defineProps<{
  open: boolean
  title?: string
  vars?: Record<string, string>
  placement?: SheetPlacement
  glass?: boolean
}>()

const emit = defineEmits<{ close: [] }>()

const injected = inject<ComputedRef<{ placement?: SheetPlacement, glass?: boolean }>>('ysSheetConfig', computed(() => ({})))

const placement = computed<SheetPlacement>(() => props.placement ?? injected.value.placement ?? 'bottom')
const glass = computed<boolean>(() => props.glass ?? injected.value.glass ?? false)
</script>

<template>
  <Teleport to="body">
    <Transition name="ys-sheet-fade">
      <div
        v-if="open"
        class="ys-sheet__overlay"
        :class="`ys-sheet__overlay--${placement}`"
        :style="vars"
        @click.self="emit('close')"
      >
        <Transition :name="`ys-sheet-${placement}`" appear>
          <section class="ys-sheet" :class="[`ys-sheet--${placement}`, { 'is-glass': glass }]" role="dialog" aria-modal="true">
            <header v-if="title || $slots.title" class="ys-sheet__head">
              <slot name="title">
                <h2>{{ title }}</h2>
              </slot>
              <button type="button" class="ys-sheet__close" aria-label="关闭" @click="emit('close')">✕</button>
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
  background: rgb(12 16 22 / 46%);
}

.ys-sheet__overlay--bottom { align-items: flex-end; justify-content: center; }
.ys-sheet__overlay--center { align-items: center; justify-content: center; padding: 20px; }
.ys-sheet__overlay--right { align-items: stretch; justify-content: flex-end; }

.ys-sheet {
  box-sizing: border-box;
  width: 100%;
  padding: 4px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  overflow-y: auto;
  color: var(--ys-text-1);
  background: var(--ys-surface-1);
}

.ys-sheet--bottom {
  max-width: 460px;
  max-height: 78vh;
  border-radius: 14px 14px 0 0;
}

.ys-sheet--center {
  max-width: 400px;
  max-height: 82vh;
  padding-bottom: 16px;
  border-radius: 16px;
  box-shadow: 0 18px 60px rgb(0 0 0 / 30%);
}

.ys-sheet--right {
  width: min(86%, 420px);
  height: 100%;
  padding-top: max(10px, env(safe-area-inset-top, 0px));
  border-radius: 16px 0 0 16px;
}

/* 毛玻璃：静态 blur(不动画),降透明度回退 */
.ys-sheet.is-glass {
  background: color-mix(in srgb, var(--ys-surface-1) 74%, transparent);
  backdrop-filter: blur(18px) saturate(1.4);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
}

@supports not (backdrop-filter: blur(1px)) {
  .ys-sheet.is-glass { background: var(--ys-surface-1); }
}

@media (prefers-reduced-transparency: reduce) {
  .ys-sheet.is-glass {
    background: var(--ys-surface-1);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

.ys-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0 6px;
}

.ys-sheet__head h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 750;
}

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
}

/* 进出场：全部 transform/opacity */
.ys-sheet-fade-enter-active,
.ys-sheet-fade-leave-active {
  transition: opacity 200ms ease;
}

.ys-sheet-fade-enter-from,
.ys-sheet-fade-leave-to {
  opacity: 0;
}

.ys-sheet-bottom-enter-active { transition: transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1); }
.ys-sheet-bottom-enter-from { transform: translateY(24px); }

.ys-sheet-center-enter-active { transition: transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1); }
.ys-sheet-center-enter-from { transform: scale(0.94) translateY(8px); }

.ys-sheet-right-enter-active { transition: transform 280ms cubic-bezier(0.22, 0.61, 0.36, 1); }
.ys-sheet-right-enter-from { transform: translateX(48px); }

@media (prefers-reduced-motion: reduce) {
  .ys-sheet-fade-enter-active,
  .ys-sheet-fade-leave-active,
  .ys-sheet-bottom-enter-active,
  .ys-sheet-center-enter-active,
  .ys-sheet-right-enter-active {
    transition-duration: 1ms;
  }
}
</style>
