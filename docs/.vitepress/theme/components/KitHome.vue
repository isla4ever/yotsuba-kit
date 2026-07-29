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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ReactCountUp from './ReactCountUp.vue'

const props = withDefaults(defineProps<{ lang?: 'zh' | 'en' }>(), { lang: 'zh' })

const t = computed(() => props.lang === 'zh'
  ? {
      badge: '面向中国高校课表的跨端组件库',
      title1: '一套课表数据，',
      title2: '构建课表、今日视图与课程服务。',
      sub: 'Yotsuba Schedule Kit 面向中国高校课表场景，提供可组合的学期引擎、跨端组件和受控交互。你负责业务数据与系统能力，组件负责稳定呈现。',
      start: '5 分钟开始',
      frameworks: '选择接入方式',
      install: 'pnpm add @iyotsuba/schedule-vue@0.7.0',
      copy: '复制',
      copied: '已复制',
      release: '稳定版 0.7.0 · Web 与 Flutter 同步天气、课程和 Today 能力',
      demoLabel: '可交互移动端示例',
      demoState: '独立演示数据 · iyotsuba.top',
      demoLoading: '正在加载移动端示例',
      focus: '聚焦演示',
      closeFocus: '退出聚焦演示',
      openExternal: '在新窗口打开线上演示',
      stats: [
        { value: 0, label: 'core 运行时依赖' },
        { value: 4, label: 'Web 分发包' },
        { value: 7, label: '内置换周模式' },
        { value: 7, label: 'Today 内置模块' },
      ],
      pathKicker: '阅读入口',
      pathTitle: '按你的目标开始',
      pathSub: '不需要先通读全部文档。选择当前任务，完成后再进入下一层。',
      paths: [
        { icon: Command, meta: '约 5 分钟', title: '第一次接入', desc: '安装稳定版、准备最小课程数据，并运行第一个可换周课表。', action: '打开快速开始', link: '/guide/getting-started' },
        { icon: Workflow, meta: '按技术栈', title: '接入现有项目', desc: '根据 Vue、React、Custom Elements 或 Flutter 选择对应包和数据绑定方式。', action: '选择接入方式', link: '/guide/frameworks' },
        { icon: Layers3, meta: '按任务查询', title: '查找组件与 API', desc: '直接查阅配置项、事件、方法、插槽，以及课程、天气和动效协议。', action: '查看组件文档', link: '/components/schedule' },
      ],
      capabilityKicker: '能力索引',
      capabilityTitle: '按产品问题查找能力',
      capabilitySub: '指南负责学习路径，组件页解释使用方式，API 页用于精确查询。',
      capabilityLink: '查看组件文档',
      readMore: '继续阅读',
      features: [
        { icon: CalendarDays, title: '正确处理学期与课程', desc: '覆盖单双周、调休补班、重叠课程、节次与非本周状态，并保持数据受控。', meta: '课表组件 · Core', link: '/components/schedule' },
        { icon: LayoutDashboard, title: '组织今日课程与任务', desc: '用可排版的 Today 组件汇总下一节课、教材、携带物、任务、计划和天气。', meta: 'Today · 自定义模块', link: '/components/today' },
        { icon: CloudSun, title: '统一天气、主题与动效', desc: '向课表与 Today 注入同一份天气数据，并通过令牌和协议统一视觉表现。', meta: '天气 · 主题 · 动效', link: '/api/weather-motion' },
        { icon: Layers3, title: '接管详情与业务操作', desc: '使用事件、方法和插槽替换详情字段、操作区与弹层，同时保留核心计算。', meta: '事件 · 方法 · 插槽', link: '/api/slots' },
      ],
    }
  : {
      badge: 'Cross-platform components for academic schedules',
      title1: 'One schedule model,',
      title2: 'from timetable to the day ahead.',
      sub: 'Yotsuba Schedule Kit combines academic-term logic, cross-platform components and controlled interactions. Your app owns data and system capabilities; the kit owns reliable presentation.',
      start: 'Start in 5 minutes',
      frameworks: 'Choose a framework',
      install: 'pnpm add @iyotsuba/schedule-vue@0.7.0',
      copy: 'Copy',
      copied: 'Copied',
      release: 'Stable 0.7.0 · Weather, course and Today capabilities aligned across Web and Flutter',
      demoLabel: 'Interactive mobile example',
      demoState: 'Isolated demo data · iyotsuba.top',
      demoLoading: 'Loading the mobile example',
      focus: 'Focus demo',
      closeFocus: 'Exit focused demo',
      openExternal: 'Open the live demo in a new window',
      stats: [
        { value: 0, label: 'core runtime dependencies' },
        { value: 4, label: 'Web packages' },
        { value: 7, label: 'built-in transitions' },
        { value: 7, label: 'built-in Today modules' },
      ],
      pathKicker: 'START HERE',
      pathTitle: 'Start with your current goal',
      pathSub: 'You do not need to read everything first. Pick a task, complete it, then move to the next layer.',
      paths: [
        { icon: Command, meta: 'About 5 minutes', title: 'First integration', desc: 'Install the stable package, prepare the smallest course model and render a week-switching schedule.', action: 'Open quick start', link: '/en/guide/getting-started' },
        { icon: Workflow, meta: 'By stack', title: 'Add it to an existing app', desc: 'Choose the package and binding model for Vue, React, Custom Elements or Flutter.', action: 'Choose a framework', link: '/en/guide/getting-started' },
        { icon: Layers3, meta: 'By task', title: 'Look up components and APIs', desc: 'Go directly to configuration, events, methods, slots, weather and motion contracts.', action: 'Open component docs', link: '/en/components/schedule' },
      ],
      capabilityKicker: 'BUILD BY TASK',
      capabilityTitle: 'Find capabilities by product problem',
      capabilitySub: 'Guides teach a path, component pages explain use, and API pages provide exact lookup.',
      capabilityLink: 'Browse components',
      readMore: 'Continue reading',
      features: [
        { icon: CalendarDays, title: 'Model terms and courses correctly', desc: 'Handle odd and even weeks, makeup days, overlaps, sections and inactive states with controlled data.', meta: 'SCHEDULE / CORE', link: '/en/components/schedule' },
        { icon: LayoutDashboard, title: 'Organize courses and tasks for today', desc: 'Compose the next course, materials, tasks, plans and weather in an adaptable Today surface.', meta: 'TODAY / WIDGETS', link: '/en/components/schedule' },
        { icon: CloudSun, title: 'Unify weather, theme and motion', desc: 'Inject one weather source and use tokens and protocols to keep schedule surfaces consistent.', meta: 'WEATHER / MOTION', link: '/en/motion/transitions' },
        { icon: Layers3, title: 'Own details and business actions', desc: 'Replace fields, actions and sheets through events, methods and slots while retaining core calculations.', meta: 'EVENTS / SLOTS', link: '/en/components/schedule' },
      ],
    })

