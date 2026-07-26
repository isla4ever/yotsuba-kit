<script setup lang="ts">
// 内置课程表单（新增/编辑）：微信版能力复刻 + 更高自由度
// 字段：名称/地点/教师/星期/节次/周次/单双周/颜色/携带物品/备注,冲突实时提示
import type { Course, ThemeTokens } from '@iyotsuba/schedule-core'
import { findConflicts } from '@iyotsuba/schedule-core'
import { computed, reactive, watch } from 'vue'
import YsSheet from './YsSheet.vue'

const props = defineProps<{
  open: boolean
  /** 编辑时传入原课程；新增时可传 prefill（如拖选的星期与节次） */
  initial?: Partial<Course> | null
  courses: Course[]
  totalWeeks: number
  tokens: ThemeTokens
  vars?: Record<string, string>
  weekdayLabels: string[]
}>()

const emit = defineEmits<{
  close: []
  submit: [course: Course]
}>()

const isEdit = computed(() => Boolean(props.initial?.id))

const form = reactive({
  name: '',
  location: '',
  teacher: '',
  weekday: 1,
  startSection: 1,
  endSection: 2,
  startWeek: 1,
  endWeek: 20,
  parity: 'every' as NonNullable<Course['parity']>,
  color: '' as string,
  materials: '',
  note: '',
})

watch(() => props.open, (open) => {
  if (!open) {
    return
  }
  const source = props.initial ?? {}
  form.name = source.name ?? ''
  form.location = source.location ?? ''
  form.teacher = source.teacher ?? ''
  form.weekday = source.weekday ?? 1
  form.startSection = source.startSection ?? 1
  form.endSection = source.endSection ?? Math.max(2, source.startSection ?? 2)
  form.startWeek = source.startWeek ?? 1
  form.endWeek = source.endWeek ?? props.totalWeeks
  form.parity = source.parity ?? 'every'
  form.color = source.color ?? ''
  form.materials = (source.materials ?? []).join('、')
  form.note = source.note ?? ''
})

const conflicts = computed(() => {
  if (!form.name.trim()) {
    return []
  }
  return findConflicts(
    {
      weekday: form.weekday,
      startSection: Math.min(form.startSection, form.endSection),
      endSection: Math.max(form.startSection, form.endSection),
      startWeek: Math.min(form.startWeek, form.endWeek),
      endWeek: Math.max(form.startWeek, form.endWeek),
      parity: form.parity,
    },
    props.courses,
    props.initial?.id,
  )
})

const valid = computed(() => form.name.trim().length > 0)

