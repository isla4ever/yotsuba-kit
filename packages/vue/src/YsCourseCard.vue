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
  weatherCard: () => ({ enabled: true, glyph: false, background: true, label: false, intensity: 0.66 }),
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
  glyph: props.weatherCard !== false && props.weatherCard?.glyph === true,
  background: props.weatherCard !== false && props.weatherCard?.background !== false,
  label: props.weatherCard !== false && props.weatherCard?.label !== false,
  intensity: Math.min(1, Math.max(0, props.weatherCard === false ? 0 : props.weatherCard?.intensity ?? 0.66)),
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
  isolation: isolate;
  opacity: var(--ys-card-weather-intensity, 0.66);
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
    radial-gradient(72% 58% at 104% -8%, rgb(255 247 202 / 72%) 0 10%, rgb(255 220 128 / 30%) 24%, transparent 68%),
    linear-gradient(145deg, transparent 54%, rgb(255 198 76 / 10%));
}

.ys-course-card[data-weather='clear'] .ys-course-card__weather-bg::before {
  top: -42%;
  right: -38%;
  width: 94%;
  aspect-ratio: 1;
  background: repeating-conic-gradient(from 4deg, rgb(255 238 168 / 28%) 0 6deg, transparent 7deg 33deg);
  border-radius: 50%;
  -webkit-mask: radial-gradient(circle, transparent 0 20%, #000 24% 70%, transparent 74%);
  mask: radial-gradient(circle, transparent 0 20%, #000 24% 70%, transparent 74%);
}

.ys-course-card[data-weather='clear'] .ys-course-card__weather-bg::after {
  top: -7%;
  right: -7%;
  width: 48%;
  aspect-ratio: 1;
  background: radial-gradient(circle, rgb(255 255 238 / 58%) 0 9%, rgb(255 224 142 / 22%) 25%, transparent 68%);
  filter: blur(1.5px);
}

.ys-course-card[data-weather='cloudy'] .ys-course-card__weather-bg,
.ys-course-card[data-weather='overcast'] .ys-course-card__weather-bg {
  background:
    radial-gradient(78% 46% at 108% 2%, rgb(239 247 252 / 50%), rgb(174 198 218 / 18%) 46%, transparent 72%);
}

.ys-course-card[data-weather='overcast'] .ys-course-card__weather-bg {
  background:
    radial-gradient(82% 48% at 108% 0%, rgb(207 219 231 / 38%), rgb(105 128 152 / 18%) 48%, transparent 74%);
}

.ys-course-card[data-weather='cloudy'] .ys-course-card__weather-bg::before,
.ys-course-card[data-weather='overcast'] .ys-course-card__weather-bg::before {
  top: -16%;
  right: -30%;
  width: 106%;
  height: 52%;
  background:
    radial-gradient(ellipse at 24% 70%, rgb(255 255 255 / 48%) 0 14%, transparent 34%),
    radial-gradient(ellipse at 54% 48%, rgb(233 241 247 / 42%) 0 20%, transparent 44%),
    radial-gradient(ellipse at 84% 72%, rgb(185 204 220 / 34%) 0 16%, transparent 38%);
  filter: blur(4px);
}

.ys-course-card[data-weather='cloudy'] .ys-course-card__weather-bg::after,
.ys-course-card[data-weather='overcast'] .ys-course-card__weather-bg::after {
  top: 9%;
  right: -12%;
  width: 52%;
  height: 44%;
  background: linear-gradient(154deg, rgb(255 255 255 / 22%), transparent 58%, rgb(59 82 106 / 14%));
  border-radius: 50%;
  filter: blur(7px);
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
    radial-gradient(78% 52% at 108% -4%, rgb(217 238 250 / 42%), rgb(64 107 147 / 18%) 48%, transparent 74%);
  --ys-card-rain-opacity: 0.42;
}

.ys-course-card[data-weather='drizzle'] .ys-course-card__weather-bg {
  --ys-card-rain-opacity: 0.24;
}

.ys-course-card[data-weather='heavy-rain'] .ys-course-card__weather-bg {
  background:
    radial-gradient(82% 54% at 108% -4%, rgb(190 219 239 / 40%), rgb(32 71 110 / 26%) 48%, transparent 75%);
  --ys-card-rain-opacity: 0.58;
}

.ys-course-card[data-weather='storm'] .ys-course-card__weather-bg {
  background:
    radial-gradient(84% 56% at 108% -5%, rgb(218 222 255 / 38%), rgb(62 63 118 / 28%) 48%, transparent 75%);
  --ys-card-rain-opacity: 0.52;
}

.ys-course-card[data-weather='rain'] .ys-course-card__weather-bg::before,
.ys-course-card[data-weather='heavy-rain'] .ys-course-card__weather-bg::before,
.ys-course-card[data-weather='drizzle'] .ys-course-card__weather-bg::before,
.ys-course-card[data-weather='storm'] .ys-course-card__weather-bg::before {
  top: -8%;
  right: -7%;
  width: 58%;
  height: 68%;
  background:
    linear-gradient(168deg, transparent 0 18%, rgb(233 246 255 / 74%) 42% 62%, transparent 84%) 18% 8% / 1.4px 19px no-repeat,
    linear-gradient(168deg, transparent 0 18%, rgb(199 227 247 / 58%) 42% 62%, transparent 84%) 48% 42% / 1.2px 16px no-repeat,
    linear-gradient(168deg, transparent 0 18%, rgb(225 242 254 / 68%) 42% 62%, transparent 84%) 76% 16% / 1.4px 21px no-repeat,
    linear-gradient(168deg, transparent 0 18%, rgb(188 220 243 / 50%) 42% 62%, transparent 84%) 92% 58% / 1.1px 15px no-repeat;
  opacity: var(--ys-card-rain-opacity);
}

.ys-course-card[data-weather='rain'] .ys-course-card__weather-bg::after,
.ys-course-card[data-weather='heavy-rain'] .ys-course-card__weather-bg::after,
.ys-course-card[data-weather='drizzle'] .ys-course-card__weather-bg::after {
  top: -24%;
  right: -30%;
  width: 92%;
  height: 54%;
  background:
    radial-gradient(ellipse at 38% 72%, rgb(226 240 249 / 30%) 0 18%, transparent 42%),
    radial-gradient(ellipse at 72% 54%, rgb(111 149 181 / 24%) 0 24%, transparent 52%);
  filter: blur(6px);
}

.ys-course-card[data-weather='storm'] .ys-course-card__weather-bg::after {
  top: -18%;
  right: -22%;
  width: 86%;
  height: 62%;
  background:
    linear-gradient(132deg, transparent 38%, rgb(229 231 255 / 34%) 42% 45%, transparent 49%) 64% 16% / 26% 72% no-repeat,
    radial-gradient(circle at 62% 36%, rgb(171 177 236 / 32%), transparent 50%);
  filter: blur(3px);
  opacity: 0.72;
}

.ys-course-card[data-weather='snow'] .ys-course-card__weather-bg {
  background: radial-gradient(78% 52% at 108% -5%, rgb(252 255 255 / 56%), rgb(170 215 237 / 22%) 48%, transparent 74%);
}

.ys-course-card[data-weather='snow'] .ys-course-card__weather-bg::before,
.ys-course-card[data-weather='snow'] .ys-course-card__weather-bg::after {
  top: -2%;
  right: -8%;
  width: 58%;
  height: 58%;
  background:
    radial-gradient(circle at 16% 22%, rgb(255 255 255 / 92%) 0 1.2px, transparent 1.8px),
    radial-gradient(circle at 58% 12%, rgb(255 255 255 / 78%) 0 1px, transparent 1.6px),
    radial-gradient(circle at 78% 52%, rgb(255 255 255 / 88%) 0 1.3px, transparent 1.9px),
    radial-gradient(circle at 34% 70%, rgb(230 247 255 / 72%) 0 1px, transparent 1.7px);
}

.ys-course-card[data-weather='snow'] .ys-course-card__weather-bg::after {
  top: -20%;
  right: -28%;
  width: 86%;
  height: 50%;
  background: radial-gradient(ellipse, rgb(240 251 255 / 42%), transparent 68%);
  filter: blur(6px);
  opacity: 0.7;
}

.ys-course-card[data-weather='fog'] .ys-course-card__weather-bg {
  background: radial-gradient(84% 56% at 110% 4%, rgb(227 235 240 / 48%), rgb(135 153 168 / 16%) 50%, transparent 76%);
}

.ys-course-card[data-weather='fog'] .ys-course-card__weather-bg::before,
.ys-course-card[data-weather='fog'] .ys-course-card__weather-bg::after {
  top: 4%;
  right: -22%;
  width: 84%;
  height: 28%;
  background: radial-gradient(ellipse at 58% 50%, rgb(247 250 252 / 44%) 0 22%, rgb(205 217 225 / 17%) 46%, transparent 74%);
  filter: blur(4px);
}

.ys-course-card[data-weather='fog'] .ys-course-card__weather-bg::after {
  top: 27%;
  right: -34%;
  height: 24%;
  opacity: 0.66;
}

@media (prefers-reduced-motion: no-preference) {
  .ys-course-card[data-weather='clear'] .ys-course-card__weather-bg::before {
    animation: ys-card-weather-sun-rays 32s linear infinite;
  }

  .ys-course-card[data-weather='clear'] .ys-course-card__weather-bg::after {
    animation: ys-card-weather-halo 8s ease-in-out infinite;
  }

  .ys-course-card[data-weather='cloudy'] .ys-course-card__weather-bg::before,
  .ys-course-card[data-weather='overcast'] .ys-course-card__weather-bg::before {
    animation: ys-card-weather-cloud 15s ease-in-out infinite alternate;
  }

  .ys-course-card[data-weather='cloudy'] .ys-course-card__weather-bg::after,
  .ys-course-card[data-weather='overcast'] .ys-course-card__weather-bg::after,
  .ys-course-card[data-weather='rain'] .ys-course-card__weather-bg::after,
  .ys-course-card[data-weather='heavy-rain'] .ys-course-card__weather-bg::after,
  .ys-course-card[data-weather='drizzle'] .ys-course-card__weather-bg::after {
    animation: ys-card-weather-vapor 18s ease-in-out infinite alternate;
  }

  .ys-course-card[data-weather='rain'] .ys-course-card__weather-bg::before,
  .ys-course-card[data-weather='heavy-rain'] .ys-course-card__weather-bg::before,
  .ys-course-card[data-weather='drizzle'] .ys-course-card__weather-bg::before,
  .ys-course-card[data-weather='storm'] .ys-course-card__weather-bg::before {
    animation: ys-card-weather-rain 5.8s ease-in infinite;
    animation-delay: calc(var(--fx-seed, 0) * -0.7s);
  }

  .ys-course-card[data-weather='storm'] .ys-course-card__weather-bg::after {
    animation: ys-card-weather-storm-glint 7.5s ease-in-out infinite;
  }

  .ys-course-card[data-weather='snow'] .ys-course-card__weather-bg::before {
    animation: ys-card-weather-snow 12s ease-in-out infinite alternate;
    animation-delay: calc(var(--fx-seed, 0) * -0.9s);
  }

  .ys-course-card[data-weather='fog'] .ys-course-card__weather-bg::before,
  .ys-course-card[data-weather='fog'] .ys-course-card__weather-bg::after {
    animation: ys-card-weather-fog 20s ease-in-out infinite alternate;
  }
}

@keyframes ys-card-weather-sun-rays {
  to { transform: rotate(360deg); }
}

@keyframes ys-card-weather-halo {
  0%, 100% { opacity: 0.72; transform: scale(0.96); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes ys-card-weather-cloud {
  to { transform: translate3d(-5%, 3%, 0); }
}

@keyframes ys-card-weather-vapor {
  to { opacity: 0.78; transform: translate3d(-4%, 3%, 0) scale(1.04); }
}

@keyframes ys-card-weather-rain {
  0% { opacity: 0.16; transform: translate3d(1px, -7px, 0); }
  32% { opacity: var(--ys-card-rain-opacity); }
  100% { opacity: 0.08; transform: translate3d(-2px, 10px, 0); }
}

@keyframes ys-card-weather-storm-glint {
  0%, 100% { opacity: 0.42; transform: scale(0.97); }
  50% { opacity: 0.78; transform: scale(1.03); }
}

@keyframes ys-card-weather-snow {
  to { transform: translate3d(-3px, 6px, 0) rotate(4deg); }
}

@keyframes ys-card-weather-fog {
  to { opacity: 0.82; transform: translate3d(-7%, 2%, 0) scale(1.04); }
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
