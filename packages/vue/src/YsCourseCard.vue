<script setup lang="ts">
// 忠实复刻微信公众号网页版 ScheduleCourseCard 的视觉规范：
// 状态徽标（补班/非本周）置顶居中、周数绝对定位卡底、非本周置灰降层、
// 补班卡警示色混合、自定义课程虚线边框、单节课紧凑排版。
import type { DisplayCourse, WeatherCardConfig, WeatherKind } from '@iyotsuba/schedule-core'
import { courseCarryItems } from '@iyotsuba/schedule-core'
import { computed } from 'vue'
import YsWeatherGlyph from './YsWeatherGlyph.vue'

const props = withDefaults(defineProps<{
  course: DisplayCourse
  color: string
  inactiveBadge: string
  makeupBadge: string
  /** 界面密度：minimal 仅名称 / normal 现状 / rich 加教师与携带提示 */
  density?: 'minimal' | 'normal' | 'rich'
  weatherKind?: WeatherKind
  weatherText?: string
  weatherCard?: WeatherCardConfig | false
}>(), {
  density: 'normal',
  weatherCard: () => ({ enabled: true, glyph: true, background: true, label: true, intensity: 0.72 }),
})

defineEmits<{ select: [course: DisplayCourse] }>()

const isMakeup = computed(() => Boolean(props.course.makeup))
const active = computed(() => isMakeup.value || props.course.active)
const status = computed(() => (isMakeup.value ? props.makeupBadge : active.value ? '' : props.inactiveBadge))
const sectionSpan = computed(() => Math.max(1, props.course.endSection - props.course.startSection + 1))
const parityLabel = computed(() =>
  props.course.parity === 'odd' ? '单周' : props.course.parity === 'even' ? '双周' : '每周',
)
const weatherConfig = computed<Required<WeatherCardConfig>>(() => ({
  enabled: props.weatherCard !== false && props.weatherCard?.enabled !== false,
  glyph: props.weatherCard !== false && props.weatherCard?.glyph !== false,
  background: props.weatherCard !== false && props.weatherCard?.background !== false,
  label: props.weatherCard !== false && props.weatherCard?.label !== false,
  intensity: Math.min(1, Math.max(0, props.weatherCard === false ? 0 : props.weatherCard?.intensity ?? 0.72)),
}))
const hasWeather = computed(() => weatherConfig.value.enabled && props.weatherKind && props.weatherKind !== 'neutral')
const carryItems = computed(() => courseCarryItems(props.course))
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
      'has-weather': hasWeather,
    }"
    :style="{ '--ys-course-color': color, '--fx-seed': (course.weekday * 2 + course.startSection) % 5, '--ys-card-weather-intensity': weatherConfig.intensity }"
    :data-weather="hasWeather ? weatherKind : undefined"
    :aria-label="`${course.name}，${course.location || '地点待定'}，第${course.startSection}到${course.endSection}节，${status || parityLabel}`"
    @click.stop="$emit('select', course)"
  >
    <span v-if="hasWeather && weatherConfig.background" class="ys-course-card__weather-bg" aria-hidden="true" />
    <slot name="weather" :kind="weatherKind" :text="weatherText" :course="course">
      <span v-if="hasWeather && weatherConfig.glyph" class="ys-course-card__weather">
        <YsWeatherGlyph :kind="weatherKind!" :size="14" :label="weatherText" />
        <small v-if="weatherConfig.label && density === 'rich' && weatherText">{{ weatherText }}</small>
      </span>
    </slot>
    <span v-if="status" class="ys-course-card__status">{{ status }}</span>
    <span class="ys-course-card__content">
      <strong>{{ course.name }}</strong>
      <span v-if="course.location && density !== 'minimal'" class="ys-course-card__room">@{{ course.location }}</span>
      <span v-if="density === 'rich' && course.teacher" class="ys-course-card__teacher">{{ course.teacher }}</span>
    </span>
    <span v-if="density === 'rich' && carryItems.length" class="ys-course-card__gear" aria-label="有携带物品">带</span>
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

