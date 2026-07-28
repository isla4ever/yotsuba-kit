<script setup lang="ts">
// 小米天气式实时背景场景层：纯 CSS,每场景 ≤3 动画层,只动 transform/opacity。
// 雨丝=repeating-linear-gradient 层平移循环;雪=双层 radial 雪点视差下落;
// 云=静态模糊团 transform 漂移;闪电=白色 overlay opacity 关键帧;雾=宽渐变带流动。
// prefers-reduced-motion 降级为静态渐变;层容器 contain:strict 且不拦截交互。
import type { WeatherKind } from '@iyotsuba/schedule-core'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  kind: WeatherKind
  /** 0-1,场景整体强度(不透明度上限),不喧宾夺主 */
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
  inset: 0;
  display: block;
}

/* ---------- clear 晴：太阳光晕 + 缓慢旋转的光芒 ---------- */
.ys-weather--clear .ys-weather__a {
  background: radial-gradient(52% 42% at 82% -6%, rgb(255 196 92 / 55%), rgb(255 214 130 / 18%) 46%, transparent 72%);
}

.ys-weather--clear .ys-weather__b {
  inset: -60% -30% auto auto;
  width: 130%;
  aspect-ratio: 1;
  background: conic-gradient(
    from 0deg,
    transparent 0deg 14deg, rgb(255 214 130 / 12%) 20deg 26deg,
    transparent 32deg 58deg, rgb(255 214 130 / 10%) 64deg 70deg,
    transparent 76deg 104deg, rgb(255 214 130 / 12%) 110deg 116deg,
    transparent 122deg 360deg
  );
  border-radius: 50%;
  animation: ys-weather-rotate 60s linear infinite;
}

.ys-weather--clear.is-dark .ys-weather__a {
  background: radial-gradient(52% 42% at 82% -6%, rgb(140 168 255 / 34%), transparent 70%);
}

/* ---------- cloudy 多云：三团模糊云漂移 ---------- */
.ys-weather--cloudy .ys-weather__a,
.ys-weather--cloudy .ys-weather__b,
.ys-weather--cloudy .ys-weather__c,
.ys-weather--overcast .ys-weather__a,
.ys-weather--overcast .ys-weather__b {
  inset: auto;
  border-radius: 50%;
  filter: blur(26px); /* 静态 blur,一次栅格化后仅 transform 移动 */
}

.ys-weather--cloudy .ys-weather__a {
  top: 4%;
  left: -18%;
  width: 62%;
  height: 22%;
  background: rgb(255 255 255 / 60%);
  animation: ys-weather-drift 46s ease-in-out infinite alternate;
}

.ys-weather--cloudy .ys-weather__b {
  top: 14%;
  right: -22%;
  width: 55%;
  height: 18%;
  background: rgb(255 255 255 / 44%);
  animation: ys-weather-drift 58s ease-in-out infinite alternate-reverse;
}

.ys-weather--cloudy .ys-weather__c {
  top: 30%;
  left: 18%;
  width: 46%;
  height: 14%;
  background: rgb(255 255 255 / 30%);
  animation: ys-weather-drift 70s ease-in-out infinite alternate;
}

.ys-weather--cloudy.is-dark .ys-weather__a,
.ys-weather--cloudy.is-dark .ys-weather__b,
.ys-weather--cloudy.is-dark .ys-weather__c {
  background: rgb(150 168 196 / 22%);
}

/* ---------- overcast 阴：低速灰云 + 顶部压暗 ---------- */
.ys-weather--overcast .ys-weather__a {
  top: 2%;
  left: -12%;
  width: 70%;
  height: 24%;
  background: rgb(142 156 176 / 34%);
  animation: ys-weather-drift 80s ease-in-out infinite alternate;
}

.ys-weather--overcast .ys-weather__b {
  top: 16%;
  right: -16%;
  width: 60%;
  height: 20%;
  background: rgb(120 134 154 / 28%);
  animation: ys-weather-drift 95s ease-in-out infinite alternate-reverse;
}

.ys-weather--overcast .ys-weather__c {
  background: linear-gradient(180deg, rgb(96 108 126 / 22%), transparent 55%);
}

/* ---------- rain / drizzle 雨：双层雨丝平移循环 ---------- */
.ys-weather--rain .ys-weather__a,
.ys-weather--rain .ys-weather__b,
.ys-weather--heavy-rain .ys-weather__a,
.ys-weather--heavy-rain .ys-weather__b,
.ys-weather--drizzle .ys-weather__a,
.ys-weather--storm .ys-weather__a,
.ys-weather--storm .ys-weather__b {
  inset: -100% 0 0;
  background: repeating-linear-gradient(
    16deg,
    transparent 0 11px,
    rgb(122 158 210 / 42%) 11px 12.4px,
    transparent 12.4px 23px
  );
  animation: ys-weather-fall 0.9s linear infinite;
}

