<script setup lang="ts">
import type { WeatherKind } from '@iyotsuba/schedule-core'
import { computed, onMounted, ref } from 'vue'
import { weatherAnimationPhase } from './weather-animation'

const props = defineProps<{
  kind: WeatherKind
}>()

const isClear = computed(() => props.kind === 'clear')
const isCloud = computed(() => props.kind === 'cloudy' || props.kind === 'overcast')
const isRain = computed(() => ['drizzle', 'rain', 'heavy-rain', 'storm'].includes(props.kind))
const isFog = computed(() => props.kind === 'fog')
const isSnow = computed(() => props.kind === 'snow')
const isVisible = computed(() => isClear.value || isCloud.value || isRain.value || isFog.value || isSnow.value)
const animationPhase = ref('0ms')

onMounted(() => {
  animationPhase.value = weatherAnimationPhase()
})
</script>

<template>
  <svg
    v-if="isVisible"
    class="ys-weather-art"
    :class="`is-${kind}`"
    viewBox="0 0 72 72"
    preserveAspectRatio="xMidYMid meet"
    focusable="false"
    aria-hidden="true"
    :style="{ '--ys-weather-phase': animationPhase }"
  >
    <template v-if="isClear">
      <g class="ys-weather-art__clear-sun">
        <circle class="ys-weather-art__clear-bloom" cx="52" cy="17" r="31" />
        <circle class="ys-weather-art__clear-ring" cx="52" cy="17" r="17" />
        <circle class="ys-weather-art__clear-core" cx="52" cy="17" r="9.5" />
        <g class="ys-weather-art__clear-rays">
          <path d="M52-1v7M52 28v7M34 17h7M63 17h7M39.3 4.3l5 5M59.7 24.7l5 5M39.3 29.7l5-5M59.7 9.3l5-5" />
        </g>
      </g>
    </template>

    <template v-if="isCloud">
      <g v-if="kind === 'cloudy'" class="ys-weather-art__sun-halo">
        <circle cx="49" cy="18" r="16" />
        <circle class="ys-weather-art__sun-core" cx="49" cy="18" r="8" />
      </g>
      <g class="ys-weather-art__cloud ys-weather-art__cloud--back">
        <path d="M17 35.5c.6-6.1 5.7-10.9 12-10.9 2.2 0 4.3.6 6.1 1.7 2.5-6.2 8.5-10.4 15.4-10.4 9.2 0 16.7 7.4 16.8 16.6 3.4 1.2 5.7 4.4 5.7 8.1 0 4.8-3.9 8.7-8.7 8.7H26.1c-6.2 0-11.2-5-11.2-11.2 0-.9.1-1.8.3-2.6h1.8Z" />
      </g>
      <g class="ys-weather-art__cloud ys-weather-art__cloud--front">
        <path d="M8.5 47.4c0-5.1 4.1-9.2 9.2-9.2 1.2 0 2.4.2 3.5.7 2.1-5.3 7.3-9 13.3-9 7.3 0 13.4 5.4 14.3 12.4 1.2-.6 2.6-.9 4-.9 5.3 0 9.6 4.3 9.6 9.6s-4.3 9.6-9.6 9.6H21.7c-7.3 0-13.2-5.9-13.2-13.2Z" />
        <path class="ys-weather-art__cloud-edge" d="M15.5 53.4c10.4 4.8 27.1 4.7 40.2-.7" />
      </g>
    </template>

    <template v-if="isRain">
      <g class="ys-weather-art__rain-cloud">
        <path class="ys-weather-art__rain-cloud-shadow" d="M10 30.5c0-5.8 4.7-10.5 10.5-10.5 1.7 0 3.3.4 4.7 1.1C28 14.6 34.5 10 42.1 10c10.2 0 18.5 8.1 18.9 18.2 4.5.9 7.9 4.9 7.9 9.7 0 5.5-4.5 10-10 10H22.5C15.6 47.9 10 42.3 10 35.4c0-1.7.3-3.3 1-4.8Z" />
        <path class="ys-weather-art__rain-cloud-edge" d="M18 41c12.5 4 29.5 3.8 43.5-1" />
      </g>
      <g class="ys-weather-art__drops">
        <path class="ys-weather-art__drop ys-weather-art__drop--1" d="m21 47.5-.9 8.2" />
        <path class="ys-weather-art__drop ys-weather-art__drop--2" d="m31.5 51-.9 8.2" />
        <path class="ys-weather-art__drop ys-weather-art__drop--3" d="m42.5 47-.9 8.2" />
        <path class="ys-weather-art__drop ys-weather-art__drop--4" d="m53.5 51-.9 8.2" />
        <path class="ys-weather-art__drop ys-weather-art__drop--5" d="m63 46.5-.9 8.2" />
        <path class="ys-weather-art__drop ys-weather-art__drop--6" d="m16 57-.9 8.2" />
        <path class="ys-weather-art__drop ys-weather-art__drop--7" d="m47 58-.9 8.2" />
      </g>
      <path v-if="kind === 'storm'" class="ys-weather-art__lightning" d="m45 42-8.5 13.7h6.2L39 66l14.5-16.3h-7.1L52 42Z" />
    </template>

    <template v-if="isFog">
      <g class="ys-weather-art__fog-glow">
        <circle cx="51" cy="19" r="15" />
      </g>
      <path class="ys-weather-art__fog-cloud" d="M13 35c.4-5.8 5.2-10.4 11.1-10.4 1.9 0 3.7.5 5.3 1.3C32 20.1 37.8 16 44.5 16c9.2 0 16.8 7.2 17.3 16.3 4.5.8 7.9 4.7 7.9 9.4H15.1c-1.4-1.9-2.1-4.2-2.1-6.7Z" />
      <g class="ys-weather-art__fog-lines">
        <path class="ys-weather-art__fog-line ys-weather-art__fog-line--1" d="M9 43.5h42.5c5.2 0 7.7-2.1 11.5-5" />
        <path class="ys-weather-art__fog-line ys-weather-art__fog-line--2" d="M16 52h45" />
        <path class="ys-weather-art__fog-line ys-weather-art__fog-line--3" d="M8 60.5h35.5c5.7 0 8.7-1.9 12.5-5" />
      </g>
    </template>

    <template v-if="isSnow">
      <g class="ys-weather-art__snow-cloud">
        <path d="M19 34c.5-5.4 5-9.6 10.5-9.6 1.9 0 3.7.5 5.3 1.4 2.6-5.6 8.2-9.5 14.7-9.5 8.9 0 16.2 7 16.5 15.8 3.8.9 6.6 4.3 6.6 8.3 0 4.7-3.8 8.5-8.5 8.5H30c-6.1 0-11-4.9-11-11 0-1.4.3-2.7.7-3.9H19Z" />
      </g>
      <g class="ys-weather-art__snowflake ys-weather-art__snowflake--main">
        <path d="M51 38v26M39.7 44.5l22.6 13M39.7 57.5l22.6-13M51 38l-3 4M51 38l3 4M51 64l-3-4M51 64l3-4M39.7 44.5l5.1.7M39.7 44.5l1.9 4.7M62.3 57.5l-5.1-.7M62.3 57.5l-1.9-4.7M39.7 57.5l1.9-4.7M39.7 57.5l5.1-.7M62.3 44.5l-1.9 4.7M62.3 44.5l-5.1.7" />
      </g>
      <g class="ys-weather-art__snowflake ys-weather-art__snowflake--small">
        <path d="M26 46v12M20.8 49l10.4 6M20.8 55l10.4-6" />
      </g>
    </template>
  </svg>
