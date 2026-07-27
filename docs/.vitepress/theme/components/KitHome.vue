<script setup lang="ts">
import {
  ArrowUpRight,
  CalendarDays,
  CloudSun,
  Command,
  ExternalLink,
  Layers3,
  LayoutDashboard,
  Maximize2,
  Minimize2,
  Workflow,
} from '@lucide/vue'
import { withBase } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
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
      demoLabel: '线上移动端演示',
      demoState: '实时读取 iyotsuba.top',
      focus: '聚焦演示',
      closeFocus: '退出聚焦演示',
      openExternal: '在新窗口打开线上演示',
      stats: [
        { value: 0, label: 'core 运行时依赖' },
        { value: 7, label: '内置换周模式' },
        { value: 7, label: 'Today 内置模块' },
        { value: 4, label: 'Web 分发包' },
      ],
      capabilityKicker: 'COMPONENT MAP / 06',
      capabilityTitle: '从课表到今日，一套明确的组件边界',
      capabilitySub: '每项能力都有独立的数据契约、事件和替换点，可以按产品阶段渐进接入。',
      capabilityLink: '浏览全部组件',
      readMore: '查看文档',
      features: [
        { icon: CalendarDays, title: '中国高校学期语义', desc: '单双周、调休补班、重叠课程和非本周状态，都在零依赖 core 中计算。', meta: 'CORE / TERM', link: '/components/schedule', size: 'wide' },
        { icon: CloudSun, title: '天气是受控数据', desc: '宿主注入天气快照；课程卡、星期栏、详情 Hero 与动态场景共享同一状态。', meta: 'DATA / WEATHER', link: '/api/weather-motion', size: 'narrow' },
        { icon: Layers3, title: '详情与弹层可编排', desc: '字段、空值文案、操作区、详情过渡和每类弹层位置都能单独配置。', meta: 'SHEETS / SLOTS', link: '/api/slots', size: 'narrow' },
        { icon: LayoutDashboard, title: '面向触摸的 Today', desc: '长按进入排版，整卡拖动智能让位，四角缩放，并展示课程任务与课前携带清单。', meta: 'TODAY / TOUCH', link: '/components/today', size: 'wide' },
        { icon: Workflow, title: '同一能力，多种宿主', desc: 'core、Vue、React、Custom Elements 与 Flutter 保持同一数据边界与行为语义。', meta: 'VUE / REACT / FLUTTER', link: '/guide/frameworks', size: 'half' },
        { icon: Command, title: '交给宿主的副作用', desc: '定位、网络、日历、分享和持久化都显式授权，组件只发事件和公开方法。', meta: 'EVENTS / METHODS', link: '/api/methods', size: 'half' },
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
      demoState: 'Live from iyotsuba.top',
      focus: 'Focus demo',
      closeFocus: 'Exit focused demo',
      openExternal: 'Open the live demo in a new window',
      stats: [
        { value: 0, label: 'core runtime dependencies' },
        { value: 7, label: 'built-in transitions' },
        { value: 7, label: 'built-in Today modules' },
        { value: 4, label: 'Web packages' },
      ],
      capabilityKicker: 'COMPONENT MAP / 06',
      capabilityTitle: 'One explicit component boundary from schedule to Today',
      capabilitySub: 'Each capability has its own data contract, events and replacement points, ready for progressive adoption.',
      capabilityLink: 'Browse all components',
      readMore: 'Read docs',
      features: [
        { icon: CalendarDays, title: 'Academic-term semantics', desc: 'Odd/even weeks, makeup days, overlaps and inactive states are calculated in a zero-dependency core.', meta: 'CORE / TERM', link: '/en/components/schedule', size: 'wide' },
        { icon: CloudSun, title: 'Weather stays controlled', desc: 'Inject one snapshot and share it across cards, weekday headers, detail heroes and dynamic scenes.', meta: 'DATA / WEATHER', link: '/en/components/schedule', size: 'narrow' },
        { icon: Layers3, title: 'Composable details and sheets', desc: 'Fields, empty text, actions, detail transitions and each sheet placement remain independently configurable.', meta: 'SHEETS / SLOTS', link: '/en/components/schedule', size: 'narrow' },
        { icon: LayoutDashboard, title: 'Today for touch', desc: 'Long press to arrange, drag whole cards with reflow, resize from four corners, and surface tasks and carry lists.', meta: 'TODAY / TOUCH', link: '/en/components/schedule', size: 'wide' },
        { icon: Workflow, title: 'One contract, many hosts', desc: 'Core, Vue, React, Custom Elements and Flutter preserve the same data boundary and behavior.', meta: 'VUE / REACT / FLUTTER', link: '/en/guide/getting-started', size: 'half' },
        { icon: Command, title: 'Host-owned side effects', desc: 'Location, network, calendar, sharing and persistence stay explicitly authorized by the host app.', meta: 'EVENTS / METHODS', link: '/en/guide/getting-started', size: 'half' },
      ],
    })

