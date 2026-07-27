<script setup lang="ts">
import {
  CalendarDays,
  CloudSun,
  Command,
  Layers3,
  LayoutDashboard,
  Maximize2,
  Minimize2,
  Moon,
  Palette,
  Sparkles,
  Sun,
  Workflow,
} from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import KitMobileDemo from './KitMobileDemo.vue'
import ReactCountUp from './ReactCountUp.vue'

const props = withDefaults(defineProps<{ lang?: 'zh' | 'en' }>(), { lang: 'zh' })

const t = computed(() => props.lang === 'zh'
  ? {
      badge: 'current main · 0.6.0 API · registry latest 0.5.0',
      title1: '把复杂课表，',
      title2: '做成清晰的组件接口。',
      sub: '中国高校学期语义、天气联动、教材与任务、弹层编排和移动端 Today，都由受控数据与可替换视图组成。',
      start: '开始接入',
      github: 'GitHub',
      install: 'pnpm add @iyotsuba/schedule-vue@0.5.0',
      copied: '已复制',
      release: '0.6.0 能力已在 current main 和在线演示中；包注册表版本仍为 0.5.0，等待独立发版验证。',
      demoLabel: '真实移动端演示',
      focus: '聚焦全屏',
      closeFocus: '退出聚焦演示',
      stats: [
        { value: 0, label: 'core 运行时依赖' },
        { value: 7, label: '内置换周模式' },
        { value: 7, label: 'Today 内置模块' },
        { value: 4, label: 'Web 分发包' },
      ],
      features: [
        { icon: CalendarDays, title: '中国高校学期语义', desc: '单双周、调休补班、重叠课程和非本周状态，都在零依赖 core 中计算。' },
        { icon: CloudSun, title: '天气是受控数据', desc: '宿主注入天气快照；课程卡、星期栏、详情 Hero 与动态场景共享同一状态。' },
        { icon: Layers3, title: '详情与弹层可编排', desc: '字段、空值文案、操作区、课程详情层级和每类弹层位置都能单独配置。' },
        { icon: LayoutDashboard, title: '面向触摸的 Today', desc: '长按进入排版，整卡拖动智能让位，四角缩放，内置任务与课前携带清单。' },
        { icon: Workflow, title: '同一份能力，多种宿主', desc: 'core、Vue、React、Custom Elements 与 Flutter 保持同一数据边界与行为语义。' },
        { icon: Command, title: '交给宿主的副作用', desc: '定位、网络、日历、分享和持久化都显式授权，组件只发事件和公开方法。' },
      ],
    }
  : {
      badge: 'current main · 0.6.0 API · registry latest 0.5.0',
      title1: 'Complex timetables,',
      title2: 'clear component contracts.',
      sub: 'Academic-term semantics, weather, course materials, tasks, adaptive sheets and a touch-first Today dashboard all stay controlled and replaceable.',
      start: 'Get Started',
      github: 'GitHub',
      install: 'pnpm add @iyotsuba/schedule-vue@0.5.0',
      copied: 'Copied',
      release: 'The 0.6.0 API is available in current main and this live demo. The registry remains on 0.5.0 pending an independent release gate.',
      demoLabel: 'Live mobile demo',
      focus: 'Focus fullscreen',
      closeFocus: 'Exit focused demo',
      stats: [
        { value: 0, label: 'core runtime dependencies' },
        { value: 7, label: 'built-in transitions' },
        { value: 7, label: 'built-in Today modules' },
        { value: 4, label: 'Web packages' },
      ],
      features: [
        { icon: CalendarDays, title: 'Academic-term semantics', desc: 'Odd/even weeks, makeup days, overlaps and inactive states are calculated in a zero-dependency core.' },
        { icon: CloudSun, title: 'Weather stays controlled', desc: 'Inject one snapshot and share it across cards, weekday headers, detail heroes and dynamic scenes.' },
        { icon: Layers3, title: 'Composable details and sheets', desc: 'Fields, empty text, actions, detail transitions and each sheet placement remain independently configurable.' },
        { icon: LayoutDashboard, title: 'Today for touch', desc: 'Long press to arrange, drag whole cards with reflow, resize from four corners, and surface tasks and carry lists.' },
        { icon: Workflow, title: 'One contract, many hosts', desc: 'Core, Vue, React, Custom Elements and Flutter preserve the same data boundary and behavior.' },
        { icon: Command, title: 'Host-owned side effects', desc: 'Location, network, calendar, sharing and persistence stay explicitly authorized by the host app.' },
      ],
    })