const demoUrl = 'https://iyotsuba.top/schedule?preview=website&source=docs'
const copied = ref(false)
const demoFocused = ref(false)
const demoLoaded = ref(false)
const focusedDemoLoaded = ref(false)
const focusTrigger = ref<HTMLButtonElement | null>(null)
const focusDialog = ref<HTMLElement | null>(null)
const pathsSection = ref<HTMLElement | null>(null)
const capabilitiesSection = ref<HTMLElement | null>(null)
const pathsVisible = ref(false)
const capabilitiesVisible = ref(false)
const guideHref = computed(() => withBase(props.lang === 'zh' ? '/guide/getting-started' : '/en/guide/getting-started'))
const frameworksHref = computed(() => withBase(props.lang === 'zh' ? '/guide/frameworks' : '/en/guide/getting-started'))
let revealObserver: IntersectionObserver | null = null

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
  focusedDemoLoaded.value = false
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

onMounted(() => {
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    pathsVisible.value = true
    capabilitiesVisible.value = true
    return
  }

  revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue
      }
      if (entry.target === pathsSection.value) {
        pathsVisible.value = true
      }
      if (entry.target === capabilitiesSection.value) {
        capabilitiesVisible.value = true
      }
      revealObserver?.unobserve(entry.target)
    }
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' })

  if (pathsSection.value) {
    revealObserver.observe(pathsSection.value)
  }
  if (capabilitiesSection.value) {
    revealObserver.observe(capabilitiesSection.value)
  }
})

