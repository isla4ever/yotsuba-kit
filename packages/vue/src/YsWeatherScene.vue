<script setup lang="ts">
import type { WeatherKind } from '@iyotsuba/schedule-core'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  kind: WeatherKind
  /** 0-1，控制氛围色强度；场景始终只做低频模糊光色运动。 */
  intensity?: number
  dark?: boolean
}>(), {
  intensity: 0.5,
})

const sceneClass = computed(() => `ys-weather--${props.kind}`)
</script>

<template>
  <div
    class="ys-weather"
    :class="[sceneClass, { 'is-dark': dark }]"
    :style="{ '--ys-weather-intensity': intensity }"
    aria-hidden="true"
  >
    <i class="ys-weather__a" />
    <i class="ys-weather__b" />
    <i class="ys-weather__c" />
  </div>
</template>

<style>
.ys-weather {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  contain: strict;
  opacity: var(--ys-weather-intensity, 0.5);
}

.ys-weather__a,
.ys-weather__b,
.ys-weather__c {
  position: absolute;
  display: block;
  pointer-events: none;
  will-change: transform, opacity;
}

.ys-weather__a,
.ys-weather__b {
  border-radius: 50%;
  filter: blur(52px);
}

.ys-weather__a {
  top: -14%;
  left: -24%;
  width: 78%;
  height: 46%;
  animation: ys-weather-ambient-a 38s ease-in-out infinite alternate;
}

.ys-weather__b {
  top: 12%;
  right: -28%;
  width: 72%;
  height: 52%;
  animation: ys-weather-ambient-b 52s ease-in-out infinite alternate-reverse;
}

.ys-weather__c {
  inset: 0;
  animation: ys-weather-ambient-breathe 18s ease-in-out infinite;
}

/* 晴天保留暖色光晕，运动只发生在大尺度柔光上。 */
.ys-weather--clear {
  background: linear-gradient(158deg, rgb(255 232 171 / 22%), transparent 46%);
}
.ys-weather--clear .ys-weather__a { background: rgb(255 211 116 / 52%); }
.ys-weather--clear .ys-weather__b { background: rgb(255 245 209 / 42%); }
.ys-weather--clear .ys-weather__c {
  background: radial-gradient(50% 28% at 82% 0%, rgb(255 205 105 / 34%), transparent 72%);
}

/* 多云比阴天更明亮，云感来自互相穿行的灰白柔光，不绘制具象云团。 */
.ys-weather--cloudy {
  background: linear-gradient(155deg, rgb(181 204 225 / 24%), rgb(238 244 249 / 10%) 48%, transparent 78%);
}
.ys-weather--cloudy .ys-weather__a { background: rgb(243 248 252 / 68%); }
.ys-weather--cloudy .ys-weather__b { background: rgb(139 164 190 / 34%); }
.ys-weather--cloudy .ys-weather__c {
  background: radial-gradient(70% 24% at 52% 20%, rgb(255 255 255 / 30%), transparent 76%);
}

.ys-weather--overcast {
  background: linear-gradient(165deg, rgb(111 131 154 / 26%), rgb(192 204 216 / 12%) 56%, transparent 86%);
}
.ys-weather--overcast .ys-weather__a { background: rgb(135 151 171 / 42%); }
.ys-weather--overcast .ys-weather__b { background: rgb(205 215 225 / 36%); }
.ys-weather--overcast .ys-weather__c {
  background: linear-gradient(180deg, rgb(86 103 124 / 16%), transparent 48%);
}

/* 雨天的全局层只表达湿冷、低云和漫反射，不再铺满快速雨丝。 */
.ys-weather--drizzle {
  background: linear-gradient(158deg, rgb(144 180 208 / 25%), rgb(217 232 241 / 10%) 52%, transparent 82%);
}
.ys-weather--drizzle .ys-weather__a { background: rgb(174 207 227 / 42%); }
.ys-weather--drizzle .ys-weather__b { background: rgb(102 143 179 / 28%); }
.ys-weather--drizzle .ys-weather__c {
  background: radial-gradient(70% 32% at 70% 12%, rgb(225 241 250 / 24%), transparent 78%);
}