const base = computed(() => props.lang === 'zh' ? '' : '/en')
const copied = ref(false)
const demoView = ref<'schedule' | 'today'>('schedule')
const demoTheme = ref<'light' | 'dark'>('light')
const weatherScene = ref(true)
const demoFocused = ref(false)
const inlineDemo = ref<InstanceType<typeof KitMobileDemo> | null>(null)
const focusedDemo = ref<InstanceType<typeof KitMobileDemo> | null>(null)

async function copyInstall() {
  try {
    await navigator.clipboard.writeText(t.value.install)
    copied.value = true
    window.setTimeout(() => copied.value = false, 1600)
  }
  catch {}
}

async function startGuide() {
  demoView.value = 'schedule'
  await nextTick()
  const target = demoFocused.value ? focusedDemo.value : inlineDemo.value
  target?.startGuide()
}

function toggleTheme() {
  demoTheme.value = demoTheme.value === 'light' ? 'dark' : 'light'
}

watch(demoFocused, (focused) => {
  document.body.classList.toggle('kit-demo-focus-open', focused)
})

onBeforeUnmount(() => document.body.classList.remove('kit-demo-focus-open'))
</script>

<template>
  <div class="kit-home">
    <section class="hero">
      <div class="hero__grid" aria-hidden="true" />
      <div class="hero__inner">
        <div class="hero__copy">
          <span class="hero__badge">{{ t.badge }}</span>
          <h1 class="hero__title">
            {{ t.title1 }}<br>
            <span>{{ t.title2 }}</span>
          </h1>
          <p class="hero__sub">{{ t.sub }}</p>
          <p class="hero__release">{{ t.release }}</p>
          <div class="hero__actions">
            <a class="hero__action hero__action--primary" :href="`${base}/guide/getting-started`">{{ t.start }}</a>
            <a class="hero__action hero__action--secondary" href="https://github.com/isla4ever/yotsuba-kit" target="_blank" rel="noreferrer">{{ t.github }}</a>
          </div>
          <button type="button" class="hero__install" :class="{ 'is-copied': copied }" @click="copyInstall">
            <span aria-hidden="true">$</span><code>{{ t.install }}</code><small>{{ copied ? t.copied : 'Copy' }}</small>
          </button>

          <dl class="hero__stats" aria-label="组件库能力概览">
            <div v-for="(stat, index) in t.stats" :key="stat.label" class="hero__stat">
              <dt><ReactCountUp :to="stat.value" :delay="index * 0.1" :duration="1.35" class-name="hero__stat-value" /></dt>
              <dd>{{ stat.label }}</dd>
            </div>
          </dl>
        </div>

        <div class="hero__demo" :aria-label="t.demoLabel">
          <div class="hero__device">
            <div class="hero__device-meta"><span>{{ t.demoLabel }}</span><b>390 × 844</b></div>
            <div class="phone" :class="{ 'is-dark': demoTheme === 'dark' }">
              <div class="phone__screen">
                <div class="phone__viewport">
                  <KitMobileDemo
                    ref="inlineDemo"
                    v-model:view="demoView"
                    v-model:theme="demoTheme"
                    v-model:weather-scene="weatherScene"
                  />
                </div>
              </div>
            </div>
          </div>

          <aside class="hero__dock" aria-label="演示控制">
            <button type="button" :class="{ 'is-active': demoView === 'schedule' }" title="课表" aria-label="课表" @click="demoView = 'schedule'"><CalendarDays :size="18" aria-hidden="true" /></button>
            <button type="button" :class="{ 'is-active': demoView === 'today' }" title="今日" aria-label="今日" @click="demoView = 'today'"><LayoutDashboard :size="18" aria-hidden="true" /></button>
            <button type="button" :class="{ 'is-active': weatherScene }" title="天气场景" aria-label="切换天气场景" @click="weatherScene = !weatherScene"><CloudSun :size="18" aria-hidden="true" /></button>
            <button type="button" :class="{ 'is-active': demoTheme === 'dark' }" title="切换主题" aria-label="切换主题" @click="toggleTheme"><Moon v-if="demoTheme === 'light'" :size="18" aria-hidden="true" /><Sun v-else :size="18" aria-hidden="true" /></button>
            <button type="button" title="体验引导" aria-label="体验引导" @click="startGuide"><Sparkles :size="18" aria-hidden="true" /></button>
            <button type="button" title="聚焦全屏" :aria-label="t.focus" @click="demoFocused = true"><Maximize2 :size="18" aria-hidden="true" /></button>
          </aside>
        </div>
      </div>
    </section>

    <section class="capabilities" aria-label="核心能力">
      <article v-for="feature in t.features" :key="feature.title" class="capability">
        <component :is="feature.icon" :size="22" stroke-width="1.7" aria-hidden="true" />
        <h2>{{ feature.title }}</h2>
        <p>{{ feature.desc }}</p>
      </article>
    </section>

    <Teleport to="body">
      <Transition name="demo-focus">
        <section v-if="demoFocused" class="demo-focus" role="dialog" aria-modal="true" :aria-label="t.demoLabel">
          <header class="demo-focus__bar">
            <span>{{ t.demoLabel }}</span>
            <button type="button" :aria-label="t.closeFocus" :title="t.closeFocus" @click="demoFocused = false"><Minimize2 :size="20" aria-hidden="true" /></button>
          </header>
          <div class="demo-focus__surface">
            <KitMobileDemo
              ref="focusedDemo"
              v-model:view="demoView"
              v-model:theme="demoTheme"
              v-model:weather-scene="weatherScene"
            />
          </div>
        </section>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.kit-home { color: var(--vp-c-text-1); background: var(--vp-c-bg); }