onBeforeUnmount(() => {
  document.body.classList.remove('kit-demo-focus-open')
  revealObserver?.disconnect()
})
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
            <a class="hero__action hero__action--secondary" :href="frameworksHref">{{ t.frameworks }}</a>
          </div>
          <button type="button" class="hero__install" :class="{ 'is-copied': copied }" @click="copyInstall">
            <span aria-hidden="true">$</span><code>{{ t.install }}</code><small>{{ copied ? t.copied : t.copy }}</small>
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
                <div class="demo-embed" :class="{ 'is-ready': demoLoaded }" :aria-busy="!demoLoaded">
                  <div class="demo-embed__loading" role="status" :aria-label="t.demoLoading">
                    <div class="demo-weather-loader" aria-hidden="true">
                      <div class="demo-weather-loader__cloud demo-weather-loader__front">
                        <span class="demo-weather-loader__left-front" />
                        <span class="demo-weather-loader__right-front" />
                      </div>
                      <span class="demo-weather-loader__sun demo-weather-loader__sunshine" />
                      <span class="demo-weather-loader__sun" />
                      <div class="demo-weather-loader__cloud demo-weather-loader__back">
                        <span class="demo-weather-loader__left-back" />
                        <span class="demo-weather-loader__right-back" />
                      </div>
                    </div>
                    <strong>Yotsuba</strong>
                    <p>{{ t.demoLoading }}<span aria-hidden="true">...</span></p>
                  </div>
                  <iframe :src="demoUrl" :title="t.demoLabel" loading="eager" referrerpolicy="strict-origin-when-cross-origin" @load="demoLoaded = true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section ref="pathsSection" class="paths reveal-section" :class="{ 'is-visible': pathsVisible }" aria-labelledby="paths-title">
      <div class="paths__inner">
        <header class="section-intro">
          <p>{{ t.pathKicker }}</p>
          <div>
            <h2 id="paths-title">{{ t.pathTitle }}</h2>
            <span>{{ t.pathSub }}</span>
          </div>
        </header>

        <div class="paths__grid">
          <article v-for="path in t.paths" :key="path.title" class="pathway">
            <div class="pathway__top">
              <component :is="path.icon" :size="20" stroke-width="1.8" aria-hidden="true" />
              <span>{{ path.meta }}</span>
            </div>
            <h3>{{ path.title }}</h3>
            <p>{{ path.desc }}</p>
            <a :href="docHref(path.link)">{{ path.action }}<ArrowUpRight :size="15" aria-hidden="true" /></a>
          </article>
        </div>
      </div>
    </section>

    <section ref="capabilitiesSection" class="capabilities reveal-section" :class="{ 'is-visible': capabilitiesVisible }" aria-labelledby="capabilities-title">
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
          <div class="demo-focus__surface" :aria-busy="!focusedDemoLoaded">
            <div class="demo-embed demo-embed--focus" :class="{ 'is-ready': focusedDemoLoaded }">
              <div class="demo-embed__loading" role="status" :aria-label="t.demoLoading">
                <div class="demo-weather-loader" aria-hidden="true">
                  <div class="demo-weather-loader__cloud demo-weather-loader__front">
                    <span class="demo-weather-loader__left-front" />
                    <span class="demo-weather-loader__right-front" />
                  </div>
                  <span class="demo-weather-loader__sun demo-weather-loader__sunshine" />
                  <span class="demo-weather-loader__sun" />
                  <div class="demo-weather-loader__cloud demo-weather-loader__back">
                    <span class="demo-weather-loader__left-back" />
                    <span class="demo-weather-loader__right-back" />
                  </div>
                </div>
                <strong>Yotsuba</strong>
                <p>{{ t.demoLoading }}<span aria-hidden="true">...</span></p>
              </div>
              <iframe :src="demoUrl" :title="t.demoLabel" referrerpolicy="strict-origin-when-cross-origin" @load="focusedDemoLoaded = true" />
            </div>
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
.hero__demo { width: 258px; align-self: end; justify-self: center; }
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
.demo-embed { position: relative; width: 100%; height: 100%; overflow: hidden; background: #f2f6f8; }
.demo-embed iframe { display: block; width: 100%; height: 100%; opacity: 0; background: #f7f9fc; border: 0; transform: scale(0.992); transition: opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 520ms cubic-bezier(0.22, 1, 0.36, 1); }
.demo-embed.is-ready iframe { opacity: 1; transform: none; }
.demo-embed__loading { position: absolute; inset: 0; z-index: 2; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #46605c; text-align: center; background: linear-gradient(145deg, #f3f8f7 0%, #eaf2f1 54%, #f7f8f4 100%); transition: opacity 300ms ease, visibility 0s linear 300ms; }
.demo-embed.is-ready .demo-embed__loading { visibility: hidden; opacity: 0; pointer-events: none; }
/* Weather loader adapted from Uiverse.io by zanina-yassine. */
.demo-weather-loader { position: relative; display: flex; width: 250px; height: 210px; align-items: center; justify-content: center; }
.demo-weather-loader__cloud { position: absolute; width: 250px; }
.demo-weather-loader__front { top: 70px; left: 18px; z-index: 11; animation: demo-loader-clouds 8s ease-in-out infinite; }
.demo-weather-loader__back { top: 92px; left: 98px; z-index: 12; animation: demo-loader-clouds 12s ease-in-out infinite; }
.demo-weather-loader__left-front,
.demo-weather-loader__right-front,
.demo-weather-loader__left-back,
.demo-weather-loader__right-back { display: inline-block; background: #4c9beb; box-shadow: inset 0 1px 0 rgb(255 255 255 / 22%), 0 10px 28px rgb(76 155 235 / 18%); }
.demo-weather-loader__left-front { z-index: 5; width: 65px; height: 65px; border-radius: 50% 50% 0 50%; }
.demo-weather-loader__right-front { z-index: 5; width: 45px; height: 45px; margin-left: -25px; border-radius: 50% 50% 50% 0; }
.demo-weather-loader__left-back { z-index: 5; width: 30px; height: 30px; border-radius: 50% 50% 0 50%; }
.demo-weather-loader__right-back { z-index: 5; width: 50px; height: 50px; margin-left: -20px; border-radius: 50% 50% 50% 0; }
.demo-weather-loader__sun { position: absolute; display: inline-block; width: 120px; height: 120px; background: linear-gradient(to right, #fcbb04, #fffc00); border-radius: 50%; box-shadow: 0 16px 46px rgb(252 187 4 / 24%); }
.demo-weather-loader__sunshine { animation: demo-loader-sunshine 2s ease-out infinite; }
.demo-embed__loading > strong { margin-top: -4px; font-size: 18px; font-weight: 780; color: #19332e; }
.demo-embed__loading p { margin: 5px 0 0; font-size: 12px; font-weight: 650; }
@keyframes demo-loader-sunshine {
  0% { opacity: 0.6; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.4); }
}
@keyframes demo-loader-clouds {
  0%, 100% { transform: translateX(15px); }
  50% { transform: translateX(0); }
}
.reveal-section .section-intro,
.reveal-section .pathway,
.reveal-section .capabilities__intro,
.reveal-section .capability { opacity: 0; transform: translateY(20px); transition: opacity 680ms cubic-bezier(0.22, 1, 0.36, 1), transform 760ms cubic-bezier(0.22, 1, 0.36, 1); }
.reveal-section.is-visible .section-intro,
.reveal-section.is-visible .pathway,
.reveal-section.is-visible .capabilities__intro,
.reveal-section.is-visible .capability { opacity: 1; transform: none; }
.reveal-section.is-visible .pathway:nth-child(1) { transition-delay: 70ms; }
.reveal-section.is-visible .pathway:nth-child(2) { transition-delay: 130ms; }
.reveal-section.is-visible .pathway:nth-child(3) { transition-delay: 190ms; }
.reveal-section.is-visible .capability:nth-child(1) { transition-delay: 70ms; }
.reveal-section.is-visible .capability:nth-child(2) { transition-delay: 130ms; }
.reveal-section.is-visible .capability:nth-child(3) { transition-delay: 190ms; }
.reveal-section.is-visible .capability:nth-child(4) { transition-delay: 250ms; }
.paths { padding: 62px 28px 68px; color: #192023; background: #fff; border-bottom: 1px solid #d6d7d2; }
.paths__inner { max-width: 1160px; margin: 0 auto; }
.section-intro { display: grid; grid-template-columns: minmax(150px, 0.34fr) minmax(0, 1fr); gap: 44px; align-items: start; margin-bottom: 28px; }
.section-intro > p { margin: 5px 0 0; font-family: var(--vp-font-family-mono); font-size: 10px; font-weight: 700; color: #247a70; }
.section-intro h2 { margin: 0; font-size: clamp(27px, 3vw, 38px); font-weight: 780; line-height: 1.2; letter-spacing: 0; }
.section-intro span { display: block; max-width: 660px; margin-top: 10px; font-size: 13px; line-height: 1.65; color: #5e6664; }
.paths__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid #cfd1cc; border-bottom: 1px solid #cfd1cc; }
.pathway { display: flex; min-height: 238px; flex-direction: column; padding: 24px 26px 22px; }
.pathway + .pathway { border-left: 1px solid #d8d9d5; }
.pathway__top { display: flex; align-items: center; justify-content: space-between; color: #247a70; }
.pathway__top span { font-family: var(--vp-font-family-mono); font-size: 9px; font-weight: 700; color: #7a827f; }
.pathway h3 { margin: 27px 0 0; font-size: 19px; font-weight: 760; line-height: 1.35; letter-spacing: 0; }
.pathway > p { margin: 10px 0 0; font-size: 12px; line-height: 1.72; color: #5e6664; }
.pathway > a { display: inline-flex; gap: 4px; align-items: center; align-self: flex-start; margin-top: auto; padding-top: 20px; font-size: 11px; font-weight: 720; color: #185d56; text-decoration: none; }
.capabilities { padding: 70px 28px 88px; color: #192023; background: #f4f2ec; }
.capabilities__intro { display: grid; grid-template-columns: minmax(150px, 0.34fr) minmax(0, 1fr); gap: 15px 44px; max-width: 1160px; margin: 0 auto 30px; }
.capabilities__intro > p { margin: 5px 0 0; font-family: var(--vp-font-family-mono); font-size: 10px; font-weight: 700; color: #247a70; }
.capabilities__intro h2 { max-width: 740px; margin: 0; font-size: clamp(27px, 3vw, 38px); font-weight: 780; line-height: 1.2; letter-spacing: 0; }
.capabilities__intro > div { display: flex; grid-column: 2; gap: 24px; align-items: end; justify-content: space-between; padding-top: 2px; border-top: 1px solid #c9c9c2; }
.capabilities__intro > div span { max-width: 650px; padding-top: 13px; font-size: 13px; line-height: 1.65; color: #5e6664; }
.capabilities__intro > div a { display: inline-flex; flex: none; gap: 5px; align-items: center; padding-top: 13px; font-size: 12px; font-weight: 720; color: #185d56; text-decoration: none; }
.capabilities__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 44px; max-width: 1160px; margin: 0 auto; }
.capability { display: flex; min-height: 205px; flex-direction: column; padding: 24px 0 22px; border-top: 1px solid #c9c9c2; --cap-accent: #247a70; }
.capability:nth-child(2) { --cap-accent: #bf704f; }
.capability:nth-child(3) { --cap-accent: #b17b20; }
.capability:nth-child(4) { --cap-accent: #4e79a8; }
.capability__top { display: flex; align-items: center; justify-content: space-between; color: var(--cap-accent); }
.capability__top span { font-family: var(--vp-font-family-mono); font-size: 10px; font-weight: 700; color: #858d89; }
.capability__meta { margin: 22px 0 0; font-family: var(--vp-font-family-mono); font-size: 9px; font-weight: 700; color: var(--cap-accent); }
.capability h3 { max-width: 520px; margin: 7px 0 0; font-size: 19px; font-weight: 760; line-height: 1.35; letter-spacing: 0; }
.capability__desc { max-width: 520px; margin: 9px 0 0; font-size: 12px; line-height: 1.7; color: #5e6664; }
.capability__link { display: inline-flex; gap: 4px; align-items: center; align-self: flex-start; margin-top: auto; padding-top: 18px; font-size: 11px; font-weight: 720; color: #263e39; text-decoration: none; }
.pathway > a :deep(svg), .capability__link :deep(svg), .capabilities__intro a :deep(svg) { transition: transform 160ms ease; }
.pathway > a:hover :deep(svg), .capability__link:hover :deep(svg), .capabilities__intro a:hover :deep(svg) { transform: translate(2px, -2px); }
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
  .paths { padding: 52px 18px 58px; }
  .section-intro { display: block; margin-bottom: 23px; }
  .section-intro h2 { margin-top: 11px; font-size: 29px; }
  .section-intro span { margin-top: 9px; }
  .paths__grid { grid-template-columns: 1fr; }
  .pathway { min-height: 205px; padding: 23px 2px 21px; }
  .pathway + .pathway { border-top: 1px solid #d8d9d5; border-left: 0; }
  .capabilities { padding: 56px 18px 68px; }
  .capabilities__intro { display: block; margin-bottom: 25px; }
  .capabilities__intro h2 { margin-top: 12px; font-size: 29px; }
  .capabilities__intro > div { display: block; margin-top: 17px; }
  .capabilities__intro > div span { display: block; }
  .capabilities__intro > div a { margin-top: 3px; }
  .capabilities__grid { grid-template-columns: 1fr; }
  .capability { min-height: 190px; }
}
@media (width <= 390px) {
  .hero__demo, .hero__device-meta { width: 246px; }
  .phone { width: 246px; }
  .phone__screen { width: 230px; }
  .phone__viewport { transform: scale(0.58974); }
  .hero__device-actions b { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .hero__action, .hero__device-actions a, .hero__device-actions button, .pathway > a :deep(svg), .capability__link :deep(svg), .capabilities__intro a :deep(svg), .demo-embed iframe, .demo-embed__loading, .reveal-section .section-intro, .reveal-section .pathway, .reveal-section .capabilities__intro, .reveal-section .capability { transition: none; }
  .demo-weather-loader__front, .demo-weather-loader__back, .demo-weather-loader__sunshine { animation: none; }
  .reveal-section .section-intro, .reveal-section .pathway, .reveal-section .capabilities__intro, .reveal-section .capability { opacity: 1; transform: none; }
}
</style>