@container ys-course-slot (max-width: 42px) {
  .ys-course-card {
    width: calc(100% - 4px);
    padding-right: 2px;
    padding-left: 2px;
    margin-right: 2px;
    margin-left: 2px;
  }
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
  position: relative;
  z-index: 2;
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
  word-break: break-all;
  overflow-wrap: anywhere;
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
  max-height: 2.2em;
  line-height: 1.05;
  text-align: center;
  white-space: normal;
  word-break: break-all;
  overflow-wrap: anywhere;
}

.ys-course-card__status {
  position: absolute;
  top: 3px;
  left: 50%;
  max-width: calc(100% - 4px);
  padding: 1px 2px;
  font-size: 7px;
  font-weight: 750;
  color: #fff;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: rgb(0 0 0 / 34%);
  border-radius: 3px;
  transform: translateX(-50%);
}

.ys-course-card__weather-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
  opacity: var(--ys-card-weather-intensity, 0.72);
}

.ys-course-card__weather-bg::before,
.ys-course-card__weather-bg::after {
  position: absolute;
  display: block;
  pointer-events: none;
  content: "";
}

.ys-course-card[data-weather='clear'] .ys-course-card__weather-bg {
  background:
    radial-gradient(circle at 18% 15%, rgb(255 246 190 / 74%) 0 6%, rgb(255 225 130 / 28%) 7% 20%, transparent 38%),
    linear-gradient(155deg, rgb(255 211 102 / 28%), transparent 56%, rgb(115 65 10 / 10%));
}