.ys-weather--rain {
  background: linear-gradient(160deg, rgb(74 115 154 / 30%), rgb(161 190 214 / 12%) 52%, transparent 84%);
}
.ys-weather--rain .ys-weather__a { background: rgb(91 135 174 / 42%); }
.ys-weather--rain .ys-weather__b { background: rgb(182 208 227 / 30%); }
.ys-weather--rain .ys-weather__c {
  background: radial-gradient(72% 34% at 68% 8%, rgb(205 228 242 / 22%), transparent 78%);
}

.ys-weather--heavy-rain {
  background: linear-gradient(160deg, rgb(51 82 119 / 36%), rgb(112 146 177 / 16%) 54%, transparent 86%);
}
.ys-weather--heavy-rain .ys-weather__a { background: rgb(61 96 135 / 48%); }
.ys-weather--heavy-rain .ys-weather__b { background: rgb(146 180 207 / 32%); }
.ys-weather--heavy-rain .ys-weather__c {
  background: linear-gradient(180deg, rgb(42 66 94 / 18%), transparent 54%);
}

.ys-weather--storm {
  background: linear-gradient(158deg, rgb(55 58 104 / 34%), rgb(95 112 151 / 16%) 58%, transparent 86%);
}
.ys-weather--storm .ys-weather__a { background: rgb(68 70 124 / 48%); }
.ys-weather--storm .ys-weather__b { background: rgb(142 153 194 / 30%); }
.ys-weather--storm .ys-weather__c {
  background: radial-gradient(54% 24% at 72% 8%, rgb(212 219 255 / 18%), transparent 80%);
}

.ys-weather--snow {
  background: linear-gradient(158deg, rgb(205 229 242 / 32%), rgb(244 249 252 / 16%) 54%, transparent 84%);
}
.ys-weather--snow .ys-weather__a { background: rgb(235 247 253 / 72%); }
.ys-weather--snow .ys-weather__b { background: rgb(159 202 226 / 32%); }
.ys-weather--snow .ys-weather__c {
  background:
    radial-gradient(circle at 18% 18%, rgb(255 255 255 / 32%) 0 2px, transparent 3px),
    radial-gradient(circle at 76% 30%, rgb(255 255 255 / 24%) 0 2px, transparent 3px),
    radial-gradient(circle at 45% 58%, rgb(255 255 255 / 20%) 0 1.5px, transparent 2.5px);
}

.ys-weather--fog {
  background: linear-gradient(180deg, rgb(184 197 208 / 26%), rgb(229 235 239 / 15%) 58%, transparent 86%);
}
.ys-weather--fog .ys-weather__a { background: rgb(222 229 234 / 64%); }
.ys-weather--fog .ys-weather__b { background: rgb(154 169 184 / 34%); }
.ys-weather--fog .ys-weather__c {
  background: linear-gradient(180deg, transparent 18%, rgb(244 247 249 / 24%) 38%, transparent 62%);
}

.ys-weather--neutral .ys-weather__a,
.ys-weather--neutral .ys-weather__b,
.ys-weather--neutral .ys-weather__c { display: none; }

.ys-weather.is-dark { opacity: calc(var(--ys-weather-intensity, 0.5) * 0.72); }
.ys-weather.is-dark .ys-weather__a,
.ys-weather.is-dark .ys-weather__b { filter: blur(60px) saturate(0.82); }

@keyframes ys-weather-ambient-a {
  to { transform: translate3d(18%, 9%, 0) scale(1.08); }
}

@keyframes ys-weather-ambient-b {
  to { transform: translate3d(-16%, 8%, 0) scale(1.12); }
}

@keyframes ys-weather-ambient-breathe {
  0%, 100% { opacity: 0.72; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.025); }
}

@media (prefers-reduced-motion: reduce) {
  .ys-weather__a,
  .ys-weather__b,
  .ys-weather__c {
    animation: none !important;
    will-change: auto;
  }
}
</style>