</template>

<style scoped>
.ys-weather-art {
  position: absolute;
  top: -7px;
  right: -10px;
  width: clamp(54px, 82%, 76px);
  height: auto;
  aspect-ratio: 1;
  overflow: visible;
  pointer-events: none;
}

.ys-weather-art__clear-sun {
  transform-box: fill-box;
  transform-origin: center;
}

.ys-weather-art__clear-bloom {
  fill: rgb(255 71 57 / 34%);
  filter: blur(5.5px) drop-shadow(0 0 13px rgb(255 74 50 / 58%));
}

.ys-weather-art__clear-ring {
  fill: rgb(255 139 64 / 40%);
  stroke: rgb(255 224 153 / 54%);
  stroke-width: 1.2;
}

.ys-weather-art__clear-core {
  fill: rgb(255 246 205 / 96%);
  filter: drop-shadow(0 0 7px rgb(255 91 57 / 88%));
}

.ys-weather-art__clear-rays {
  fill: none;
  stroke: rgb(255 229 167 / 72%);
  stroke-linecap: round;
  stroke-width: 1.5;
}

.ys-weather-art__sun-halo {
  fill: rgb(255 255 255 / 16%);
  filter: drop-shadow(0 0 7px rgb(255 255 255 / 42%));
  transform-box: fill-box;
  transform-origin: center;
}

.ys-weather-art__sun-core {
  fill: rgb(255 236 190 / 48%);
}

.ys-weather-art__cloud {
  transform-box: fill-box;
  transform-origin: center;
}

.ys-weather-art__cloud--back {
  fill: rgb(249 252 255 / 27%);
  filter: drop-shadow(0 3px 7px rgb(50 76 99 / 13%));
  opacity: 0.8;
}

.ys-weather-art__cloud--front {
  fill: rgb(240 247 252 / 42%);
  filter: drop-shadow(0 4px 9px rgb(41 67 92 / 16%));
}

