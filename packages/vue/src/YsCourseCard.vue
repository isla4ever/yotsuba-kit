<script setup lang="ts">
// 忠实复刻微信公众号网页版 ScheduleCourseCard 的视觉规范：
// 状态徽标（补班/非本周）置顶居中、周数绝对定位卡底、非本周置灰降层、
// 补班卡警示色混合、自定义课程虚线边框、单节课紧凑排版。
import type { DisplayCourse } from '@yotsuba/schedule-core'
import { computed } from 'vue'

const props = defineProps<{
  course: DisplayCourse
  color: string
  inactiveBadge: string
  makeupBadge: string
}>()

defineEmits<{ select: [course: DisplayCourse] }>()

const isMakeup = computed(() => Boolean(props.course.makeup))
const active = computed(() => isMakeup.value || props.course.active)
const status = computed(() => (isMakeup.value ? props.makeupBadge : active.value ? '' : props.inactiveBadge))
const sectionSpan = computed(() => Math.max(1, props.course.endSection - props.course.startSection + 1))
const parityLabel = computed(() =>
  props.course.parity === 'odd' ? '单周' : props.course.parity === 'even' ? '双周' : '每周',
)
</script>

<template>
  <button
    type="button"
    class="ys-course-card"
    :class="{
      'is-active': active,
      'is-muted': !active,
      'is-custom': course.custom,
      'is-makeup': isMakeup,
      'is-single-section': sectionSpan === 1,
      'has-status': Boolean(status),
    }"
    :style="{ '--ys-course-color': color }"
    :aria-label="`${course.name}，${course.location || '地点待定'}，第${course.startSection}到${course.endSection}节，${status || parityLabel}`"
    @click.stop="$emit('select', course)"
  >
    <span v-if="status" class="ys-course-card__status">{{ status }}</span>
    <span class="ys-course-card__content">
      <strong>{{ course.name }}</strong>
      <span v-if="course.location" class="ys-course-card__room">@{{ course.location }}</span>
    </span>
    <span class="ys-course-card__weeks">({{ course.startWeek }}-{{ course.endWeek }}周)</span>
  </button>
</template>

<style>
.ys-course-card {
  position: relative;
  z-index: 3;
  display: block;
  box-sizing: border-box;
  width: calc(100% - 8px);
  min-width: 0;
  height: calc(100% - 8px);
  min-height: 0;
  padding: 5px 5px 18px;
  margin: 4px;
  overflow: hidden;
  font: inherit;
  color: #fff;
  text-align: center;
  letter-spacing: 0;
  cursor: pointer;
  background: var(--ys-course-color);
  border: 1px solid color-mix(in srgb, var(--ys-course-color) 28%, transparent);
  border-radius: 8px;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--ys-course-color) 22%, transparent);
  transition:
    background-color 260ms ease,
    border-color 260ms ease,
    color 260ms ease,
    box-shadow 260ms ease,
    opacity 220ms ease,
    transform 180ms ease;
  transform-origin: 50% 60%;
}

.ys-course-card:active {
  transform: scale(0.975);
}

.ys-course-card:focus-visible {
  outline: 3px solid var(--ys-focus-ring);
  outline-offset: -3px;
}

.ys-course-card.is-active {
  z-index: 5;
}

.ys-course-card__content {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.ys-course-card.has-status .ys-course-card__content {
  padding-top: 10px;
}

.ys-course-card strong {
  display: -webkit-box;
  width: 100%;
  max-height: 3.6em;
  overflow: hidden;
  font-size: 12px;
  font-weight: 760;
  line-height: 1.22;
  text-overflow: ellipsis;
  -webkit-line-clamp: 3;
  word-break: break-word;
  overflow-wrap: break-word;
  -webkit-box-orient: vertical;
}

.ys-course-card__room,
.ys-course-card__weeks {
  width: 100%;
  overflow: hidden;
  font-size: 9px;
  line-height: 1.2;
  text-overflow: ellipsis;
  opacity: 0.86;
}

.ys-course-card__room {
  display: -webkit-box;
  max-height: 2.4em;
  -webkit-line-clamp: 2;
  word-break: break-all;
  overflow-wrap: anywhere;
  white-space: normal;
  -webkit-box-orient: vertical;
}

.ys-course-card__weeks {
  position: absolute;
  right: 0;
  bottom: 3px;
  left: 0;
  z-index: 4;
  padding: 1px 2px 0;
  font-size: 8px;
  line-height: 1.15;
  text-align: center;
  white-space: nowrap;
}

.ys-course-card__status {
  position: absolute;
  top: 3px;
  left: 50%;
  min-width: 34px;
  padding: 1px 2px;
  font-size: 7px;
  font-weight: 750;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  background: rgb(0 0 0 / 34%);
  border-radius: 3px;
  transform: translateX(-50%);
}

.ys-course-card.is-single-section {
  padding: 4px 4px 15px;
}

.ys-course-card.is-single-section.has-status .ys-course-card__content {
  padding-top: 8px;
}

.ys-course-card.is-single-section strong {
  font-size: 10px;
  line-height: 1.15;
  -webkit-line-clamp: 2;
}

.ys-course-card.is-single-section .ys-course-card__room {
  display: none;
}

.ys-course-card.is-single-section .ys-course-card__weeks {
  bottom: 2px;
  font-size: 7px;
}

.ys-course-card.is-muted {
  z-index: 2;
  color: var(--ys-text-2);
  background: var(--ys-surface-3);
  border-color: var(--ys-border-strong);
  box-shadow: none;
}

.ys-course-card.is-muted .ys-course-card__status {
  color: var(--ys-text-1);
  background: var(--ys-surface-1);
}

.ys-course-card.is-custom {
  border-style: dashed;
}

.ys-course-card.is-makeup {
  z-index: 6;
  background: color-mix(in srgb, var(--ys-warning) 76%, var(--ys-course-color));
  border-color: color-mix(in srgb, var(--ys-warning) 76%, #fff);
  box-shadow: 0 5px 15px color-mix(in srgb, var(--ys-warning) 30%, transparent);
}
</style>