const demoUrl = 'https://iyotsuba.top/schedule?preview=website&source=docs'
const copied = ref(false)
const demoFocused = ref(false)
const focusTrigger = ref<HTMLButtonElement | null>(null)
const focusDialog = ref<HTMLElement | null>(null)
const guideHref = computed(() => withBase(props.lang === 'zh' ? '/guide/getting-started' : '/en/guide/getting-started'))

function docHref(path: string) {
  return withBase(path)
}

async function copyInstall() {
  try {
    await navigator.clipboard.writeText(t.value.install)
    copied.value = true
    window.setTimeout(() => copied.value = false, 1600)
  }
  catch {}
}

function openFocus() {
  demoFocused.value = true
}

function closeFocus() {
  demoFocused.value = false
}

function handleFocusKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeFocus()
    return
  }
  if (event.key !== 'Tab' || !focusDialog.value) {
    return
  }
  const controls = [...focusDialog.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
  if (controls.length < 2) {
    return
  }
  const first = controls[0]
  const last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  }
  else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(demoFocused, async (focused) => {
  document.body.classList.toggle('kit-demo-focus-open', focused)
  if (focused) {
    await nextTick()
    focusDialog.value?.querySelector<HTMLButtonElement>('button')?.focus()
  }
  else {
    focusTrigger.value?.focus()
  }
})

onBeforeUnmount(() => document.body.classList.remove('kit-demo-focus-open'))
</script>

