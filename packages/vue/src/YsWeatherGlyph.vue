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
    <i class="ys-weather-glyph__fall ys-weather-glyph__fall--primary" aria-hidden="true" />
    <i class="ys-weather-glyph__fall ys-weather-glyph__fall--secondary" aria-hidden="true" />
    <i class="ys-weather-glyph__accent" aria-hidden="true" />
  </span>
</template>

<style>
.ys-weather-glyph {
  --ys-weather-sun: #f3b33d;
  --ys-weather-cloud: #899db4;
  --ys-weather-cloud-back: #b3c0ce;
  --ys-weather-precip: #4d8fdc;
  --ys-weather-accent: #f5c84b;

  position: relative;
  display: inline-block;
  flex: 0 0 auto;
  width: 1em;
  height: 1em;
  color: currentcolor;
  line-height: 1;
  overflow: hidden;
  contain: layout paint style;
  transform: translateZ(0);
  vertical-align: middle;
}

.ys-weather-glyph.is-clear {
  --ys-weather-sun: #f4ad32;
}

.ys-weather-glyph.is-cloudy {
  --ys-weather-sun: #f2b23d;
  --ys-weather-cloud: #839bb5;
  --ys-weather-cloud-back: #c1ccd8;
}

.ys-weather-glyph.is-overcast {
  --ys-weather-cloud: #74889f;
  --ys-weather-cloud-back: #aab8c7;
}

.ys-weather-glyph.is-fog {
  --ys-weather-cloud: #91a0af;
  --ys-weather-precip: #aebbc8;
}

.ys-weather-glyph.is-drizzle {
  --ys-weather-cloud: #7891aa;
  --ys-weather-precip: #62a3e7;
}

.ys-weather-glyph.is-rain {
  --ys-weather-cloud: #657e9a;
  --ys-weather-precip: #4b91df;
}

.ys-weather-glyph.is-heavy-rain {
  --ys-weather-cloud: #526c8a;
  --ys-weather-precip: #327fd4;
}

.ys-weather-glyph.is-storm {
  --ys-weather-cloud: #626c87;
  --ys-weather-precip: #4e88d2;
  --ys-weather-accent: #f4c542;
}

.ys-weather-glyph.is-snow {
  --ys-weather-cloud: #8198ad;
  --ys-weather-precip: #77bce5;
}

.ys-weather-glyph.is-neutral {
  --ys-weather-cloud: #8b98a7;
}

.ys-weather-glyph > i {
  position: absolute;
  display: block;
  box-sizing: border-box;
  transform-origin: center;
}

.ys-weather-glyph__rays {
  color: var(--ys-weather-sun);
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
  color: var(--ys-weather-sun);
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
  color: var(--ys-weather-cloud-back);
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
  color: var(--ys-weather-cloud);
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
  color: var(--ys-weather-precip);
  right: 0.13em;
  bottom: -0.08em;
  width: 0.48em;
  height: 0.3em;
  opacity: 0;
}

.ys-weather-glyph__fall--secondary {
  right: 0.07em;
  bottom: -0.03em;
  --ys-fall-scale: 0.82;
}

.ys-weather-glyph__accent {
  color: var(--ys-weather-accent);
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
  --ys-fall-opacity: 0.9;
  background:
    linear-gradient(164deg, transparent 0 40%, currentcolor 42% 58%, transparent 60%) 0 0 / 0.15em 0.25em,
    linear-gradient(164deg, transparent 0 40%, currentcolor 42% 58%, transparent 60%) 0.08em 0.11em / 0.19em 0.3em;
}

.ys-weather-glyph.is-rain .ys-weather-glyph__fall--secondary,
.ys-weather-glyph.is-heavy-rain .ys-weather-glyph__fall--secondary,
.ys-weather-glyph.is-drizzle .ys-weather-glyph__fall--secondary,
.ys-weather-glyph.is-storm .ys-weather-glyph__fall--secondary {
  background-position: 0.05em -0.03em, 0.14em 0.08em;
}

.ys-weather-glyph.is-drizzle .ys-weather-glyph__fall { --ys-fall-opacity: 0.58; }
.ys-weather-glyph.is-heavy-rain .ys-weather-glyph__fall { height: 0.38em; --ys-fall-opacity: 1; }