.ys-course-card[data-weather='clear'] .ys-course-card__weather-bg::before {
  top: -27%;
  left: -37%;
  width: 82%;
  aspect-ratio: 1;
  background: repeating-conic-gradient(from 0deg, rgb(255 239 173 / 28%) 0 7deg, transparent 7deg 34deg);
  border-radius: 50%;
  -webkit-mask: radial-gradient(circle, transparent 0 24%, #000 26% 78%, transparent 80%);
  mask: radial-gradient(circle, transparent 0 24%, #000 26% 78%, transparent 80%);
}

.ys-course-card[data-weather='clear'] .ys-course-card__weather-bg::after {
  inset: 0;
  background: radial-gradient(70% 42% at 24% 12%, rgb(255 255 255 / 22%), transparent 72%);
}

.ys-course-card[data-weather='cloudy'] .ys-course-card__weather-bg,
.ys-course-card[data-weather='overcast'] .ys-course-card__weather-bg {
  background:
    linear-gradient(160deg, rgb(218 236 248 / 30%), transparent 42%),
    linear-gradient(180deg, rgb(72 96 124 / 8%), transparent 65%, rgb(31 49 70 / 12%));
}

.ys-course-card[data-weather='overcast'] .ys-course-card__weather-bg {
  background:
    linear-gradient(165deg, rgb(187 203 219 / 30%), rgb(76 94 116 / 12%) 55%, transparent),
    linear-gradient(180deg, rgb(35 49 68 / 12%), transparent 72%);
}

.ys-course-card[data-weather='cloudy'] .ys-course-card__weather-bg::before,
.ys-course-card[data-weather='overcast'] .ys-course-card__weather-bg::before {
  top: -11%;
  left: -48%;
  width: 165%;
  height: 48%;
  background:
    radial-gradient(ellipse at 22% 66%, rgb(255 255 255 / 54%) 0 14%, transparent 15%),
    radial-gradient(ellipse at 43% 46%, rgb(255 255 255 / 46%) 0 19%, transparent 20%),
    radial-gradient(ellipse at 68% 64%, rgb(228 239 247 / 44%) 0 18%, transparent 19%),
    radial-gradient(ellipse at 83% 73%, rgb(208 223 236 / 36%) 0 12%, transparent 13%);
  filter: blur(0.6px);
}

.ys-course-card[data-weather='cloudy'] .ys-course-card__weather-bg::after,
.ys-course-card[data-weather='overcast'] .ys-course-card__weather-bg::after {
  top: 18%;
  right: -62%;
  width: 150%;
  height: 38%;
  background:
    radial-gradient(ellipse at 24% 62%, rgb(220 233 243 / 32%) 0 15%, transparent 16%),
    radial-gradient(ellipse at 48% 48%, rgb(245 249 252 / 34%) 0 18%, transparent 19%),
    radial-gradient(ellipse at 72% 66%, rgb(180 200 218 / 28%) 0 18%, transparent 19%);
  filter: blur(0.8px);
}

.ys-course-card[data-weather='overcast'] .ys-course-card__weather-bg::before,
.ys-course-card[data-weather='overcast'] .ys-course-card__weather-bg::after {
  opacity: 0.62;
}

.ys-course-card[data-weather='rain'] .ys-course-card__weather-bg,
.ys-course-card[data-weather='heavy-rain'] .ys-course-card__weather-bg,
.ys-course-card[data-weather='drizzle'] .ys-course-card__weather-bg,
.ys-course-card[data-weather='storm'] .ys-course-card__weather-bg {
  background:
    radial-gradient(100% 45% at 12% 0%, rgb(224 240 250 / 22%), transparent 58%),
    linear-gradient(165deg, rgb(38 75 119 / 30%), transparent 52%, rgb(15 35 60 / 22%));
  --ys-card-rain-opacity: 0.56;
  --ys-card-rain-speed: 1.15s;
}

.ys-course-card[data-weather='drizzle'] .ys-course-card__weather-bg {
  --ys-card-rain-opacity: 0.34;
  --ys-card-rain-speed: 1.8s;
}

.ys-course-card[data-weather='heavy-rain'] .ys-course-card__weather-bg {
  background:
    radial-gradient(100% 42% at 8% 0%, rgb(210 232 247 / 20%), transparent 56%),
    linear-gradient(165deg, rgb(27 61 104 / 42%), transparent 48%, rgb(9 27 49 / 34%));
  --ys-card-rain-opacity: 0.82;
  --ys-card-rain-speed: 0.72s;
}

.ys-course-card[data-weather='storm'] .ys-course-card__weather-bg {
  background:
    radial-gradient(100% 44% at 10% 0%, rgb(221 226 255 / 18%), transparent 54%),
    linear-gradient(165deg, rgb(55 56 107 / 42%), transparent 50%, rgb(21 20 55 / 36%));
  --ys-card-rain-opacity: 0.74;
  --ys-card-rain-speed: 0.62s;
}

.ys-course-card[data-weather='rain'] .ys-course-card__weather-bg::before,
.ys-course-card[data-weather='heavy-rain'] .ys-course-card__weather-bg::before,
.ys-course-card[data-weather='drizzle'] .ys-course-card__weather-bg::before,
.ys-course-card[data-weather='storm'] .ys-course-card__weather-bg::before {
  inset: -44% -42%;
  background:
    linear-gradient(164deg, transparent 0 45%, rgb(224 242 255 / 44%) 47% 52%, transparent 54%) 0 0 / 13px 31px,
    linear-gradient(164deg, transparent 0 44%, rgb(185 220 245 / 28%) 46% 51%, transparent 53%) 7px 12px / 19px 39px;
  opacity: var(--ys-card-rain-opacity);
}

.ys-course-card[data-weather='rain'] .ys-course-card__weather-bg::after,
.ys-course-card[data-weather='heavy-rain'] .ys-course-card__weather-bg::after,
.ys-course-card[data-weather='drizzle'] .ys-course-card__weather-bg::after {
  inset: auto -20% 0;
  height: 38%;
  background: linear-gradient(180deg, transparent, rgb(211 231 244 / 16%));
}

.ys-course-card[data-weather='storm'] .ys-course-card__weather-bg::after {
  inset: 0;
  background: rgb(235 241 255 / 54%);
  opacity: 0;
}

.ys-course-card[data-weather='snow'] .ys-course-card__weather-bg {
  background:
    radial-gradient(90% 46% at 15% 0%, rgb(255 255 255 / 36%), transparent 64%),
    linear-gradient(165deg, rgb(180 221 240 / 28%), transparent 64%);
}

.ys-course-card[data-weather='snow'] .ys-course-card__weather-bg::before,
.ys-course-card[data-weather='snow'] .ys-course-card__weather-bg::after {
  inset: -42% -25%;
  background:
    radial-gradient(circle, rgb(255 255 255 / 86%) 0 1.2px, transparent 1.5px) 0 0 / 19px 23px,
    radial-gradient(circle, rgb(255 255 255 / 58%) 0 0.9px, transparent 1.2px) 9px 12px / 27px 31px;
}

.ys-course-card[data-weather='snow'] .ys-course-card__weather-bg::after {
  opacity: 0.58;
  transform: scale(0.76);
}

.ys-course-card[data-weather='fog'] .ys-course-card__weather-bg {
  background: linear-gradient(165deg, rgb(218 228 235 / 34%), transparent 62%, rgb(93 111 126 / 10%));
}

.ys-course-card[data-weather='fog'] .ys-course-card__weather-bg::before,
.ys-course-card[data-weather='fog'] .ys-course-card__weather-bg::after {
  inset: 3% -75%;
  background: linear-gradient(90deg, transparent, rgb(245 249 252 / 36%) 20%, rgb(215 226 234 / 18%) 45%, rgb(250 252 253 / 42%) 68%, transparent 88%);
}

.ys-course-card[data-weather='fog'] .ys-course-card__weather-bg::after {
  top: 40%;
  opacity: 0.68;
}

.ys-course-card__weather {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 7;
  display: flex;
  gap: 2px;
  align-items: center;
  max-width: calc(100% - 8px);
  color: rgb(255 255 255 / 92%);
  filter: drop-shadow(0 1px 2px rgb(0 0 0 / 20%));
}

.ys-course-card__weather small {
  overflow: hidden;
  font-size: 7px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ys-course-card.has-status .ys-course-card__weather { top: auto; bottom: 4px; }
.ys-course-card.has-status .ys-course-card__weeks { padding-left: 14px; }

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
  display: grid;
  place-items: center;
  width: 13px;
  height: 13px;
  font-size: 7px;
  font-weight: 750;
  color: var(--ys-course-color);
  background: rgb(255 255 255 / 86%);
  border-radius: 4px;
}

.ys-course-card.has-weather .ys-course-card__gear { top: 3px; }

@media (prefers-reduced-motion: no-preference) {
  .ys-course-card[data-weather='clear'] .ys-course-card__weather-bg::before {
    animation: ys-course-weather-sun 24s linear infinite;
  }

  .ys-course-card[data-weather='clear'] .ys-course-card__weather-bg::after {
    animation: ys-course-weather-clear-pulse 5.6s ease-in-out infinite;
  }

  .ys-course-card[data-weather='cloudy'] .ys-course-card__weather-bg::before,
  .ys-course-card[data-weather='overcast'] .ys-course-card__weather-bg::before {
    animation: ys-course-weather-cloud 9s ease-in-out infinite alternate;
  }

  .ys-course-card[data-weather='cloudy'] .ys-course-card__weather-bg::after,
  .ys-course-card[data-weather='overcast'] .ys-course-card__weather-bg::after {
    animation: ys-course-weather-cloud-back 12s ease-in-out infinite alternate;
  }

  .ys-course-card[data-weather='rain'] .ys-course-card__weather-bg,
  .ys-course-card[data-weather='heavy-rain'] .ys-course-card__weather-bg,
  .ys-course-card[data-weather='drizzle'] .ys-course-card__weather-bg,
  .ys-course-card[data-weather='storm'] .ys-course-card__weather-bg {
    animation: ys-course-weather-rain-pulse 4.6s ease-in-out infinite;
  }

  .ys-course-card[data-weather='rain'] .ys-course-card__weather-bg::before,
  .ys-course-card[data-weather='heavy-rain'] .ys-course-card__weather-bg::before,
  .ys-course-card[data-weather='drizzle'] .ys-course-card__weather-bg::before,
  .ys-course-card[data-weather='storm'] .ys-course-card__weather-bg::before {
    animation: ys-course-weather-rain var(--ys-card-rain-speed) linear infinite;
    will-change: transform;
  }

  .ys-course-card[data-weather='storm'] .ys-course-card__weather-bg::after {
    animation: ys-course-weather-flash 7s linear infinite;
  }

  .ys-course-card[data-weather='snow'] .ys-course-card__weather-bg::before {
    animation: ys-course-weather-snow 7s linear infinite;
    will-change: transform;
  }

  .ys-course-card[data-weather='snow'] .ys-course-card__weather-bg::after {
    animation: ys-course-weather-snow-back 11s linear infinite;
    will-change: transform;
  }

  .ys-course-card[data-weather='fog'] .ys-course-card__weather-bg::before,
  .ys-course-card[data-weather='fog'] .ys-course-card__weather-bg::after {
    animation: ys-course-weather-fog 13s ease-in-out infinite alternate;
    will-change: transform;
  }
}

@keyframes ys-course-weather-sun { to { transform: rotate(360deg); } }
@keyframes ys-course-weather-clear-pulse { 50% { opacity: 0.48; transform: scale(1.05); } }
@keyframes ys-course-weather-cloud { to { transform: translate3d(10%, 2%, 0); } }
@keyframes ys-course-weather-cloud-back { to { transform: translate3d(-12%, 1%, 0); } }
@keyframes ys-course-weather-rain { to { transform: translate3d(-8%, 24%, 0); } }
@keyframes ys-course-weather-rain-pulse { 50% { opacity: 0.9; } }
@keyframes ys-course-weather-flash {
  0%, 70%, 72%, 74%, 100% { opacity: 0; }
  70.5%, 72.6% { opacity: 0.58; }
}
@keyframes ys-course-weather-snow { to { transform: translate3d(4%, 28%, 0) rotate(4deg); } }
@keyframes ys-course-weather-snow-back { to { transform: translate3d(-5%, 22%, 0) scale(0.76) rotate(-4deg); } }
@keyframes ys-course-weather-fog { to { transform: translate3d(24%, 0, 0); } }

/* ---------- 卡片装饰特效（只作用本周卡,换周期间由宿主摘除属性,reduced-motion 关闭） ---------- */

/* shimmer 流光：窄条带低透明度扫过，大部分时间保持静默。 */
[data-ys-effect='shimmer'] .ys-course-card.is-active {
  --fx-shimmer-tint: rgb(255 255 255 / 5%);
  --fx-shimmer-peak: rgb(255 255 255 / 18%);
}

.ys-dark[data-ys-effect='shimmer'] .ys-course-card.is-active {
  --fx-shimmer-tint: rgb(255 255 255 / 4%);
  --fx-shimmer-peak: rgb(255 255 255 / 12%);
}

[data-ys-effect='shimmer'] .ys-course-card.is-active::after {
  position: absolute;
  inset: -20% auto -20% 0;
  width: 32%;
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
    animation: ys-fx-shimmer 7.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    animation-delay: calc(var(--fx-seed, 0) * -1s);
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
  22% { transform: translate3d(430%, 0, 0) skewX(-16deg); }
  100% { transform: translate3d(430%, 0, 0) skewX(-16deg); }
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
