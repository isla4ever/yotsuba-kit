<script setup lang="ts">
// 忠实复刻微信公众号网页版 ScheduleCourseCard 的视觉规范：
// 状态徽标（补班/非本周）置顶居中、周数绝对定位卡底、非本周置灰降层、
// 补班卡警示色混合、自定义课程虚线边框、单节课紧凑排版。
import type { DisplayCourse } from '@iyotsuba/schedule-core'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  course: DisplayCourse
  color: string
  inactiveBadge: string
  makeupBadge: string
  /** 界面密度：minimal 仅名称 / normal 现状 / rich 加教师与携带提示 */
  density?: 'minimal' | 'normal' | 'rich'
}>(), {
  density: 'normal',
})

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
    :style="{ '--ys-course-color': color, '--fx-seed': (course.weekday * 2 + course.startSection) % 5 }"
    :aria-label="`${course.name}，${course.location || '地点待定'}，第${course.startSection}到${course.endSection}节，${status || parityLabel}`"
    @click.stop="$emit('select', course)"
  >
    <span v-if="status" class="ys-course-card__status">{{ status }}</span>
    <span class="ys-course-card__content">
      <strong>{{ course.name }}</strong>
      <span v-if="course.location && density !== 'minimal'" class="ys-course-card__room">@{{ course.location }}</span>
      <span v-if="density === 'rich' && course.teacher" class="ys-course-card__teacher">{{ course.teacher }}</span>
    </span>
    <span v-if="density === 'rich' && course.materials?.length" class="ys-course-card__gear" aria-label="有携带物品">🎒</span>
    <span v-if="density !== 'minimal'" class="ys-course-card__weeks">({{ course.startWeek }}-{{ course.endWeek }}周)</span>
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

/* ---------- 密度适配 ---------- */
.ys-density-minimal .ys-course-card { padding: 4px; }
.ys-density-minimal .ys-course-card strong { font-size: 11px; -webkit-line-clamp: 4; }

.ys-course-card__teacher {
  width: 100%;
  overflow: hidden;
  font-size: 9px;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.78;
}

.ys-course-card__gear {
  position: absolute;
  top: 2px;
  right: 3px;
  font-size: 9px;
}

/* ---------- 卡片装饰特效（只作用本周卡,换周期间由宿主摘除属性,reduced-motion 关闭） ---------- */

/* shimmer 流光：伪元素条带 transform 扫过(合成器),5.6s 中 66% 静默 */
[data-ys-effect='shimmer'] .ys-course-card.is-active {
  --fx-shimmer-tint: rgb(255 255 255 / 10%);
  --fx-shimmer-peak: rgb(255 255 255 / 30%);
}

.ys-dark[data-ys-effect='shimmer'] .ys-course-card.is-active {
  --fx-shimmer-tint: rgb(255 255 255 / 6%);
  --fx-shimmer-peak: rgb(255 255 255 / 17%);
}

[data-ys-effect='shimmer'] .ys-course-card.is-active::after {
  position: absolute;
  inset: -20% auto -20% 0;
  width: 46%;
  content: "";
  pointer-events: none;
  background: linear-gradient(105deg, transparent 0%, var(--fx-shimmer-tint) 42%, var(--fx-shimmer-peak) 50%, var(--fx-shimmer-tint) 58%, transparent 100%);
  transform: translate3d(-180%, 0, 0) skewX(-16deg);
  will-change: transform;
}

/* glow 呼吸辉光：radial 预渲染柔光伪元素只动 opacity,光晕需溢出 */
[data-ys-effect='glow'] .ys-course-card.is-active {
  overflow: visible;
  --fx-glow-color: color-mix(in srgb, var(--ys-course-color) 55%, transparent);
  --fx-glow-min: 0.35;
  --fx-glow-max: 0.8;
}

.ys-dark[data-ys-effect='glow'] .ys-course-card.is-active {
  --fx-glow-color: color-mix(in srgb, var(--ys-course-color) 68%, transparent);
  --fx-glow-min: 0.22;
  --fx-glow-max: 0.55;
}