.ys-weather-art.is-overcast .ys-weather-art__cloud--back {
  fill: rgb(156 176 195 / 34%);
}

.ys-weather-art.is-overcast .ys-weather-art__cloud--front {
  fill: rgb(196 211 224 / 36%);
}

.ys-weather-art__cloud-edge,
.ys-weather-art__rain-cloud-edge {
  fill: none;
  stroke: rgb(255 255 255 / 34%);
  stroke-linecap: round;
  stroke-width: 1.4;
  vector-effect: non-scaling-stroke;
}

.ys-weather-art__rain-cloud {
  transform-box: fill-box;
  transform-origin: center;
}

.ys-weather-art__rain-cloud-shadow {
  fill: rgb(211 228 239 / 38%);
  filter: drop-shadow(0 5px 9px rgb(30 63 91 / 19%));
}

.ys-weather-art.is-drizzle .ys-weather-art__rain-cloud-shadow {
  fill: rgb(229 241 248 / 32%);
}

.ys-weather-art.is-heavy-rain .ys-weather-art__rain-cloud-shadow,
.ys-weather-art.is-storm .ys-weather-art__rain-cloud-shadow {
  fill: rgb(157 185 207 / 40%);
}

.ys-weather-art__drop {
  fill: none;
  stroke: rgb(225 245 255 / 76%);
  stroke-linecap: round;
  stroke-width: 1.55;
  vector-effect: non-scaling-stroke;
  transform-box: fill-box;
  transform-origin: center;
}

.ys-weather-art.is-drizzle .ys-weather-art__drop {
  stroke-width: 1.15;
  opacity: 0.58;
}

.ys-weather-art.is-drizzle .ys-weather-art__drop--2,
.ys-weather-art.is-drizzle .ys-weather-art__drop--4,
.ys-weather-art.is-drizzle .ys-weather-art__drop--6,
.ys-weather-art.is-drizzle .ys-weather-art__drop--7,
.ys-weather-art.is-rain .ys-weather-art__drop--6,
.ys-weather-art.is-rain .ys-weather-art__drop--7 {
  display: none;
}

.ys-weather-art.is-heavy-rain .ys-weather-art__drop,
.ys-weather-art.is-storm .ys-weather-art__drop {
  stroke-width: 1.85;
}

.ys-weather-art__lightning {
  fill: rgb(255 239 184 / 60%);
  filter: drop-shadow(0 0 5px rgb(255 233 162 / 38%));
  transform-box: fill-box;
  transform-origin: center;
}

.ys-weather-art__fog-glow {
  fill: rgb(255 255 255 / 16%);
  filter: blur(5px);
}

.ys-weather-art__fog-cloud {
  fill: rgb(220 231 238 / 22%);
  filter: drop-shadow(0 4px 10px rgb(65 86 103 / 12%));
}

.ys-weather-art__fog-line {
  fill: none;
  stroke: rgb(248 251 252 / 55%);
  stroke-linecap: round;
  stroke-width: 4.2;
  vector-effect: non-scaling-stroke;
  transform-box: fill-box;
  transform-origin: center;
}

.ys-weather-art__fog-line--2 {
  stroke: rgb(219 230 236 / 46%);
  stroke-width: 5.2;
}

.ys-weather-art__snow-cloud {
  fill: rgb(229 244 252 / 30%);
  filter: drop-shadow(0 4px 9px rgb(61 103 129 / 16%));
  transform-box: fill-box;
  transform-origin: center;
}

.ys-weather-art__snowflake {
  fill: none;
  stroke: rgb(249 254 255 / 88%);
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
  transform-box: fill-box;
  transform-origin: center;
}

.ys-weather-art__snowflake--main {
  stroke-width: 1.9;
  filter: drop-shadow(0 0 5px rgb(211 241 255 / 82%));
}

.ys-weather-art__snowflake--small {
  stroke-width: 1.35;
  opacity: 0.78;
}