.ys-weather-glyph.is-snow .ys-weather-glyph__fall {
  bottom: 0.02em;
  width: 0.1em;
  height: 0.1em;
  opacity: 0.92;
  background: currentcolor;
  border-radius: 50%;
  box-shadow: 0.18em 0.04em 0 currentcolor, 0.36em -0.02em 0 currentcolor;
}

.ys-weather-glyph.is-snow .ys-weather-glyph__fall--secondary {
  right: 0.24em;
  bottom: 0.08em;
  width: 0.075em;
  height: 0.075em;
  box-shadow: 0.16em -0.02em 0 currentcolor, 0.31em 0.05em 0 currentcolor;
  --ys-fall-scale: 0.86;
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

.ys-weather-glyph.is-fog .ys-weather-glyph__fall--secondary {
  right: 0.16em;
  bottom: 0.08em;
  width: 0.68em;
  height: 0.055em;
  box-shadow: 0 -0.14em 0 currentcolor;
  opacity: 0.48;
}

.ys-weather-glyph.is-storm .ys-weather-glyph__fall {
  --ys-fall-opacity: 0.72;
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
  .ys-weather-glyph.is-animated.is-clear .ys-weather-glyph__rays {
    animation: ys-weather-glyph-rotate 14s linear infinite;
    will-change: transform;
  }

  .ys-weather-glyph.is-animated.is-clear .ys-weather-glyph__sun {
    animation: ys-weather-glyph-pulse 5.6s linear infinite;
    will-change: transform, opacity;
  }

  .ys-weather-glyph.is-animated.is-cloudy .ys-weather-glyph__sun {
    animation: ys-weather-glyph-sun-peek 6.8s linear infinite;
    will-change: transform, opacity;
  }

  .ys-weather-glyph.is-animated:not(.is-clear):not(.is-neutral) .ys-weather-glyph__cloud {
    animation: ys-weather-glyph-cloud-orbit 7.2s linear infinite;
    will-change: transform;
  }

  .ys-weather-glyph.is-animated.is-cloudy .ys-weather-glyph__cloud-back,
  .ys-weather-glyph.is-animated.is-overcast .ys-weather-glyph__cloud-back {
    animation: ys-weather-glyph-cloud-orbit-back 9.2s linear infinite;
    will-change: transform;
  }

  .ys-weather-glyph.is-animated.is-drizzle { --ys-precip-duration: 1.7s; --ys-precip-delay: -0.85s; }
  .ys-weather-glyph.is-animated.is-rain { --ys-precip-duration: 0.84s; --ys-precip-delay: -0.42s; }
  .ys-weather-glyph.is-animated.is-heavy-rain { --ys-precip-duration: 0.58s; --ys-precip-delay: -0.29s; }
  .ys-weather-glyph.is-animated.is-storm { --ys-precip-duration: 0.68s; --ys-precip-delay: -0.34s; }

  .ys-weather-glyph.is-animated:is(.is-drizzle, .is-rain, .is-heavy-rain, .is-storm) .ys-weather-glyph__fall {
    animation: ys-weather-glyph-precip var(--ys-precip-duration) linear infinite;
    will-change: transform, opacity;
  }

  .ys-weather-glyph.is-animated:is(.is-drizzle, .is-rain, .is-heavy-rain, .is-storm) .ys-weather-glyph__fall--secondary {
    animation-delay: var(--ys-precip-delay);
  }

  .ys-weather-glyph.is-animated.is-snow .ys-weather-glyph__fall {
    animation: ys-weather-glyph-snow-stream 3.6s linear infinite;
    will-change: transform, opacity;
  }

  .ys-weather-glyph.is-animated.is-snow .ys-weather-glyph__fall--secondary {
    animation-delay: -1.8s;
  }

  .ys-weather-glyph.is-animated.is-fog .ys-weather-glyph__fall {
    animation: ys-weather-glyph-fog-cycle 5.8s linear infinite;
    will-change: transform, opacity;
  }

  .ys-weather-glyph.is-animated.is-fog .ys-weather-glyph__fall--secondary {
    animation-delay: -3.2s;
    animation-duration: 6.4s;
  }

  .ys-weather-glyph.is-animated.is-storm .ys-weather-glyph__accent {
    animation: ys-weather-glyph-flash 5.2s linear -1.4s infinite;
    will-change: transform, opacity;
  }
}

@keyframes ys-weather-glyph-rotate { to { transform: rotate(360deg); } }

@keyframes ys-weather-glyph-pulse {
  0%, 100% { opacity: 0.9; transform: scale(0.96); }
  25% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.92; transform: scale(0.97); }
  75% { opacity: 0.82; transform: scale(0.93); }
}