[data-ys-effect='glow'] .ys-course-card.is-active::before {
  position: absolute;
  inset: -9px;
  z-index: -1;
  content: "";
  pointer-events: none;
  background: radial-gradient(120% 120% at 50% 55%, var(--fx-glow-color) 0%, color-mix(in srgb, var(--fx-glow-color) 50%, transparent) 52%, transparent 76%);
  opacity: var(--fx-glow-min);
  will-change: opacity;
}

/* aurora 极光描边：mask 抠 1.5px 渐变环,只动 background-position(唯一每帧重绘者,慢速) */
[data-ys-effect='aurora'] .ys-course-card.is-active {
  border-color: transparent;
  --fx-aurora-c1: #1fa895;
  --fx-aurora-c2: #4f6ef0;
  --fx-aurora-c3: #9747e8;
  --fx-aurora-alpha: 0.95;
}

.ys-dark[data-ys-effect='aurora'] .ys-course-card.is-active {
  --fx-aurora-c1: #4fe3c1;
  --fx-aurora-c2: #7aa2ff;
  --fx-aurora-c3: #c887ff;
  --fx-aurora-alpha: 0.8;
}

[data-ys-effect='aurora'] .ys-course-card.is-active::before {
  position: absolute;
  inset: 0;
  z-index: 1;
  padding: 1.5px;
  content: "";
  pointer-events: none;
  background: linear-gradient(115deg, var(--fx-aurora-c1) 0%, var(--fx-aurora-c2) 32%, var(--fx-aurora-c3) 64%, var(--fx-aurora-c1) 100%);
  background-position: 0% 50%;
  background-size: 320% 320%;
  border-radius: inherit;
  opacity: var(--fx-aurora-alpha);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
}

@media (prefers-reduced-motion: no-preference) {
  [data-ys-effect='shimmer'] .ys-course-card.is-active::after {
    animation: ys-fx-shimmer 5.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    animation-delay: calc(var(--fx-seed, 0) * -0.8s);
  }

  [data-ys-effect='glow'] .ys-course-card.is-active::before {
    animation: ys-fx-glow 4.8s ease-in-out infinite;
    animation-delay: calc(var(--fx-seed, 0) * -0.9s);
  }

  [data-ys-effect='aurora'] .ys-course-card.is-active::before {
    animation: ys-fx-aurora 9s ease-in-out infinite;
    animation-delay: calc(var(--fx-seed, 0) * -1.3s);
  }

  [data-ys-effect='breathe'] .ys-course-card.is-active {
    transform-origin: 50% 50%;
    will-change: transform;
    animation: ys-fx-breathe 6s ease-in-out infinite;
    animation-delay: calc(var(--fx-seed, 0) * -1.1s);
    --fx-breathe-max: 1.012;
  }

  .ys-dark[data-ys-effect='breathe'] .ys-course-card.is-active {
    --fx-breathe-max: 1.016;
  }

  /* 归还按压反馈 */
  [data-ys-effect='breathe'] .ys-course-card.is-active:active {
    animation: none;
  }
}

@keyframes ys-fx-shimmer {
  0% { transform: translate3d(-180%, 0, 0) skewX(-16deg); }
  34% { transform: translate3d(360%, 0, 0) skewX(-16deg); }
  100% { transform: translate3d(360%, 0, 0) skewX(-16deg); }
}

@keyframes ys-fx-glow {
  0%, 100% { opacity: var(--fx-glow-min); }
  50% { opacity: var(--fx-glow-max); }
}

@keyframes ys-fx-aurora {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes ys-fx-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(var(--fx-breathe-max, 1.012)); }
}

/* 极低端设备:关闭唯一的每帧重绘特效 */
@media (update: slow) {
  [data-ys-effect='aurora'] .ys-course-card.is-active::before {
    animation: none;
  }
}
</style>