<template>
  <div class="kit-home">
    <section class="hero">
      <div class="hero__grid" aria-hidden="true" />
      <div class="hero__accent" aria-hidden="true" />
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
            <a class="hero__action hero__action--primary" :href="guideHref">{{ t.start }}</a>
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
          <div class="hero__device-meta">
            <span><i aria-hidden="true" />{{ t.demoLabel }}<small>{{ t.demoState }}</small></span>
            <div class="hero__device-actions">
              <b>390 × 844</b>
              <a :href="demoUrl" target="_blank" rel="noreferrer" :title="t.openExternal" :aria-label="t.openExternal"><ExternalLink :size="15" aria-hidden="true" /></a>
              <button ref="focusTrigger" type="button" :title="t.focus" :aria-label="t.focus" @click="openFocus"><Maximize2 :size="15" aria-hidden="true" /></button>
            </div>
          </div>
          <div class="phone">
            <div class="phone__speaker" aria-hidden="true" />
            <div class="phone__screen">
              <div class="phone__viewport">
                <iframe :src="demoUrl" :title="t.demoLabel" loading="eager" referrerpolicy="strict-origin-when-cross-origin" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="capabilities" aria-labelledby="capabilities-title">
      <header class="capabilities__intro">
        <p>{{ t.capabilityKicker }}</p>
        <h2 id="capabilities-title">{{ t.capabilityTitle }}</h2>
        <div>
          <span>{{ t.capabilitySub }}</span>
          <a :href="docHref('/components/schedule')">{{ t.capabilityLink }}<ArrowUpRight :size="16" aria-hidden="true" /></a>
        </div>
      </header>

      <div class="capabilities__grid">
        <article
          v-for="(feature, index) in t.features"
          :key="feature.title"
          class="capability"
          :class="`capability--${feature.size}`"
        >
          <div class="capability__top">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <component :is="feature.icon" :size="21" stroke-width="1.8" aria-hidden="true" />
          </div>
          <p class="capability__meta">{{ feature.meta }}</p>
          <h3>{{ feature.title }}</h3>
          <p class="capability__desc">{{ feature.desc }}</p>
          <a class="capability__link" :href="docHref(feature.link)">{{ t.readMore }}<ArrowUpRight :size="15" aria-hidden="true" /></a>
        </article>
      </div>
    </section>

    <Teleport to="body">
      <Transition name="demo-focus">
        <section
          v-if="demoFocused"
          ref="focusDialog"
          class="demo-focus"
          role="dialog"
          aria-modal="true"
          :aria-label="t.demoLabel"
          @click.self="closeFocus"
          @keydown="handleFocusKeydown"
        >
          <header class="demo-focus__bar">
            <span><i aria-hidden="true" />{{ t.demoLabel }}</span>
            <div>
              <a :href="demoUrl" target="_blank" rel="noreferrer" :title="t.openExternal" :aria-label="t.openExternal"><ExternalLink :size="19" aria-hidden="true" /></a>
              <button type="button" :aria-label="t.closeFocus" :title="t.closeFocus" @click="closeFocus"><Minimize2 :size="20" aria-hidden="true" /></button>
            </div>
          </header>
          <div class="demo-focus__surface">
            <iframe :src="demoUrl" :title="t.demoLabel" referrerpolicy="strict-origin-when-cross-origin" />
          </div>
        </section>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.kit-home { color: #192023; background: #f4f2ec; }
.hero { position: relative; overflow: hidden; color: #eef4f1; background: #111719; }
.hero__grid { position: absolute; inset: 0; opacity: 0.18; background-image: linear-gradient(rgb(223 242 236 / 18%) 1px, transparent 1px), linear-gradient(90deg, rgb(223 242 236 / 18%) 1px, transparent 1px); background-size: 44px 44px; }
.hero__accent { position: absolute; top: 0; right: max(20px, calc((100vw - 1220px) / 2)); width: 116px; height: 5px; background: #ef805d; }
.hero__inner { position: relative; display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr); gap: 58px; align-items: center; max-width: 1220px; padding: 38px 32px 34px; margin: 0 auto; }
.hero__copy { max-width: 630px; padding-bottom: 14px; }
.hero__badge { display: inline-flex; min-height: 25px; align-items: center; padding: 0 9px; font-family: var(--vp-font-family-mono); font-size: 10px; font-weight: 650; color: #bfe1d7; background: #172927; border: 1px solid #31504a; border-radius: 4px; }
.hero__title { max-width: 650px; margin: 17px 0 0; font-size: clamp(35px, 3.6vw, 50px); font-weight: 780; line-height: 1.12; letter-spacing: 0; }
.hero__title span { color: #72cbb8; }
.hero__sub { max-width: 590px; margin: 17px 0 0; font-size: 15px; line-height: 1.72; color: #c2cdc9; }
.hero__release { max-width: 570px; padding-left: 11px; margin: 13px 0 0; font-size: 11px; line-height: 1.55; color: #aabdb7; border-left: 2px solid #ef805d; }
.hero__actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 21px; }
.hero__action { display: inline-flex; min-height: 38px; align-items: center; padding: 0 15px; font-size: 13px; font-weight: 720; text-decoration: none !important; border-radius: 5px; transition: transform 160ms ease, background-color 160ms ease, border-color 160ms ease; }
.hero__action:hover { transform: translateY(-2px); }
.hero__action--primary { color: #10201d !important; background: #72cbb8; }
.hero__action--primary:hover { background: #8ad7c7; }
.hero__action--secondary { color: #e5efeb !important; background: #161d20; border: 1px solid #3c4a4d; }
.hero__action--secondary:hover { border-color: #657477; }
.hero__install { display: inline-flex; gap: 8px; align-items: center; max-width: 100%; min-height: 36px; padding: 0 10px; margin-top: 13px; overflow: hidden; font-family: var(--vp-font-family-mono); font-size: 10px; color: #dce7e3; cursor: pointer; background: #182124; border: 1px solid #354347; border-radius: 5px; }
.hero__install code { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hero__install > span { color: #72cbb8; }
.hero__install small { padding-left: 7px; color: #9aaca7; border-left: 1px solid #435156; }
.hero__install.is-copied { border-color: #72cbb8; }
.hero__stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); max-width: 570px; padding: 17px 0 0; margin: 23px 0 0; border-top: 1px solid #344044; }
.hero__stat { min-width: 0; padding-right: 10px; }
.hero__stat + .hero__stat { padding-left: 11px; border-left: 1px solid #344044; }
.hero__stat dt { margin: 0; font-size: 23px; font-weight: 760; font-variant-numeric: tabular-nums; color: #f5faf8; }
.hero__stat dd { margin: 3px 0 0; font-size: 9px; line-height: 1.45; color: #98aaa5; }
.hero__demo { width: 258px; justify-self: center; }
.hero__device-meta { display: flex; align-items: end; justify-content: space-between; width: 258px; padding: 0 2px 8px; color: #b5c5c0; }
.hero__device-meta > span { display: grid; grid-template-columns: 7px auto; align-items: center; font-size: 10px; font-weight: 680; }
.hero__device-meta > span i, .demo-focus__bar span i { width: 6px; height: 6px; background: #72cbb8; border-radius: 50%; box-shadow: 0 0 0 3px rgb(114 203 184 / 12%); }
.hero__device-meta small { grid-column: 2; margin-top: 1px; font-size: 8px; font-weight: 500; color: #758986; }
.hero__device-actions { display: flex; gap: 4px; align-items: center; }
.hero__device-actions b { padding-right: 5px; font-family: var(--vp-font-family-mono); font-size: 9px; font-weight: 500; color: #78908c; }
.hero__device-actions a, .hero__device-actions button { display: grid; place-items: center; width: 27px; height: 27px; padding: 0; color: #b6c7c2; cursor: pointer; background: #182124; border: 1px solid #3a484b; border-radius: 5px; transition: color 150ms ease, border-color 150ms ease, transform 150ms ease; }
.hero__device-actions a:hover, .hero__device-actions button:hover { color: #fff; border-color: #72cbb8; transform: translateY(-1px); }
.phone { position: relative; width: 258px; padding: 8px; background: #242d30; border: 1px solid #516064; border-radius: 25px; box-shadow: 0 18px 38px rgb(0 0 0 / 28%), inset 0 1px 0 rgb(255 255 255 / 12%); }
.phone__speaker { position: absolute; top: 4px; left: 50%; z-index: 3; width: 38px; height: 3px; background: #596467; border-radius: 3px; transform: translateX(-50%); }
.phone__screen { width: 242px; aspect-ratio: 390 / 844; overflow: hidden; background: #f7f9fc; border-radius: 18px; clip-path: inset(0 round 18px); }
.phone__viewport { width: 390px; height: 844px; transform: scale(0.62051); transform-origin: top left; }
.phone iframe, .demo-focus iframe { display: block; width: 100%; height: 100%; background: #f7f9fc; border: 0; }
.capabilities { padding: 76px 28px 92px; color: #192023; background: #f4f2ec; }
.capabilities__intro { display: grid; grid-template-columns: minmax(0, 0.34fr) minmax(0, 1fr); gap: 15px 44px; max-width: 1160px; margin: 0 auto 34px; }
.capabilities__intro > p { margin: 5px 0 0; font-family: var(--vp-font-family-mono); font-size: 10px; font-weight: 700; color: #247a70; }
.capabilities__intro h2 { max-width: 740px; margin: 0; font-size: clamp(27px, 3vw, 40px); font-weight: 780; line-height: 1.2; letter-spacing: 0; }
.capabilities__intro > div { display: flex; grid-column: 2; gap: 24px; align-items: end; justify-content: space-between; padding-top: 2px; border-top: 1px solid #c9c9c2; }
.capabilities__intro > div span { max-width: 650px; padding-top: 13px; font-size: 13px; line-height: 1.65; color: #5e6664; }
.capabilities__intro > div a { display: inline-flex; flex: none; gap: 5px; align-items: center; padding-top: 13px; font-size: 12px; font-weight: 720; color: #185d56; text-decoration: none; }
.capabilities__grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; max-width: 1160px; margin: 0 auto; }
.capability { position: relative; display: flex; min-height: 226px; flex-direction: column; padding: 20px 21px 18px; overflow: hidden; background: #fff; border: 1px solid #d2d3ce; border-radius: 7px; transition: transform 200ms ease, border-color 200ms ease, box-shadow 200ms ease; --cap-accent: #247a70; }
.capability::before { position: absolute; top: 0; right: 0; left: 0; height: 4px; content: ""; background: var(--cap-accent); }
.capability:nth-child(1) { background: #eaf4f0; --cap-accent: #2d887d; }
.capability:nth-child(2) { --cap-accent: #c18b24; }
.capability:nth-child(3) { --cap-accent: #4e79c2; }
.capability:nth-child(4) { background: #faeee8; --cap-accent: #cf6848; }
.capability:nth-child(5) { --cap-accent: #7d6bab; }
.capability:nth-child(6) { --cap-accent: #338578; }
.capability:hover { z-index: 1; border-color: #919995; box-shadow: 0 12px 26px rgb(31 45 40 / 9%); transform: translateY(-3px); }
.capability--wide { grid-column: span 4; }
.capability--narrow { grid-column: span 2; }
.capability--half { grid-column: span 3; }
.capability__top { display: flex; align-items: center; justify-content: space-between; color: var(--cap-accent); }
.capability__top span { font-family: var(--vp-font-family-mono); font-size: 10px; font-weight: 700; color: #858d89; }
.capability__meta { margin: 28px 0 0; font-family: var(--vp-font-family-mono); font-size: 9px; font-weight: 700; color: var(--cap-accent); }
.capability h3 { max-width: 520px; margin: 7px 0 0; font-size: 18px; font-weight: 760; line-height: 1.35; letter-spacing: 0; }
.capability__desc { max-width: 600px; margin: 9px 0 0; font-size: 12px; line-height: 1.68; color: #5e6664; }
.capability__link { display: inline-flex; gap: 4px; align-items: center; align-self: flex-start; margin-top: auto; padding-top: 18px; font-size: 11px; font-weight: 720; color: #263e39; text-decoration: none; }
.capability__link :deep(svg), .capabilities__intro a :deep(svg) { transition: transform 160ms ease; }
.capability__link:hover :deep(svg), .capabilities__intro a:hover :deep(svg) { transform: translate(2px, -2px); }
:global(body.kit-demo-focus-open) { overflow: hidden; }
:global(.demo-focus) { position: fixed; inset: 0; z-index: 1000; display: grid; grid-template-rows: 54px minmax(0, 1fr); place-items: center; padding: 0 18px 20px; background: rgb(11 16 18 / 88%); backdrop-filter: blur(9px); }
:global(.demo-focus__bar) { display: flex; width: min(390px, calc(100vw - 36px), calc((100dvh - 88px) * 0.4621)); align-items: center; justify-content: space-between; color: #dce9e4; font-size: 12px; font-weight: 700; }
:global(.demo-focus__bar > span) { display: inline-flex; gap: 8px; align-items: center; }
:global(.demo-focus__bar > div) { display: flex; gap: 6px; }
:global(.demo-focus__bar a), :global(.demo-focus__bar button) { display: grid; place-items: center; width: 34px; height: 34px; padding: 0; color: #dce9e4; cursor: pointer; background: #192124; border: 1px solid #4d5c60; border-radius: 5px; }
:global(.demo-focus__surface) { width: min(390px, calc(100vw - 36px), calc((100dvh - 88px) * 0.4621)); max-height: calc(100dvh - 88px); aspect-ratio: 390 / 844; overflow: hidden; background: #f7f9fc; border: 1px solid #526367; border-radius: 10px; box-shadow: 0 24px 70px rgb(0 0 0 / 38%); }
:global(.demo-focus-enter-active), :global(.demo-focus-leave-active) { transition: opacity 180ms ease; }
:global(.demo-focus-enter-from), :global(.demo-focus-leave-to) { opacity: 0; }

@media (width <= 960px) {
  .hero__inner { grid-template-columns: minmax(0, 1fr); gap: 36px; max-width: 720px; }
  .hero__copy { max-width: 650px; padding-bottom: 0; }
  .hero__demo { justify-self: center; }
}
@media (width <= 700px) {
  .hero__inner { padding: 38px 18px 36px; }
  .hero__title { font-size: 35px; }
  .hero__release { display: none; }
  .hero__stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px 0; }
  .hero__stat:nth-child(3) { padding-left: 0; border-left: 0; }
  .hero__demo { width: min(100%, 320px); }
  .hero__device-meta { width: 100%; padding: 10px 0; border-top: 1px solid #344044; border-bottom: 1px solid #344044; }
  .phone { display: none; }
  .capabilities { padding: 56px 18px 68px; }
  .capabilities__intro { display: block; margin-bottom: 25px; }
  .capabilities__intro h2 { margin-top: 12px; font-size: 29px; }
  .capabilities__intro > div { display: block; margin-top: 17px; }
  .capabilities__intro > div span { display: block; }
  .capabilities__intro > div a { margin-top: 3px; }
  .capabilities__grid { grid-template-columns: 1fr; }
  .capability--wide, .capability--narrow, .capability--half { grid-column: auto; }
  .capability { min-height: 210px; }
}
@media (width <= 390px) {
  .hero__demo, .hero__device-meta { width: 246px; }
  .phone { width: 246px; }
  .phone__screen { width: 230px; }
  .phone__viewport { transform: scale(0.58974); }
  .hero__device-actions b { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .hero__action, .hero__device-actions a, .hero__device-actions button, .capability, .capability__link :deep(svg), .capabilities__intro a :deep(svg) { transition: none; }
}
</style>