@media (prefers-reduced-motion: no-preference) {
  .ys-weather-art__clear-sun {
    animation: ys-weather-art-clear-breathe 6.8s ease-in-out infinite;
    animation-delay: var(--ys-weather-phase, 0ms);
  }

  .ys-weather-art__sun-halo {
    animation: ys-weather-art-halo 7s ease-in-out infinite;
    animation-delay: var(--ys-weather-phase, 0ms);
  }

  .ys-weather-art__cloud--back {
    animation: ys-weather-art-cloud-back 6.4s ease-in-out infinite;
    animation-delay: var(--ys-weather-phase, 0ms);
  }

  .ys-weather-art__cloud--front,
  .ys-weather-art__rain-cloud {
    animation: ys-weather-art-cloud-front 5.2s ease-in-out infinite;
    animation-delay: var(--ys-weather-phase, 0ms);
  }

  .ys-weather-art__drop {
    --ys-weather-offset: calc(var(--fx-seed, 0) * -0.08s);
    animation: ys-weather-art-rain-fall 1.45s ease-in infinite;
    animation-delay: calc(var(--ys-weather-phase, 0ms) + var(--ys-weather-offset, 0s));
  }

  .ys-weather-art__drop--2 { --ys-weather-offset: -0.9s; }
  .ys-weather-art__drop--3 { --ys-weather-offset: -0.35s; }
  .ys-weather-art__drop--4 { --ys-weather-offset: -1.16s; }
  .ys-weather-art__drop--5 { --ys-weather-offset: -0.62s; }
  .ys-weather-art__drop--6 { --ys-weather-offset: -1.31s; }
  .ys-weather-art__drop--7 { --ys-weather-offset: -0.18s; }

  .ys-weather-art.is-drizzle .ys-weather-art__drop { animation-duration: 2.15s; }
  .ys-weather-art.is-heavy-rain .ys-weather-art__drop { animation-duration: 1.05s; }
  .ys-weather-art.is-storm .ys-weather-art__drop { animation-duration: 1.16s; }

  .ys-weather-art__lightning {
    animation: ys-weather-art-lightning 6.8s ease-in-out infinite;
    animation-delay: var(--ys-weather-phase, 0ms);
  }

  .ys-weather-art__fog-line--1 {
    animation: ys-weather-art-fog-right 5.8s ease-in-out infinite;
    animation-delay: var(--ys-weather-phase, 0ms);
  }

  .ys-weather-art__fog-line--2 {
    animation: ys-weather-art-fog-left 6.8s ease-in-out infinite;
    animation-delay: var(--ys-weather-phase, 0ms);
  }

  .ys-weather-art__fog-line--3 {
    animation: ys-weather-art-fog-right 7.6s ease-in-out infinite;
    animation-delay: calc(var(--ys-weather-phase, 0ms) - 2s);
  }

  .ys-weather-art__snow-cloud {
    animation: ys-weather-art-cloud-back 6.4s ease-in-out infinite;
    animation-delay: var(--ys-weather-phase, 0ms);
  }

  .ys-weather-art__snowflake--main {
    animation: ys-weather-art-snow-main 7.5s ease-in-out infinite;
    animation-delay: var(--ys-weather-phase, 0ms);
  }

  .ys-weather-art__snowflake--small {
    animation: ys-weather-art-snow-small 5.8s ease-in-out infinite;
    animation-delay: calc(var(--ys-weather-phase, 0ms) - 2.4s);
  }
}

@keyframes ys-weather-art-clear-breathe {
  0%, 100% { opacity: 0.82; transform: scale(0.96); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes ys-weather-art-halo {
  0%, 100% { opacity: 0.72; transform: scale(0.96); }
  50% { opacity: 1; transform: scale(1.04); }
}

@keyframes ys-weather-art-cloud-back {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(2px, -2px, 0); }
}

@keyframes ys-weather-art-cloud-front {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(-1.5px, -2px, 0); }
}

@keyframes ys-weather-art-rain-fall {
  0% { opacity: 0; transform: translate3d(0, -5px, 0); }
  16% { opacity: 0.88; }
  82% { opacity: 0.72; }
  100% { opacity: 0; transform: translate3d(0, 15px, 0); }
}

@keyframes ys-weather-art-lightning {
  0%, 76%, 100% { opacity: 0.24; transform: scale(0.98); }
  82% { opacity: 0.66; transform: scale(1.02); }
}

@keyframes ys-weather-art-fog-right {
  0%, 100% { opacity: 0.72; transform: translate3d(-2px, 0, 0); }
  50% { opacity: 1; transform: translate3d(3px, 0, 0); }
}

@keyframes ys-weather-art-fog-left {
  0%, 100% { opacity: 0.88; transform: translate3d(2px, 0, 0); }
  50% { opacity: 0.66; transform: translate3d(-3px, 0, 0); }
}

@keyframes ys-weather-art-snow-main {
  0%, 100% { opacity: 0.72; transform: translate3d(0, -3px, 0) rotate(-5deg); }
  50% { opacity: 1; transform: translate3d(-3px, 4px, 0) rotate(7deg); }
}

@keyframes ys-weather-art-snow-small {
  0%, 100% { opacity: 0.44; transform: translate3d(2px, -4px, 0) rotate(5deg); }
  50% { opacity: 0.8; transform: translate3d(-2px, 5px, 0) rotate(-8deg); }
}

@media (prefers-reduced-motion: reduce) {
  .ys-weather-art * { animation: none !important; }
}
</style>
