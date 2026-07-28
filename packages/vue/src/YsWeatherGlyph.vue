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
  rain: '雨', 'heavy-rain': '大雨', storm: '雷雨', snow: '雪', neutral: '天气待更新',
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
    <i class="ys-weather-glyph__rays" aria-hidden="true" />
    <i class="ys-weather-glyph__sun" aria-hidden="true" />
    <i class="ys-weather-glyph__cloud-back" aria-hidden="true" />
    <i class="ys-weather-glyph__cloud" aria-hidden="true" />
    <i class="ys-weather-glyph__fall" aria-hidden="true" />
    <i class="ys-weather-glyph__accent" aria-hidden="true" />
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
  overflow: hidden;
  vertical-align: middle;
}

.ys-weather-glyph > i { position: absolute; display: block; box-sizing: border-box; }

.ys-weather-glyph__rays {
  top: 0.11em;
  left: 0.11em;
  width: 0.78em;
  height: 0.78em;
  background: repeating-conic-gradient(from 0deg, currentcolor 0 8deg, transparent 8deg 42deg);
  border-radius: 50%;
  opacity: 0;
  -webkit-mask: radial-gradient(circle, transparent 0 42%, #000 44% 67%, transparent 69%);
  mask: radial-gradient(circle, transparent 0 42%, #000 44% 67%, transparent 69%);
}

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

.ys-weather-glyph__cloud-back {
  right: 0.13em;
  bottom: 0.38em;
  width: 0.54em;
  height: 0.23em;
  background: currentcolor;
  border-radius: 0.18em;
  opacity: 0;
  box-shadow: -0.12em -0.08em 0 -0.01em currentcolor, 0.12em -0.12em 0 0.01em currentcolor;
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
  bottom: -0.08em;
  width: 0.48em;
  height: 0.3em;
  opacity: 0;
}

.ys-weather-glyph__accent {
  right: 0.27em;
  bottom: -0.02em;
  width: 0.19em;
  height: 0.36em;
  opacity: 0;
}

.ys-weather-glyph.is-clear .ys-weather-glyph__sun { top: 0.22em; left: 0.22em; width: 0.56em; height: 0.56em; }
.ys-weather-glyph.is-clear .ys-weather-glyph__rays { opacity: 0.72; }
.ys-weather-glyph.is-clear .ys-weather-glyph__cloud,
.ys-weather-glyph.is-clear .ys-weather-glyph__cloud-back,
.ys-weather-glyph.is-neutral .ys-weather-glyph__sun,
.ys-weather-glyph.is-neutral .ys-weather-glyph__rays,
.ys-weather-glyph.is-neutral .ys-weather-glyph__cloud-back,
.ys-weather-glyph.is-neutral .ys-weather-glyph__fall,
.ys-weather-glyph.is-neutral .ys-weather-glyph__accent { display: none; }
.ys-weather-glyph.is-neutral .ys-weather-glyph__cloud { right: 0.14em; bottom: 0.28em; opacity: 0.58; }
.ys-weather-glyph.is-cloudy .ys-weather-glyph__cloud-back,
.ys-weather-glyph.is-overcast .ys-weather-glyph__cloud-back { opacity: 0.42; }
.ys-weather-glyph.is-overcast .ys-weather-glyph__cloud { opacity: 0.9; }
.ys-weather-glyph.is-overcast .ys-weather-glyph__sun,
.ys-weather-glyph.is-rain .ys-weather-glyph__sun,
.ys-weather-glyph.is-heavy-rain .ys-weather-glyph__sun,
.ys-weather-glyph.is-drizzle .ys-weather-glyph__sun,
.ys-weather-glyph.is-storm .ys-weather-glyph__sun,
.ys-weather-glyph.is-snow .ys-weather-glyph__sun,
.ys-weather-glyph.is-fog .ys-weather-glyph__sun,
.ys-weather-glyph:not(.is-clear) .ys-weather-glyph__rays { display: none; }

.ys-weather-glyph.is-rain .ys-weather-glyph__fall,
.ys-weather-glyph.is-heavy-rain .ys-weather-glyph__fall,
.ys-weather-glyph.is-drizzle .ys-weather-glyph__fall {
  opacity: 0.9;
  background:
    linear-gradient(164deg, transparent 0 40%, currentcolor 42% 58%, transparent 60%) 0 0 / 0.15em 0.25em,
    linear-gradient(164deg, transparent 0 40%, currentcolor 42% 58%, transparent 60%) 0.08em 0.11em / 0.19em 0.3em;
}

.ys-weather-glyph.is-drizzle .ys-weather-glyph__fall { opacity: 0.62; }
.ys-weather-glyph.is-heavy-rain .ys-weather-glyph__fall { height: 0.38em; opacity: 1; }

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
  opacity: 0.72;
  background:
    linear-gradient(164deg, transparent 0 40%, currentcolor 42% 58%, transparent 60%) 0 0 / 0.15em 0.25em,
    linear-gradient(164deg, transparent 0 40%, currentcolor 42% 58%, transparent 60%) 0.08em 0.11em / 0.19em 0.3em;
}

.ys-weather-glyph.is-storm .ys-weather-glyph__accent {
  opacity: 1;
  background: currentcolor;
  clip-path: polygon(52% 0, 100% 0, 67% 43%, 100% 43%, 25% 100%, 43% 56%, 12% 56%);
}

@media (prefers-reduced-motion: no-preference) {
  .ys-weather-glyph.is-animated.is-clear .ys-weather-glyph__rays { animation: ys-weather-glyph-rotate 12s linear infinite; }
  .ys-weather-glyph.is-animated.is-clear .ys-weather-glyph__sun { animation: ys-weather-glyph-pulse 3.8s ease-in-out infinite; }
  .ys-weather-glyph.is-animated.is-cloudy .ys-weather-glyph__cloud,
  .ys-weather-glyph.is-animated.is-overcast .ys-weather-glyph__cloud { animation: ys-weather-glyph-drift 4.8s ease-in-out infinite alternate; }
  .ys-weather-glyph.is-animated.is-cloudy .ys-weather-glyph__cloud-back,
  .ys-weather-glyph.is-animated.is-overcast .ys-weather-glyph__cloud-back { animation: ys-weather-glyph-drift-back 6.4s ease-in-out infinite alternate; }
  .ys-weather-glyph.is-animated.is-rain .ys-weather-glyph__fall { animation: ys-weather-glyph-rain 0.78s linear infinite; }
  .ys-weather-glyph.is-animated.is-heavy-rain .ys-weather-glyph__fall { animation: ys-weather-glyph-rain 0.52s linear infinite; }
  .ys-weather-glyph.is-animated.is-drizzle .ys-weather-glyph__fall { animation: ys-weather-glyph-rain 1.35s linear infinite; }
  .ys-weather-glyph.is-animated.is-snow .ys-weather-glyph__fall { animation: ys-weather-glyph-snow 2.8s ease-in-out infinite; }
  .ys-weather-glyph.is-animated.is-fog .ys-weather-glyph__fall { animation: ys-weather-glyph-fog 3.8s ease-in-out infinite alternate; }
  .ys-weather-glyph.is-animated.is-storm .ys-weather-glyph__fall { animation: ys-weather-glyph-rain 0.62s linear infinite; }
  .ys-weather-glyph.is-animated.is-storm .ys-weather-glyph__accent { animation: ys-weather-glyph-flash 4s steps(1, end) infinite; }
}

@keyframes ys-weather-glyph-rotate { to { transform: rotate(360deg); } }
@keyframes ys-weather-glyph-pulse { 50% { opacity: 0.8; transform: scale(0.9); } }
@keyframes ys-weather-glyph-drift { to { transform: translate3d(-0.08em, 0, 0); } }
@keyframes ys-weather-glyph-drift-back { to { transform: translate3d(0.08em, 0.02em, 0); } }
@keyframes ys-weather-glyph-rain {
  from { transform: translate3d(0.05em, -0.12em, 0); }
  to { transform: translate3d(-0.08em, 0.12em, 0); }
}
@keyframes ys-weather-glyph-snow { 50% { transform: translate3d(-0.08em, 0.07em, 0) rotate(8deg); } }
@keyframes ys-weather-glyph-fog { to { transform: translate3d(0.1em, 0, 0); opacity: 0.48; } }
@keyframes ys-weather-glyph-flash { 0%, 88%, 92%, 96%, 100% { opacity: 0.16; } 89%, 93% { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .ys-weather-glyph > i { animation: none !important; }
}
</style>