@keyframes ys-weather-glyph-sun-peek {
  0%, 100% { opacity: 0.82; transform: translate3d(0, 0.01em, 0) scale(0.96); }
  25% { opacity: 1; transform: translate3d(0.015em, -0.015em, 0) scale(1.02); }
  50% { opacity: 0.88; transform: translate3d(0, -0.005em, 0) scale(0.98); }
  75% { opacity: 0.72; transform: translate3d(-0.012em, 0.012em, 0) scale(0.94); }
}

@keyframes ys-weather-glyph-cloud-orbit {
  0%, 100% { transform: translate3d(0, 0.016em, 0); }
  12.5% { transform: translate3d(-0.028em, 0.014em, 0); }
  25% { transform: translate3d(-0.04em, 0, 0); }
  37.5% { transform: translate3d(-0.028em, -0.014em, 0); }
  50% { transform: translate3d(0, -0.018em, 0); }
  62.5% { transform: translate3d(0.028em, -0.014em, 0); }
  75% { transform: translate3d(0.04em, 0, 0); }
  87.5% { transform: translate3d(0.028em, 0.014em, 0); }
}

@keyframes ys-weather-glyph-cloud-orbit-back {
  0%, 100% { transform: translate3d(0, -0.014em, 0); }
  25% { transform: translate3d(0.035em, 0, 0); }
  50% { transform: translate3d(0, 0.018em, 0); }
  75% { transform: translate3d(-0.035em, 0, 0); }
}

@keyframes ys-weather-glyph-precip {
  0%, 12% { opacity: 0; transform: translate3d(0.055em, -0.16em, 0) scale(var(--ys-fall-scale, 1)); }
  24% { opacity: var(--ys-fall-opacity, 0.9); }
  78% { opacity: var(--ys-fall-opacity, 0.9); }
  100% { opacity: 0; transform: translate3d(-0.075em, 0.16em, 0) scale(var(--ys-fall-scale, 1)); }
}

@keyframes ys-weather-glyph-snow-stream {
  0%, 10% { opacity: 0; transform: translate3d(0.045em, -0.15em, 0) rotate(-8deg) scale(var(--ys-fall-scale, 1)); }
  24% { opacity: 0.9; }
  48% { transform: translate3d(-0.045em, 0.02em, 0) rotate(4deg) scale(var(--ys-fall-scale, 1)); }
  78% { opacity: 0.82; }
  100% { opacity: 0; transform: translate3d(0.055em, 0.24em, 0) rotate(12deg) scale(var(--ys-fall-scale, 1)); }
}

@keyframes ys-weather-glyph-fog-cycle {
  0%, 100% { opacity: 0.64; transform: translate3d(0, 0, 0); }
  25% { opacity: 0.82; transform: translate3d(0.08em, 0, 0); }
  50% { opacity: 0.68; transform: translate3d(0, 0, 0); }
  75% { opacity: 0.5; transform: translate3d(-0.08em, 0, 0); }
}

@keyframes ys-weather-glyph-flash {
  0%, 72%, 86%, 100% { opacity: 0.18; transform: scale(0.96); }
  76% { opacity: 0.92; transform: scale(1.04); }
  79% { opacity: 0.26; transform: scale(0.98); }
  82% { opacity: 1; transform: scale(1.06); }
}

@media (prefers-reduced-motion: reduce) {
  .ys-weather-glyph > i {
    animation: none !important;
    will-change: auto;
  }

  .ys-weather-glyph__fall--secondary { display: none; }
}
</style>