.hero { position: relative; overflow: hidden; color: #eef4f8; background: #101820; }
.hero__grid { position: absolute; inset: 0; opacity: 0.32; background-image: linear-gradient(rgb(213 232 240 / 12%) 1px, transparent 1px), linear-gradient(90deg, rgb(213 232 240 / 12%) 1px, transparent 1px); background-size: 40px 40px; mask-image: linear-gradient(to bottom, #000 35%, transparent 92%); }
.hero__inner { position: relative; display: grid; grid-template-columns: minmax(0, 0.94fr) minmax(440px, 1.06fr); gap: 46px; align-items: start; max-width: 1180px; padding: 48px 28px 28px; margin: 0 auto; }
.hero__copy { padding-top: 5px; }
.hero__badge { display: inline-flex; min-height: 26px; align-items: center; padding: 0 9px; font-size: 11px; font-weight: 650; color: #b9d9d5; border: 1px solid rgb(124 201 190 / 36%); border-radius: 5px; background: rgb(14 51 55 / 46%); }
.hero__title { max-width: 610px; margin: 18px 0 0; font-size: clamp(33px, 3.5vw, 46px); font-weight: 760; line-height: 1.14; letter-spacing: 0; }
.hero__title span { color: #65c8b8; }
.hero__sub { max-width: 560px; margin: 18px 0 0; font-size: 15px; line-height: 1.75; color: #c0cbd3; }
.hero__release { max-width: 560px; padding-left: 10px; margin: 14px 0 0; font-size: 12px; line-height: 1.55; color: #9fbdc6; border-left: 2px solid #e08061; }
.hero__actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 24px; }
.hero__action { display: inline-flex; min-height: 37px; align-items: center; padding: 0 15px; font-size: 13px; font-weight: 700; text-decoration: none !important; border-radius: 6px; transition: transform 160ms ease, background-color 160ms ease; }
.hero__action:hover { transform: translateY(-1px); }
.hero__action--primary { color: #102127 !important; background: #65c8b8; }
.hero__action--secondary { color: #e5eef3 !important; border: 1px solid #40515d; background: rgb(255 255 255 / 4%); }
.hero__install { display: inline-flex; gap: 8px; align-items: center; max-width: 100%; min-height: 37px; padding: 0 10px; margin-top: 15px; overflow: hidden; font-family: var(--vp-font-family-mono); font-size: 11px; color: #d9e5ec; cursor: pointer; background: #17242e; border: 1px solid #31414e; border-radius: 6px; }
.hero__install code { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hero__install > span { color: #65c8b8; }
.hero__install small { padding-left: 7px; color: #9bb1bd; border-left: 1px solid #41515d; }
.hero__install.is-copied { border-color: #65c8b8; }
.hero__stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; max-width: 560px; padding: 18px 0 0; margin: 27px 0 0; border-top: 1px solid #30404b; }
.hero__stat { min-width: 0; padding-right: 11px; }
.hero__stat + .hero__stat { padding-left: 12px; border-left: 1px solid #30404b; }
.hero__stat dt { margin: 0; font-size: 24px; font-weight: 750; font-variant-numeric: tabular-nums; color: #f6fbfc; }
.hero__stat dd { margin: 4px 0 0; font-size: 10px; line-height: 1.45; color: #9fb0ba; }
.hero__demo { display: grid; grid-template-columns: minmax(0, 288px) 40px; gap: 10px; justify-content: center; align-items: end; min-height: 600px; }
.hero__device-meta { display: flex; justify-content: space-between; width: 288px; padding: 0 2px 7px; font-size: 10px; color: #a4b8c2; }
.hero__device-meta b { font-family: var(--vp-font-family-mono); font-weight: 500; color: #6f8f9b; }
.phone { position: relative; width: 288px; height: 610px; padding: 9px; background: #202b34; border: 1px solid #4b5c66; border-radius: 27px; box-shadow: 0 22px 55px rgb(0 0 0 / 32%), inset 0 1px 0 rgb(255 255 255 / 14%); }
.phone__screen { width: 270px; height: 592px; overflow: hidden; background: #f7f9fc; border-radius: 20px; clip-path: inset(0 round 20px); }
.phone.is-dark .phone__screen { background: #141922; }
.phone__viewport { width: 390px; height: 844px; transform: scale(0.6923); transform-origin: top left; }
.hero__dock { display: grid; gap: 6px; align-content: end; padding-bottom: 0; }
.hero__dock button { display: grid; place-items: center; width: 42px; height: 42px; padding: 0; color: #b5c6ce; cursor: pointer; background: #17242e; border: 1px solid #354650; border-radius: 6px; transition: color 140ms ease, background-color 140ms ease, transform 140ms ease; }
.hero__dock button:hover { color: #f3fbfc; background: #263943; transform: translateY(-1px); }
.hero__dock button.is-active { color: #102127; background: #65c8b8; border-color: #65c8b8; }
.hero__dock button:focus-visible { outline: 3px solid #a3dfd5; outline-offset: 2px; }
.capabilities { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; max-width: 1180px; margin: 0 auto; border-right: 1px solid var(--vp-c-divider); border-bottom: 1px solid var(--vp-c-divider); }
.capability { min-height: 187px; padding: 25px 24px; border-top: 1px solid var(--vp-c-divider); border-left: 1px solid var(--vp-c-divider); }
.capability :deep(svg) { color: #1e7f83; }
.capability h2 { margin: 16px 0 7px; font-size: 15px; font-weight: 720; letter-spacing: 0; }
.capability p { margin: 0; font-size: 13px; line-height: 1.7; color: var(--vp-c-text-2); }
:global(body.kit-demo-focus-open) { overflow: hidden; }
:global(.demo-focus) { position: fixed; inset: 0; z-index: 1000; display: grid; grid-template-rows: 52px minmax(0, 1fr); place-items: center; padding: 0 18px 20px; background: rgb(10 16 22 / 86%); backdrop-filter: blur(10px); }
:global(.demo-focus__bar) { display: flex; width: min(100%, 470px); align-items: center; justify-content: space-between; color: #dce9ef; font-size: 13px; font-weight: 700; }
:global(.demo-focus__bar button) { display: grid; place-items: center; width: 36px; height: 36px; padding: 0; color: #dce9ef; cursor: pointer; background: transparent; border: 1px solid #49606c; border-radius: 6px; }
:global(.demo-focus__surface) { width: min(430px, 100%); height: min(844px, calc(100dvh - 88px)); overflow: hidden; border: 1px solid #526673; border-radius: 12px; box-shadow: 0 28px 90px rgb(0 0 0 / 40%); }
:global(.demo-focus-enter-active), :global(.demo-focus-leave-active) { transition: opacity 180ms ease; }
:global(.demo-focus-enter-from), :global(.demo-focus-leave-to) { opacity: 0; }

@media (width <= 960px) {
  .hero__inner { grid-template-columns: minmax(0, 1fr); gap: 38px; max-width: 680px; }
  .hero__copy { padding-top: 0; }
  .hero__demo { justify-content: start; }
}
@media (width <= 700px) {
  .hero__inner { padding: 43px 18px 38px; }
  .hero__title { font-size: 35px; }
  .hero__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 0; }
  .hero__stat:nth-child(3) { padding-left: 0; border-left: 0; }
  .hero__demo { grid-template-columns: minmax(0, 300px) 40px; min-height: 637px; justify-content: center; }
  .hero__device-meta, .phone { width: 300px; }
  .phone { height: 628px; padding: 9px; border-radius: 26px; }
  .phone__screen { width: 282px; height: 610px; border-radius: 18px; clip-path: inset(0 round 18px); }
  .phone__viewport { transform: scale(0.72308); }
  .hero__dock button { width: 40px; height: 40px; }
  .capabilities { grid-template-columns: 1fr; margin: 0 18px; }
}
@media (width <= 390px) {
  .hero__demo { grid-template-columns: minmax(0, 270px) 36px; gap: 8px; }
  .hero__device-meta, .phone { width: 270px; }
  .phone { height: 565px; padding: 8px; border-radius: 24px; }
  .phone__screen { width: 254px; height: 549px; border-radius: 17px; clip-path: inset(0 round 17px); }
  .phone__viewport { transform: scale(0.65128); }
  .hero__dock button { width: 36px; height: 36px; }
}
@media (prefers-reduced-motion: reduce) {
  .hero__action, .hero__dock button { transition: none; }
}
</style>
