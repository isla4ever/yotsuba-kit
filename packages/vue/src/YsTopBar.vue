<script setup lang="ts">
// 顶部周信息栏（用户语境中的 header）：三档形态有真实 UI 差异，非单纯高度缩放。
// standard 档复刻微信公众号网页版 ScheduleHeader：eyebrow + 大号周数按钮 + 右侧工具位。
import { computed } from 'vue'

const props = defineProps<{
  preset: 'compact' | 'standard' | 'expanded'
  week: number
  totalWeeks: number
  termStart?: Date
  title: string
  weatherText?: string
}>()

const emit = defineEmits<{ pickWeek: [] }>()

const dateRange = computed(() => {
  if (!props.termStart) {
    return ''
  }
  const start = new Date(props.termStart)
  start.setDate(start.getDate() + (props.week - 1) * 7)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return `${start.getMonth() + 1}.${start.getDate()} - ${end.getMonth() + 1}.${end.getDate()}`
})
</script>

<template>
  <header class="ys-topbar" :class="`ys-topbar--${preset}`">
    <!-- compact：单行极简，周数即按钮，右侧仅日期范围 -->
    <template v-if="preset === 'compact'">
      <button type="button" class="ys-topbar__week ys-topbar__week--sm" aria-label="选择教学周" data-ys="top-bar-week" @click="emit('pickWeek')">
        第 {{ week }} 周 <i class="ys-topbar__caret" aria-hidden="true" />
      </button>
      <span v-if="dateRange" class="ys-topbar__range">{{ dateRange }}</span>
      <span class="ys-topbar__spacer" />
      <slot name="tools" />
    </template>

    <!-- standard：微信版复刻（eyebrow + 大号周数 + 工具位） -->
    <template v-else-if="preset === 'standard'">
      <div class="ys-topbar__brand">
        <span class="ys-topbar__eyebrow">{{ title }}</span>
        <button type="button" class="ys-topbar__week" aria-label="选择教学周" data-ys="top-bar-week" @click="emit('pickWeek')">
          第 {{ week }} 周 <i class="ys-topbar__caret" aria-hidden="true" />
        </button>
      </div>
      <span class="ys-topbar__spacer" />
      <slot name="tools" />
    </template>

    <!-- expanded：双行信息面板（周数按钮 + 进度 / 日期范围 + 天气） -->
    <template v-else>
      <div class="ys-topbar__panel">
        <div class="ys-topbar__panel-main">
          <span class="ys-topbar__eyebrow">{{ title }}</span>
          <button type="button" class="ys-topbar__week" aria-label="选择教学周" data-ys="top-bar-week" @click="emit('pickWeek')">
            第 {{ week }} 周 <i class="ys-topbar__caret" aria-hidden="true" />
          </button>
          <span class="ys-topbar__spacer" />
          <slot name="tools" />
        </div>
        <div class="ys-topbar__panel-sub">
          <span v-if="dateRange">{{ dateRange }}</span>
          <span class="ys-topbar__progress">
            <i class="ys-topbar__progress-fill" :style="{ width: `${(week / totalWeeks) * 100}%` }" />
          </span>
          <span>{{ week }}/{{ totalWeeks }}</span>
          <span v-if="weatherText" class="ys-topbar__weather">{{ weatherText }}</span>
        </div>
      </div>
    </template>
  </header>
</template>

<style>
.ys-topbar {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
  padding: 4px 12px;
  overflow: hidden;
  background: color-mix(in srgb, var(--ys-surface-1) 94%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--ys-border);
}

.ys-topbar--compact { min-height: 36px; }
.ys-topbar--standard { min-height: 46px; }
.ys-topbar--expanded { min-height: 74px; }

.ys-topbar__brand {
  display: flex;
  gap: 7px;
  align-items: baseline;
  min-width: 0;
}

.ys-topbar__eyebrow {
  flex: 0 0 auto;
  font-size: 10px;
  font-weight: 650;
  color: var(--ys-text-3);
}

.ys-topbar__week {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  white-space: nowrap;
  min-height: 34px;
  padding: 0;
  font: inherit;
  font-size: 21px;
  font-weight: 780;
  color: var(--ys-text-1);
  letter-spacing: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.ys-topbar__week--sm {
  min-height: 28px;
  font-size: 15px;
}

.ys-topbar__week:focus-visible {
  outline: 3px solid var(--ys-focus-ring);
  outline-offset: 2px;
}

.ys-topbar__caret {
  width: 0;
  height: 0;
  border-top: 5px solid currentcolor;
  border-right: 4px solid transparent;
  border-left: 4px solid transparent;
  opacity: 0.6;
}

.ys-topbar__range {
  overflow: hidden;
  font-size: 11px;
  color: var(--ys-text-3);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ys-topbar__spacer { flex: 1; }

.ys-topbar__panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.ys-topbar__panel-main {
  display: flex;
  gap: 7px;
  align-items: baseline;
}

.ys-topbar__panel-sub {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-bottom: 4px;
  font-size: 10px;
  color: var(--ys-text-3);
}

.ys-topbar__progress {
  position: relative;
  flex: 1;
  max-width: 120px;
  height: 4px;
  overflow: hidden;
  background: var(--ys-surface-2);
  border-radius: 2px;
}

.ys-topbar__progress-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--ys-accent);
  border-radius: 2px;
  transition: width 300ms ease;
}

.ys-topbar__weather {
  padding: 1px 6px;
  background: var(--ys-surface-2);
  border-radius: 5px;
}
</style>