.ys-weather--rain .ys-weather__b {
  background: repeating-linear-gradient(
    16deg,
    transparent 0 17px,
    rgb(122 158 210 / 26%) 17px 18px,
    transparent 18px 34px
  );
  animation-duration: 1.4s;
}

.ys-weather--heavy-rain .ys-weather__a {
  background: repeating-linear-gradient(
    16deg,
    transparent 0 6px,
    rgb(139 181 229 / 58%) 6px 8px,
    transparent 8px 14px
  );
  animation-duration: 0.58s;
}

.ys-weather--heavy-rain .ys-weather__b {
  background: repeating-linear-gradient(
    16deg,
    transparent 0 10px,
    rgb(177 207 239 / 38%) 10px 11.5px,
    transparent 11.5px 20px
  );
  animation-duration: 0.82s;
}

.ys-weather--drizzle .ys-weather__a {
  background: repeating-linear-gradient(
    14deg,
    transparent 0 19px,
    rgb(140 170 214 / 22%) 19px 20px,
    transparent 20px 38px
  );
  animation-duration: 1.8s;
}

.ys-weather--rain .ys-weather__c,
.ys-weather--heavy-rain .ys-weather__c,
.ys-weather--storm .ys-weather__c {
  background: linear-gradient(180deg, rgb(70 92 122 / 20%), transparent 60%);
}

.ys-weather--heavy-rain .ys-weather__c {
  background: linear-gradient(180deg, rgb(38 61 91 / 36%), rgb(45 74 107 / 12%) 62%, transparent);
}

/* ---------- storm 雷雨：雨 + 周期性闪电 ---------- */
.ys-weather--storm .ys-weather__b {
  background: #fff;
  inset: 0;
  opacity: 0;
  animation: ys-weather-flash 7s linear infinite;
}

/* ---------- snow 雪：双层雪点视差下落 + 轻微横摆 ---------- */
.ys-weather--snow .ys-weather__a,
.ys-weather--snow .ys-weather__b {
  inset: -100% 0 0;
  background-image:
    radial-gradient(3px 3px at 22% 18%, rgb(255 255 255 / 92%) 40%, transparent 60%),
    radial-gradient(2.4px 2.4px at 64% 42%, rgb(255 255 255 / 80%) 40%, transparent 60%),
    radial-gradient(2px 2px at 84% 8%, rgb(255 255 255 / 70%) 40%, transparent 60%),
    radial-gradient(2.6px 2.6px at 40% 70%, rgb(255 255 255 / 85%) 40%, transparent 60%),
    radial-gradient(2px 2px at 8% 52%, rgb(255 255 255 / 66%) 40%, transparent 60%);
  background-size: 240px 260px;
  animation: ys-weather-snowfall 9s linear infinite;
}

.ys-weather--snow .ys-weather__b {
  background-size: 340px 380px;
  opacity: 0.6;
  animation-duration: 15s;
}

.ys-weather--snow.is-dark .ys-weather__a,
.ys-weather--snow.is-dark .ys-weather__b {
  opacity: 0.75;
}

/* ---------- fog 雾：双层雾带流动 ---------- */
.ys-weather--fog .ys-weather__a,
.ys-weather--fog .ys-weather__b {
  inset: 0 -100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgb(214 222 232 / 46%) 22%,
    rgb(214 222 232 / 20%) 40%,
    rgb(214 222 232 / 52%) 62%,
    transparent 85%
  );
  animation: ys-weather-fog 34s ease-in-out infinite alternate;
}

.ys-weather--fog .ys-weather__b {
  top: 40%;
  opacity: 0.7;
  animation-duration: 46s;
  animation-direction: alternate-reverse;
}

.ys-weather--fog.is-dark .ys-weather__a,
.ys-weather--fog.is-dark .ys-weather__b {
  background: linear-gradient(90deg, transparent, rgb(122 136 158 / 30%) 30%, rgb(122 136 158 / 14%) 55%, transparent 85%);
}

/* ---------- keyframes（全部 transform/opacity） ---------- */
@keyframes ys-weather-fall {
  to { transform: translate3d(-6%, 50%, 0); }
}

@keyframes ys-weather-snowfall {
  to { transform: translate3d(2.5%, 50%, 0); }
}

@keyframes ys-weather-drift {
  to { transform: translate3d(12%, 2%, 0); }
}

@keyframes ys-weather-fog {
  to { transform: translate3d(24%, 0, 0); }
}

@keyframes ys-weather-rotate {
  to { transform: rotate(360deg); }
}

@keyframes ys-weather-flash {
  0%, 55.9%, 58.3%, 60.4%, 100% { opacity: 0; }
  56.4% { opacity: 0.5; }
  57.2% { opacity: 0.08; }
  59.2% { opacity: 0.34; }
}

@media (prefers-reduced-motion: reduce) {
  .ys-weather__a,
  .ys-weather__b,
  .ys-weather__c {
    animation: none !important;
  }
}
</style>
