<script setup lang="ts">
// 内置课程详情：重叠课先选后看;展示天气/携带物品/备注;
// 可编辑模式下提供 编辑 与 两段确认删除;信息区可用 slot 深度替换/追加
import type { DetailAction, DetailField, DetailHero, DetailLayout, DisplayCourse, WeatherKind } from '@iyotsuba/schedule-core'
import { courseCarryItems } from '@iyotsuba/schedule-core'
import { computed, ref, watch } from 'vue'
import YsSheet from './YsSheet.vue'
import YsWeatherGlyph from './YsWeatherGlyph.vue'

const DEFAULT_FIELDS: DetailField[] = ['time', 'weeks', 'location', 'teacher', 'weather', 'materials', 'tasks', 'note']

const props = defineProps<{
  open: boolean
  stack: DisplayCourse[]
  colorFor: (name: string, explicit?: string) => string
  editable?: boolean
  /** 该课程当日天气文案（宿主/YsSchedule 计算好传入） */
  weatherText?: string
  /** 该课程日期的温度或温区间。 */
  weatherTemperature?: string
  /** hero 风格：课程色 / 当日天气渐变 / 极简 */
  hero?: DetailHero
  /** 字段显隐与顺序（去重,未知项忽略） */
  fields?: DetailField[]
  /** 默认只在 editable 时显示编辑/删除；显式传入后由宿主完整控制 */
  actions?: DetailAction[]
  /** 详情信息密度 */
  layout?: DetailLayout
  /** 在详情 Header 显示信息密度切换按钮 */
  adjustableLayout?: boolean
  weatherKind?: WeatherKind
  /** 所有空字段的默认提示词。 */
  emptyText?: string
  /** 按字段覆盖空提示词。 */
  emptyTexts?: Partial<Record<DetailField, string>>
  vars?: Record<string, string>
}>()

const emit = defineEmits<{
  close: []
  edit: [course: DisplayCourse]
  remove: [course: DisplayCourse]
  share: [course: DisplayCourse]
  layoutChange: [layout: DetailLayout]
}>()

const selectedId = ref<string | null>(null)
const confirmingRemove = ref(false)
const localLayout = ref<DetailLayout>(props.layout ?? 'standard')

watch(() => props.open, (open) => {
  if (open) {
    selectedId.value = props.stack.length === 1 ? props.stack[0]!.displayId : null
    confirmingRemove.value = false
  }
})

watch(selectedId, () => {
  confirmingRemove.value = false
})

watch(() => props.layout, (layout) => {
  localLayout.value = layout ?? 'standard'
})

const course = computed(() =>
  props.stack.find(item => item.displayId === selectedId.value) ?? null,
)

const parityLabel = (item: DisplayCourse) =>
  item.parity === 'odd' ? '单周' : item.parity === 'even' ? '双周' : '每周'

const requestedFields = computed<DetailField[]>(() => props.fields?.length ? props.fields : DEFAULT_FIELDS)

const visibleFields = computed<DetailField[]>(() => {
  const allowed: DetailField[] = localLayout.value === 'compact'
    ? ['time', 'location']
    : localLayout.value === 'standard'
      ? ['time', 'weeks', 'location', 'teacher', 'materials', 'tasks']
      : DEFAULT_FIELDS
  return [...new Set(requestedFields.value)].filter(field =>
    field !== 'weather' && DEFAULT_FIELDS.includes(field) && allowed.includes(field),
  )
})

const showHeroWeather = computed(() =>
  requestedFields.value.includes('weather')
  && props.weatherKind
  && props.weatherKind !== 'neutral'
  && Boolean(props.weatherTemperature?.trim() || props.weatherText?.trim()),
)

const visibleActions = computed<DetailAction[]>(() => {
  const source = props.actions ?? (props.editable ? ['edit', 'remove'] : [])
  return [...new Set(source)].filter(action => ['share', 'edit', 'remove'].includes(action))
})

const weatherTint = computed(() => {
  const tint: Record<WeatherKind, string> = {
    clear: '#f2a93c', cloudy: '#8fa3bd', overcast: '#76889f', fog: '#9aa8b8',
    drizzle: '#5b8cc9', rain: '#3f74b8', 'heavy-rain': '#315f98', storm: '#5a5f9e', snow: '#7fb6dd', neutral: '#8793a3',
  }
  return tint[props.weatherKind ?? 'neutral']
})

