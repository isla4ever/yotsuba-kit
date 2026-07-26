<script setup lang="ts">
// 通用底部任务面板：遮罩 + 上滑进场，样式走 --ys-* 令牌。
// Teleport 到 body 后拿不到组件根上的 CSS 变量，因此由 vars 显式下发。
defineProps<{
  open: boolean
  title?: string
  vars?: Record<string, string>
}>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="ys-sheet-fade">
      <div v-if="open" class="ys-sheet__overlay" :style="vars" @click.self="emit('close')">
        <Transition name="ys-sheet-rise" appear>
          <section class="ys-sheet" role="dialog" aria-modal="true">
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
  align-items: flex-end;
  background: rgb(12 16 22 / 46%);
}

.ys-sheet {
  box-sizing: border-box;
  width: 100%;
  max-height: 78vh;
  padding: 4px 16px calc(16px + env(safe-area-inset-bottom, 0px));
  overflow-y: auto;
  color: var(--ys-text-1);
  background: var(--ys-surface-1);
  border-radius: 14px 14px 0 0;
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

.ys-sheet-fade-enter-active,
.ys-sheet-fade-leave-active {
  transition: opacity 200ms ease;
}

.ys-sheet-fade-enter-from,
.ys-sheet-fade-leave-to {
  opacity: 0;
}

.ys-sheet-rise-enter-active {
  transition: transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.ys-sheet-rise-enter-from {
  transform: translateY(24px);
}

@media (prefers-reduced-motion: reduce) {
  .ys-sheet-fade-enter-active,
  .ys-sheet-fade-leave-active,
  .ys-sheet-rise-enter-active {
    transition-duration: 1ms;
  }
}
</style>
