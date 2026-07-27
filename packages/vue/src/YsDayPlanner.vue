<script setup lang="ts">
// 内置日计划面板：点表头日期 → 当天待办的增/勾/删,数据完全受控由宿主持有
import type { DayPlan } from '@iyotsuba/schedule-core'
import { ref, watch } from 'vue'
import YsSheet from './YsSheet.vue'

const props = defineProps<{
  open: boolean
  dateKey: string
  dateLabel: string
  plans: DayPlan[]
  vars?: Record<string, string>
}>()

const emit = defineEmits<{
  close: []
  add: [dateKey: string, text: string]
  toggle: [dateKey: string, id: string]
  remove: [dateKey: string, id: string]
}>()

const draft = ref('')

watch(() => props.open, (open) => {
  if (open) {
    draft.value = ''
  }
})

function submit() {
  const text = draft.value.trim()
  if (!text) {
    return
  }
  emit('add', props.dateKey, text)
  draft.value = ''
}
</script>

<template>
  <YsSheet :open="open" kind="dayPlanner" :title="`${dateLabel} · 日计划`" :vars="vars" @close="emit('close')">
    <div class="ys-planner">
      <form class="ys-planner__add" @submit.prevent="submit">
        <input v-model="draft" type="text" placeholder="今天要做什么？回车添加">
        <button type="submit" :disabled="!draft.trim()">添加</button>
      </form>

      <ul v-if="plans.length" class="ys-planner__list">
        <li v-for="plan in plans" :key="plan.id" :class="{ 'is-done': plan.done }">
          <button type="button" class="ys-planner__check" :aria-checked="plan.done" role="checkbox" @click="emit('toggle', dateKey, plan.id)">
            <span v-if="plan.done">✓</span>
          </button>
          <span class="ys-planner__text">{{ plan.text }}</span>
          <button type="button" class="ys-planner__remove" aria-label="删除" @click="emit('remove', dateKey, plan.id)">✕</button>
        </li>
      </ul>
      <p v-else class="ys-planner__empty">这一天还没有计划</p>
    </div>
  </YsSheet>
</template>

<style>
.ys-planner { padding: 4px 0 2px; }

.ys-planner__add { display: flex; gap: 8px; }

.ys-planner__add input {
  flex: 1;
  padding: 10px 12px;
  font: inherit;
  font-size: 13px;
  color: var(--ys-text-1);
  background: var(--ys-surface-2);
  border: 1px solid var(--ys-border);
  border-radius: 9px;
  outline: none;
}

.ys-planner__add input:focus {
  border-color: var(--ys-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ys-accent) 18%, transparent);
}

.ys-planner__add button {
  padding: 0 18px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: var(--ys-accent);
  border: 0;
  border-radius: 9px;
}

.ys-planner__add button:disabled { opacity: 0.5; }

.ys-planner__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin: 12px 0 0;
  list-style: none;
}

.ys-planner__list li {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  background: var(--ys-surface-2);
  border-radius: 9px;
}

.ys-planner__list li.is-done .ys-planner__text {
  color: var(--ys-text-3);
  text-decoration: line-through;
}

.ys-planner__check {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 20px;
  height: 20px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  background: transparent;
  border: 2px solid var(--ys-border-strong);
  border-radius: 6px;
}

li.is-done .ys-planner__check {
  background: var(--ys-success);
  border-color: var(--ys-success);
}

.ys-planner__text { flex: 1; font-size: 13px; }

.ys-planner__remove {
  padding: 4px;
  font-size: 11px;
  color: var(--ys-text-3);
  cursor: pointer;
  background: transparent;
  border: 0;
}

.ys-planner__empty {
  margin: 14px 0 4px;
  font-size: 12px;
  color: var(--ys-text-3);
  text-align: center;
}
</style>