const courseColor = computed(() => {
  const item = course.value
  return item ? props.colorFor(item.name, item.color) : '#8793a3'
})

const carryItems = computed(() => course.value ? courseCarryItems(course.value) : [])

const fieldLabels: Record<DetailField, string> = {
  time: '时间', weeks: '周次', location: '地点', teacher: '教师', weather: '当日天气',
  materials: '教材与携带', tasks: '课程任务', note: '备注',
}

function emptyFor(field: DetailField): string {
  return props.emptyTexts?.[field] ?? props.emptyText ?? '暂无信息'
}

function fieldText(field: DetailField, item: DisplayCourse): string {
  if (field === 'time') {
    return `周${['一', '二', '三', '四', '五', '六', '日'][item.weekday - 1]} 第${item.startSection}-${item.endSection}节`
  }
  if (field === 'weeks') {
    return `${item.startWeek}-${item.endWeek}周（${parityLabel(item)}）`
  }
  if (field === 'location') {
    return item.location?.trim() || emptyFor(field)
  }
  if (field === 'teacher') {
    return item.teacher?.trim() || emptyFor(field)
  }
  if (field === 'note') {
    return item.note?.trim() || emptyFor(field)
  }
  return emptyFor(field)
}

function fieldClass(field: DetailField) {
  return {
    'ys-detail__note-row': field === 'note',
    'ys-detail__materials-row': field === 'materials',
    'ys-detail__tasks-row': field === 'tasks',
  }
}

const detailStyle = computed(() => ({
  '--ys-detail-weather': weatherTint.value,
  '--ys-detail-course': courseColor.value,
}))

const heroStyle = computed(() => {
  const item = course.value
  if (!item) {
    return {}
  }
  const color = courseColor.value
  if (props.hero === 'plain') {
    return {}
  }
  if (props.hero === 'weather' && props.weatherKind) {
    return {
      background: `linear-gradient(128deg, ${weatherTint.value} 0%, color-mix(in srgb, ${weatherTint.value} 55%, ${color}) 100%)`,
    }
  }
  return { background: color }
})

function requestRemove() {
  if (!confirmingRemove.value) {
    confirmingRemove.value = true
    return
  }
  emit('remove', course.value!)
}

const layoutLabels: Record<DetailLayout, string> = {
  compact: '精简',
  standard: '适中',
  full: '全面',
}

function cycleLayout() {
  const layouts: DetailLayout[] = ['compact', 'standard', 'full']
  const next = layouts[(layouts.indexOf(localLayout.value) + 1) % layouts.length]!
  localLayout.value = next
  emit('layoutChange', next)
}
</script>