function submit() {
  if (!valid.value) {
    return
  }
  emit('submit', {
    id: props.initial?.id ?? `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: form.name.trim(),
    location: form.location.trim() || undefined,
    teacher: form.teacher.trim() || undefined,
    weekday: form.weekday,
    startSection: Math.min(form.startSection, form.endSection),
    endSection: Math.max(form.startSection, form.endSection),
    startWeek: Math.min(form.startWeek, form.endWeek),
    endWeek: Math.max(form.startWeek, form.endWeek),
    parity: form.parity,
    color: form.color || undefined,
    materials: form.materials.split(/[、,，]/).map(item => item.trim()).filter(Boolean),
    note: form.note.trim() || undefined,
    custom: props.initial?.custom ?? true,
    meta: props.initial?.meta,
  })
}
</script>

<template>
  <YsSheet :open="open" :title="isEdit ? '编辑课程' : '新增课程'" :vars="vars" @close="emit('close')">
    <div class="ys-form">
      <label class="ys-form__field ys-form__field--full">
        <span>课程名称 *</span>
        <input v-model="form.name" type="text" placeholder="如：高等数学">
      </label>
      <label class="ys-form__field">
        <span>地点</span>
        <input v-model="form.location" type="text" placeholder="教1-201">
      </label>
      <label class="ys-form__field">
        <span>教师</span>
        <input v-model="form.teacher" type="text" placeholder="选填">
      </label>

      <label class="ys-form__field">
        <span>星期</span>
        <select v-model.number="form.weekday">
          <option v-for="(label, index) in weekdayLabels" :key="index" :value="index + 1">周{{ label }}</option>
        </select>
      </label>
      <div class="ys-form__field">
        <span>节次</span>
        <div class="ys-form__pair">
          <input v-model.number="form.startSection" type="number" min="1" max="14">
          <i>-</i>
          <input v-model.number="form.endSection" type="number" min="1" max="14">
        </div>
      </div>
      <div class="ys-form__field">
        <span>周次</span>
        <div class="ys-form__pair">
          <input v-model.number="form.startWeek" type="number" min="1" :max="totalWeeks">
          <i>-</i>
          <input v-model.number="form.endWeek" type="number" min="1" :max="totalWeeks">
        </div>
      </div>
      <div class="ys-form__field">
        <span>单双周</span>
        <div class="ys-form__seg">
          <button v-for="option in ([['every', '每周'], ['odd', '单周'], ['even', '双周']] as const)" :key="option[0]" type="button" :class="{ 'is-active': form.parity === option[0] }" @click="form.parity = option[0]">
            {{ option[1] }}
          </button>
        </div>
      </div>

      <div class="ys-form__field ys-form__field--full">
        <span>颜色（默认自动分配）</span>
        <div class="ys-form__colors">
          <button
            type="button"
            class="ys-form__color ys-form__color--auto"
            :class="{ 'is-active': !form.color }"
            aria-label="自动配色"
            @click="form.color = ''"
          >A</button>
          <button
            v-for="swatch in tokens.coursePalette"
            :key="swatch"
            type="button"
            class="ys-form__color"
            :class="{ 'is-active': form.color === swatch }"
            :style="{ background: swatch }"
            :aria-label="swatch"
            @click="form.color = swatch"
          />
        </div>
      </div>

      <label class="ys-form__field ys-form__field--full">
        <span>携带物品（顿号分隔，详情与今日板块提醒"记得带"）</span>
        <input v-model="form.materials" type="text" placeholder="教材、实验服、计算器">
      </label>
      <label class="ys-form__field ys-form__field--full">
        <span>备注</span>
        <input v-model="form.note" type="text" placeholder="选填">
      </label>

      <p v-if="conflicts.length" class="ys-form__conflict">
        ⚠ 与 {{ conflicts.map(item => item.name).join('、') }} 时间重叠，保存后将以重叠课展示
      </p>

      <div class="ys-form__actions">
        <button type="button" class="ys-form__btn ys-form__btn--ghost" @click="emit('close')">取消</button>
        <button type="button" class="ys-form__btn ys-form__btn--primary" :disabled="!valid" @click="submit">
          {{ isEdit ? '保存修改' : '添加课程' }}
        </button>
      </div>
    </div>
  </YsSheet>
</template>

<style>
.ys-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
  padding: 6px 0 2px;
}

.ys-form__field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.ys-form__field--full { grid-column: span 2; }

.ys-form__field > span {
  font-size: 11px;
  color: var(--ys-text-3);
}

.ys-form input,
.ys-form select {
  box-sizing: border-box;
  width: 100%;
  padding: 8px 10px;
  font: inherit;
  font-size: 13px;
  color: var(--ys-text-1);
  background: var(--ys-surface-2);
  border: 1px solid var(--ys-border);
  border-radius: 8px;
  outline: none;
}

.ys-form input:focus,
.ys-form select:focus {
  border-color: var(--ys-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ys-accent) 18%, transparent);
}

.ys-form__pair { display: flex; gap: 6px; align-items: center; min-width: 0; }

.ys-form__pair input { min-width: 0; flex: 1; }
.ys-form__pair i { color: var(--ys-text-3); font-style: normal; }

.ys-form__seg {
  display: flex;
  overflow: hidden;
  border: 1px solid var(--ys-border);
  border-radius: 8px;
}

.ys-form__seg button {
  flex: 1;
  padding: 8px 0;
  font: inherit;
  font-size: 12px;
  color: var(--ys-text-2);
  cursor: pointer;
  background: var(--ys-surface-2);
  border: 0;
}

.ys-form__seg button.is-active {
  color: #fff;
  background: var(--ys-accent);
}

.ys-form__colors { display: flex; flex-wrap: wrap; gap: 8px; }

.ys-form__color {
  width: 26px;
  height: 26px;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 50%;
}

.ys-form__color.is-active {
  border-color: var(--ys-text-1);
  box-shadow: 0 0 0 2px var(--ys-surface-1) inset;
}

.ys-form__color--auto {
  font-size: 11px;
  font-weight: 800;
  color: var(--ys-text-2);
  background: var(--ys-surface-2);
  border: 1px dashed var(--ys-border-strong);
}

.ys-form__conflict {
  grid-column: span 2;
  padding: 7px 10px;
  margin: 0;
  font-size: 12px;
  color: var(--ys-warning);
  background: color-mix(in srgb, var(--ys-warning) 10%, transparent);
  border-radius: 8px;
}

.ys-form__actions {
  display: flex;
  grid-column: span 2;
  gap: 10px;
  margin-top: 4px;
}

.ys-form__btn {
  flex: 1;
  padding: 11px 0;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: 0;
  border-radius: 9px;
}

.ys-form__btn--ghost { color: var(--ys-text-2); background: var(--ys-surface-2); }
.ys-form__btn--primary { color: #fff; background: var(--ys-accent); }
.ys-form__btn--primary:disabled { cursor: not-allowed; opacity: 0.5; }
</style>
