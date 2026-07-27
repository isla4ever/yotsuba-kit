<script setup lang="ts">
import type { WeatherKind } from '@iyotsuba/schedule-core'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  kind: WeatherKind
  size?: number
  animate?: boolean
  label?: string
}>(), {
  size: 16,
  animate: true,
})

const labels: Record<WeatherKind, string> = {
  clear: '晴', cloudy: '多云', overcast: '阴', fog: '雾', drizzle: '毛毛雨',
  rain: '雨', storm: '雷雨', snow: '雪', neutral: '天气待更新',
}
const style = computed(() => ({ fontSize: `${Math.max(10, props.size)}px` }))
</script>

<template>
  <span
    class="ys-weather-glyph"
    :class="[`is-${kind}`, { 'is-animated': animate }]"
    :style="style"
    role="img"
    :aria-label="label ?? labels[kind]"
  >
    <i class="ys-weather-glyph__sun" aria-hidden="true" />
    <i class="ys-weather-glyph__cloud" aria-hidden="true" />
    <i class="ys-weather-glyph__fall" aria-hidden="true" />
  </span>
</template>

<style>
.ys-weather-glyph {
  position: relative;
  display: inline-block;
  flex: 0 0 auto;
  width: 1em;
  height: 1em;
  color: currentcolor;
  line-height: 1;
  vertical-align: middle;
}

.ys-weather-glyph > i { position: absolute; display: block; box-sizing: border-box; }

.ys-weather-glyph__sun {
  top: 0.08em;
  left: 0.08em;
  width: 0.48em;
  height: 0.48em;
  background: currentcolor;
  border: 0.09em solid rgb(255 255 255 / 36%);
  border-radius: 50%;
  box-shadow: 0 0 0 0.06em color-mix(in srgb, currentcolor 48%, transparent);
}

.ys-weather-glyph__cloud {
  right: 0.05em;
  bottom: 0.18em;
  width: 0.7em;
  height: 0.34em;
  background: currentcolor;
  border-radius: 0.22em;
  box-shadow: inset 0 -0.05em 0 rgb(0 0 0 / 10%);
}

.ys-weather-glyph__cloud::before,
.ys-weather-glyph__cloud::after {
  position: absolute;
  bottom: 0.08em;
  content: '';
  background: inherit;
  border-radius: 50%;
}

.ys-weather-glyph__cloud::before { left: 0.1em; width: 0.32em; height: 0.32em; }
.ys-weather-glyph__cloud::after { right: 0.1em; width: 0.42em; height: 0.42em; }

.ys-weather-glyph__fall {
  right: 0.13em;
  bottom: 0;
  width: 0.48em;
  height: 0.18em;
  opacity: 0;
}

.ys-weather-glyph.is-clear .ys-weather-glyph__sun { top: 0.22em; left: 0.22em; width: 0.56em; height: 0.56em; }
.ys-weather-glyph.is-clear .ys-weather-glyph__cloud,
.ys-weather-glyph.is-neutral .ys-weather-glyph__sun,
.ys-weather-glyph.is-neutral .ys-weather-glyph__fall { display: none; }
.ys-weather-glyph.is-neutral .ys-weather-glyph__cloud { right: 0.14em; bottom: 0.28em; opacity: 0.58; }
.ys-weather-glyph.is-overcast .ys-weather-glyph__sun,
.ys-weather-glyph.is-rain .ys-weather-glyph__sun,
.ys-weather-glyph.is-drizzle .ys-weather-glyph__sun,
.ys-weather-glyph.is-storm .ys-weather-glyph__sun,
.ys-weather-glyph.is-snow .ys-weather-glyph__sun,
.ys-weather-glyph.is-fog .ys-weather-glyph__sun { display: none; }

.ys-weather-glyph.is-rain .ys-weather-glyph__fall,
.ys-weather-glyph.is-drizzle .ys-weather-glyph__fall {
  opacity: 0.9;
  background: repeating-linear-gradient(112deg, transparent 0 0.09em, currentcolor 0.1em 0.15em, transparent 0.16em 0.23em);
}

.ys-weather-glyph.is-drizzle .ys-weather-glyph__fall { opacity: 0.62; }

.ys-weather-glyph.is-snow .ys-weather-glyph__fall {
  bottom: 0.02em;
  width: 0.1em;
  height: 0.1em;
  opacity: 0.92;
  background: currentcolor;
  border-radius: 50%;
  box-shadow: 0.18em 0.04em 0 currentcolor, 0.36em -0.02em 0 currentcolor;
}

.ys-weather-glyph.is-fog .ys-weather-glyph__fall {
  right: 0.05em;
  bottom: 0.03em;
  width: 0.82em;
  height: 0.07em;
  opacity: 0.75;
  background: currentcolor;
  border-radius: 1em;
  box-shadow: 0 -0.14em 0 currentcolor;
}

.ys-weather-glyph.is-storm .ys-weather-glyph__fall {
  right: 0.26em;
  bottom: -0.03em;
  width: 0.2em;
  height: 0.34em;
  opacity: 1;
  background: currentcolor;
  clip-path: polygon(52% 0, 100% 0, 67% 43%, 100% 43%, 25% 100%, 43% 56%, 12% 56%);
}

.ys-weather-glyph.is-animated.is-clear .ys-weather-glyph__sun { animation: ys-weather-glyph-pulse 3.8s ease-in-out infinite; }
.ys-weather-glyph.is-animated.is-cloudy .ys-weather-glyph__cloud,
.ys-weather-glyph.is-animated.is-overcast .ys-weather-glyph__cloud { animation: ys-weather-glyph-drift 4.8s ease-in-out infinite alternate; }
.ys-weather-glyph.is-animated.is-rain .ys-weather-glyph__fall,
.ys-weather-glyph.is-animated.is-drizzle .ys-weather-glyph__fall { animation: ys-weather-glyph-rain 1s linear infinite; }
.ys-weather-glyph.is-animated.is-snow .ys-weather-glyph__fall { animation: ys-weather-glyph-snow 2.8s ease-in-out infinite; }
.ys-weather-glyph.is-animated.is-storm .ys-weather-glyph__fall { animation: ys-weather-glyph-flash 4s steps(1, end) infinite; }

@keyframes ys-weather-glyph-pulse { 50% { opacity: 0.76; transform: scale(0.88); } }
@keyframes ys-weather-glyph-drift { to { transform: translateX(-0.08em); } }
@keyframes ys-weather-glyph-rain { to { transform: translate3d(-0.08em, 0.08em, 0); } }
@keyframes ys-weather-glyph-snow { 50% { transform: translate3d(-0.08em, 0.05em, 0); } }
@keyframes ys-weather-glyph-flash { 0%, 92%, 96%, 100% { opacity: 0.25; } 93%, 97% { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .ys-weather-glyph > i { animation: none !important; }
}
</style>