<template>
  <YsSheet kind="courseDetail" :open="open" :title="course ? '课程详情' : '选择课程'" :vars="vars" @close="emit('close')">
    <template #header-tools>
      <button
        v-if="course && adjustableLayout"
        type="button"
        class="ys-sheet__tool ys-detail__layout-switch"
        :aria-label="`切换详情布局，当前${layoutLabels[localLayout]}`"
        :title="`详情布局：${layoutLabels[localLayout]}`"
        @click="cycleLayout"
      >
        <i :class="`is-${localLayout}`" aria-hidden="true" />
      </button>
    </template>
    <Transition name="ys-detail-swap" mode="out-in" appear>
      <!-- 重叠课程：先选择 -->
      <ul v-if="!course" key="course-stack" class="ys-detail__stack">
        <li v-for="item in stack" :key="item.displayId">
          <button type="button" class="ys-detail__stack-item" @click="selectedId = item.displayId">
            <i class="ys-detail__dot" :style="{ background: colorFor(item.name, item.color) }" />
            <span class="ys-detail__stack-name">{{ item.name }}</span>
            <span class="ys-detail__stack-meta">{{ item.startWeek }}-{{ item.endWeek }}周 · {{ parityLabel(item) }}</span>
          </button>
        </li>
      </ul>

      <div
        v-else
        key="course-detail"
        class="ys-detail"
        :class="[`is-layout-${localLayout}`, { 'is-weather-linked': weatherKind && weatherKind !== 'neutral' }]"
        :style="detailStyle"
      >
      <div class="ys-detail__hero" :class="`is-${hero ?? 'color'}`" :style="heroStyle">
        <i v-if="hero === 'plain'" class="ys-detail__plain-dot" :style="{ background: colorFor(course.name, course.color) }" />
        <div class="ys-detail__hero-copy">
          <strong>{{ course.name }}</strong>
          <div class="ys-detail__hero-meta">
            <small>{{ [course.teacher, course.location].filter(Boolean).join(' · ') || (emptyText ?? '暂无信息') }}</small>
            <span v-if="course.makeup" class="ys-detail__badge">补班</span>
            <span v-else-if="!course.active" class="ys-detail__badge">非本周</span>
          </div>
        </div>
        <div
          v-if="showHeroWeather"
          class="ys-detail__hero-weather"
          :aria-label="[weatherText, weatherTemperature].filter(Boolean).join('，')"
        >
          <YsWeatherGlyph :kind="weatherKind!" :size="34" :label="weatherText" />
          <span>
            <b>{{ weatherTemperature || weatherText }}</b>
            <small v-if="weatherTemperature && weatherText">{{ weatherText }}</small>
          </span>
        </div>
      </div>

      <div class="ys-detail__status" :class="{ 'is-inactive': !course.active }">
        <i aria-hidden="true" />
        <span>{{ course.active ? '本周正常上课' : '本周无课' }}</span>
      </div>

      <dl class="ys-detail__grid">
        <div v-for="field in visibleFields" :key="field" :class="fieldClass(field)">
          <slot name="detail-field" :field="field" :label="fieldLabels[field]" :course="course" :empty-text="emptyFor(field)">
            <dt>{{ fieldLabels[field] }}</dt>
            <dd v-if="field === 'materials'" class="ys-detail__chips">
              <template v-if="carryItems.length">
                <span v-for="item in carryItems" :key="item.id ?? `${item.kind}-${item.name}`" class="ys-detail__chip">
                  {{ item.name }}<small v-if="item.quantity && item.quantity > 1"> ×{{ item.quantity }}</small>
                </span>
              </template>
              <span v-else class="ys-detail__empty-value">{{ emptyFor(field) }}</span>
            </dd>
            <dd v-else-if="field === 'tasks'" class="ys-detail__tasks">
              <template v-if="course.tasks?.length">
                <span v-for="task in course.tasks" :key="task.id" :class="{ 'is-done': task.done }">
                  <i aria-hidden="true">{{ task.done ? '✓' : '○' }}</i>
                  <b>{{ task.title }}</b>
                  <small v-if="task.dueAt">{{ task.dueAt }}</small>
                </span>
              </template>
              <span v-else class="ys-detail__empty-value">{{ emptyFor(field) }}</span>
            </dd>
            <dd v-else>{{ fieldText(field, course) }}</dd>
          </slot>
        </div>
      </dl>

      <!-- 宿主追加内容（作业、计划等） -->
      <slot name="detail-extra" :course="course" />

      <div class="ys-detail__actions">
        <slot name="detail-actions" :course="course" :close="() => emit('close')">
          <template v-if="visibleActions.length">
            <button v-if="visibleActions.includes('share')" type="button" class="ys-detail__btn ys-detail__btn--primary" @click="emit('share', course!)">分享课程</button>
            <button v-if="visibleActions.includes('edit')" type="button" class="ys-detail__btn ys-detail__btn--ghost" @click="emit('edit', course!)">编辑</button>
            <button
              v-if="visibleActions.includes('remove')"
              type="button"
              class="ys-detail__btn"
              :class="confirmingRemove ? 'ys-detail__btn--danger-solid' : 'ys-detail__btn--danger'"
              @click="requestRemove"
            >
              {{ confirmingRemove ? '确认删除？' : '删除' }}
            </button>
          </template>
        </slot>
      </div>
      </div>
    </Transition>
  </YsSheet>
</template>

<style>
.ys-detail__layout-switch > i {
  display: grid;
  width: 14px;
  height: 12px;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
}

.ys-detail__layout-switch > i::before,
.ys-detail__layout-switch > i::after {
  content: '';
  background: currentcolor;
  border-radius: 1px;
}

.ys-detail__layout-switch > i.is-compact { grid-template-columns: 1fr; }
.ys-detail__layout-switch > i.is-full { grid-template-rows: repeat(2, 1fr); }

.ys-detail {
  position: relative;
  min-width: 0;
}

.ys-detail.is-weather-linked {
  padding: 10px;
  margin: 0 -8px -8px;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--ys-detail-weather) 17%, var(--ys-surface-1)) 0%,
      color-mix(in srgb, var(--ys-detail-course) 7%, var(--ys-surface-1)) 42%,
      var(--ys-surface-1) 100%
    );
  border-radius: 10px;
}

.ys-detail__stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
  margin: 0;
  list-style: none;
}

.ys-detail-swap-enter-active,
.ys-detail-swap-leave-active {
  transition: opacity 180ms ease, transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.ys-detail-swap-enter-from { opacity: 0; transform: translate3d(18px, 0, 0) scale(0.985); }
.ys-detail-swap-leave-to { opacity: 0; transform: translate3d(-12px, 0, 0) scale(0.99); }

.ys-detail__stack-item {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 11px 12px;
  font: inherit;
  color: var(--ys-text-1);
  text-align: left;
  cursor: pointer;
  background: var(--ys-surface-2);
  border: 1px solid var(--ys-border);
  border-radius: 9px;
}

.ys-detail__dot {
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.ys-detail__stack-name { font-weight: 700; }

.ys-detail__stack-meta {
  margin-left: auto;
  font-size: 11px;
  color: var(--ys-text-3);
}

.ys-detail__hero {
  display: flex;
  gap: 8px;
  align-items: center;
  min-height: 72px;
  padding: 14px;
  margin-top: 4px;
  color: #fff;
  border-radius: 10px;
}

.ys-detail__hero-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.ys-detail__hero-meta {
  display: flex;
  gap: 6px;
  align-items: center;
  min-width: 0;
}

.ys-detail__hero-meta > small { flex: 0 1 auto; }

.ys-detail__hero strong { font-size: 18px; font-weight: 780; }

.ys-detail__hero small {
  overflow: hidden;
  font-size: 11px;
  color: rgb(255 255 255 / 82%);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ys-detail__hero-weather {
  display: flex;
  flex: 0 0 auto;
  gap: 6px;
  align-items: center;
  align-self: flex-start;
  justify-content: flex-end;
  min-width: 78px;
  margin-left: auto;
  color: #fff;
}

.ys-detail__hero-weather > span {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 0;
}

.ys-detail__hero-weather b {
  font-size: 14px;
  line-height: 1.05;
  white-space: nowrap;
}

.ys-detail__hero-weather small {
  max-width: 60px;
  font-size: 9px;
  color: rgb(255 255 255 / 76%);
}

.ys-detail__badge {
  flex: 0 0 auto;
  padding: 1px 6px;
  font-size: 10px;
  background: rgb(0 0 0 / 30%);
  border-radius: 4px;
  white-space: nowrap;
}

/* plain 极简 hero：去卡片化,课程色只留圆点 */
.ys-detail__hero.is-plain {
  padding: 6px 2px 12px;
  color: var(--ys-text-1);
  background: transparent;
  border-bottom: 1px solid var(--ys-border);
  border-radius: 0;
}

.ys-detail__hero.is-plain small { color: var(--ys-text-3); }

.ys-detail__hero.is-plain .ys-detail__badge {
  color: var(--ys-text-2);
  background: var(--ys-surface-2);
}

.ys-detail__hero.is-plain .ys-detail__hero-weather {
  color: var(--ys-text-1);
}

.ys-detail__hero.is-plain .ys-detail__hero-weather small { color: var(--ys-text-3); }

.ys-detail__plain-dot {
  align-self: center;
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.ys-detail__status {
  display: flex;
  gap: 7px;
  align-items: center;
  min-height: 34px;
  padding: 7px 10px;
  margin-top: 10px;
  font-size: 12px;
  font-weight: 650;
  color: var(--ys-success);
  background: color-mix(in srgb, var(--ys-success) 8%, var(--ys-surface-1));
  border: 1px solid color-mix(in srgb, var(--ys-success) 22%, var(--ys-border));
  border-radius: 8px;
}

.ys-detail__status > i {
  width: 7px;
  height: 7px;
  background: currentcolor;
  border-radius: 50%;
}

.ys-detail__status.is-inactive {
  color: var(--ys-text-3);
  background: var(--ys-surface-2);
  border-color: var(--ys-border);
}

.ys-detail__materials-row .ys-detail__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 4px 0 0;
}

.ys-detail__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  margin: 12px 0 0;
  padding: 1px;
  background: var(--ys-border);
  border: 1px solid var(--ys-border);
  border-radius: 8px;
}

.ys-detail__grid > div {
  min-width: 0;
  padding: 10px;
  background: color-mix(in srgb, var(--ys-surface-1) 94%, transparent);
}

.ys-detail__grid > .ys-detail__note-row,
.ys-detail__grid > .ys-detail__materials-row,
.ys-detail__grid > .ys-detail__tasks-row { grid-column: 1 / -1; }

.ys-detail__grid dt,
.ys-detail__materials dt {
  font-size: 10px;
  color: var(--ys-text-3);
}

.ys-detail__grid dd {
  overflow-wrap: anywhere;
  margin: 3px 0 0;
  font-size: 13px;
  line-height: 1.35;
}

.ys-detail__materials { margin-top: 10px; }

.ys-detail__chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }

.ys-detail__chip {
  padding: 4px 9px;
  font-size: 12px;
  background: var(--ys-accent-soft);
  border-radius: 6px;
}

.ys-detail__chip small { font-size: 9px; opacity: 0.72; }

.ys-detail__tasks {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ys-detail__tasks > span:not(.ys-detail__empty-value) {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr) auto;
  gap: 6px;
  align-items: center;
  min-width: 0;
  padding: 6px 8px;
  background: var(--ys-surface-2);
  border-radius: 6px;
}

.ys-detail__tasks i { font-style: normal; color: var(--ys-accent); }
.ys-detail__tasks b { overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.ys-detail__tasks small { font-size: 9px; color: var(--ys-text-3); }
.ys-detail__tasks > span.is-done { opacity: 0.58; }
.ys-detail__tasks > span.is-done b { text-decoration: line-through; }
.ys-detail__empty-value { color: var(--ys-text-3); }

.ys-detail__actions { display: flex; gap: 8px; margin-top: 14px; }

.ys-detail.is-layout-compact .ys-detail__hero {
  min-height: 54px;
  padding: 10px 12px;
}

.ys-detail.is-layout-compact .ys-detail__hero strong { font-size: 16px; }
.ys-detail.is-layout-compact .ys-detail__hero-weather { min-width: 72px; }
.ys-detail.is-layout-compact .ys-detail__status { min-height: 30px; padding-block: 5px; margin-top: 7px; }
.ys-detail.is-layout-compact .ys-detail__grid { margin-top: 7px; }
.ys-detail.is-layout-compact .ys-detail__grid > div { padding: 8px; }
.ys-detail.is-layout-compact .ys-detail__actions { margin-top: 9px; }

.ys-detail.is-layout-full .ys-detail__hero { min-height: 88px; padding: 18px 16px; }
.ys-detail.is-layout-full .ys-detail__hero strong { font-size: 20px; }
.ys-detail.is-layout-full .ys-detail__grid > div { padding: 12px; }

.ys-detail__btn {
  flex: 1;
  padding: 10px 0;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 0;
  border-radius: 9px;
  transition: background-color 160ms ease, color 160ms ease;
}

.ys-detail__btn--ghost { color: var(--ys-text-2); background: var(--ys-surface-2); }
.ys-detail__btn--primary { color: #fff; background: var(--ys-accent); }

.ys-detail__btn--danger {
  color: var(--ys-danger);
  background: color-mix(in srgb, var(--ys-danger) 10%, transparent);
}

.ys-detail__btn--danger-solid { color: #fff; background: var(--ys-danger); }

@media (prefers-reduced-motion: reduce) {
  .ys-detail-swap-enter-active,
  .ys-detail-swap-leave-active { transition-duration: 1ms; }
}
</style>
