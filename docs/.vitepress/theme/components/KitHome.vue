<script setup lang="ts">
// 演示按真实 390px 手机密度渲染,再整体缩放进壳体——与微信版观感一致
import type { BuiltinTransitionName, Course } from '@iyotsuba/schedule-vue'
import { defaultScheduleGuideSteps, YsSchedule } from '@iyotsuba/schedule-vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{ lang?: 'zh' | 'en' }>(), { lang: 'zh' })

const t = computed(() => props.lang === 'zh'
  ? {
      badge: 'v0.3 · MIT 开源 · Vue / React / Web Components',
      title1: '把课表组件',
      title2: '做到像素级顺滑',
      sub: '中国高校学期语义开箱即用 · 波浪覆盖换周动画任何一帧不空 · 主题令牌深浅色 · 三模式手把手引导 · 今日指挥台',
      start: '快速开始',
      github: 'GitHub',
      install: 'pnpm add @iyotsuba/schedule-vue',
      copied: '已复制',
      demoTip: '真实组件可交互:滑动换周 · 点课程看内置详情 · 点周数跳任意周',
      features: [
        { icon: '🌊', title: '波浪覆盖换周', desc: '骨架常驻、稳定格静止、旧周垫底新卡逐列扫入——任何一帧不出现空网格,e2e 探针持续回归。' },
        { icon: '📅', title: '学期语义引擎', desc: '单双周、调休补班、假日、重叠课连通分组、非本周置灰。零依赖 TypeScript,任何框架可用。' },
        { icon: '🎨', title: '主题令牌体系', desc: '--ys-* CSS 变量双层定制,light/dark 内置,课程颜色按名稳定分配,一行代码换品牌色。' },
        { icon: '🧭', title: '三模式引导', desc: 'tips 气泡 / spotlight 聚光 / walkthrough 手把手——真实完成点击滑动才前进,超时手势暗示。' },
        { icon: '🧩', title: '双组件联动', desc: '课表 + 今日指挥台共享同一引擎;widget 注册表,#widget-<id> 插槽即插即换。' },
        { icon: '📦', title: '四包一体', desc: 'core 引擎 / Vue 3 / React 绑定 / <ys-schedule> 自定义元素,uni-app H5 与原生 HTML 直接可用。' },
      ],
      stats: [
        { value: '0', label: 'core 运行时依赖' },
        { value: '3+', label: '内置换周动画' },
        { value: '34', label: '单测 + e2e 断言' },
        { value: '4', label: 'npm 包' },
      ],
    }
  : {
      badge: 'v0.3 · MIT · Vue / React / Web Components',
      title1: 'Class-schedule components,',
      title2: 'polished to the pixel',
      sub: 'Chinese academic-term semantics out of the box · wave transitions with zero empty frames · theme tokens · hands-on onboarding · today dashboard',
      start: 'Get Started',
      github: 'GitHub',
      install: 'pnpm add @iyotsuba/schedule-vue',
      copied: 'Copied',
      demoTip: 'Fully interactive: swipe to change weeks · tap a course for the built-in detail · tap the week for the picker',
      features: [
        { icon: '🌊', title: 'Wave-cover transitions', desc: 'Persistent chrome, still stable cells, old week beneath while new cards sweep in — no empty frame, ever. Guarded by e2e probes.' },
        { icon: '📅', title: 'Term-semantics engine', desc: 'Odd/even weeks, makeup days, holidays, overlap grouping, inactive dimming. Zero-dep TypeScript.' },
        { icon: '🎨', title: 'Theme tokens', desc: 'Two-layer --ys-* CSS variables, light/dark built in, stable per-course colors.' },
        { icon: '🧭', title: 'Three-mode guide', desc: 'tips / spotlight / hands-on walkthrough that only advances on real taps & swipes.' },
        { icon: '🧩', title: 'Linked dashboard', desc: 'Schedule + today dashboard share one engine; widget registry with slot overrides.' },
        { icon: '📦', title: 'Four packages', desc: 'core / Vue 3 / React bindings / custom elements for anything with a DOM.' },
      ],
      stats: [
        { value: '0', label: 'core runtime deps' },
        { value: '3+', label: 'built-in transitions' },
        { value: '34', label: 'tests & e2e probes' },
        { value: '4', label: 'npm packages' },
      ],
    })

const base = computed(() => props.lang === 'zh' ? '' : '/en')

/* 实机演示：可玩的完整配置面板,按真实 390px 手机密度渲染再整体缩放 */
const week = ref(1)
const transition = ref<BuiltinTransitionName>('wave')
const demoTheme = ref<'light' | 'dark'>('light')
const demoTopBar = ref<'compact' | 'standard' | 'expanded'>('standard')
const demoDays = ref<5 | 7>(7)
const scheduleRef = ref<InstanceType<typeof YsSchedule> | null>(null)
const autoPlay = ref(true)
const transitions: Array<{ name: BuiltinTransitionName, label: string }> = [
  { name: 'wave', label: 'wave' },
  { name: 'slide', label: 'slide' },
  { name: 'none', label: 'none' },
]
const termStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - ((new Date().getDay() || 7) - 1))

// 8 节次,贴近真实课表密度
const demoTimes = [
  { start: '08:00', end: '08:45' },
  { start: '08:55', end: '09:40' },
  { start: '10:00', end: '10:45' },
  { start: '10:55', end: '11:40' },
  { start: '14:30', end: '15:15' },
  { start: '15:25', end: '16:10' },
  { start: '16:20', end: '17:05' },
  { start: '17:15', end: '18:00' },
]

const courses: Course[] = [
  { id: 'a', name: '高等数学', teacher: '陈老师', location: '教1-201', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20 },
  { id: 'b', name: '数据结构', location: '教2-105', weekday: 1, startSection: 5, endSection: 6, startWeek: 1, endWeek: 20 },
  { id: 'c', name: '大学英语', location: '外语楼302', weekday: 2, startSection: 3, endSection: 4, startWeek: 1, endWeek: 20 },
  { id: 'g', name: '专业导论', location: '报告厅', weekday: 2, startSection: 7, endSection: 8, startWeek: 2, endWeek: 6 },
  { id: 'p', name: '程序设计', location: '机房A', weekday: 3, startSection: 5, endSection: 6, startWeek: 1, endWeek: 20 },
  { id: 'z', name: '自习（自定义）', location: '图书馆', weekday: 3, startSection: 7, endSection: 8, startWeek: 1, endWeek: 20, custom: true },
  { id: 'd', name: '体育（单周）', location: '东操场', weekday: 4, startSection: 1, endSection: 2, startWeek: 1, endWeek: 16, parity: 'odd' },
  { id: 'e', name: '线性代数（双周）', location: '教1-305', weekday: 4, startSection: 1, endSection: 2, startWeek: 2, endWeek: 16, parity: 'even' },
  { id: 'f', name: '大学物理', location: '理科楼210', weekday: 5, startSection: 3, endSection: 4, startWeek: 1, endWeek: 16 },
  { id: 'i', name: '化学实验', location: '实验楼404', weekday: 5, startSection: 7, endSection: 8, startWeek: 1, endWeek: 8 },
  { id: 'h', name: '形势与政策', location: '教3-101', weekday: 6, startSection: 3, endSection: 4, startWeek: 1, endWeek: 4 },
]

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  timer = setInterval(() => {
    if (autoPlay.value) {
      week.value = week.value === 1 ? 2 : 1
    }
  }, 2600)
})
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})

function playGuide() {
  autoPlay.value = false
  scheduleRef.value?.startGuide()
}

/* 复制安装命令 */
const copied = ref(false)
async function copyInstall() {
  try {
    await navigator.clipboard.writeText(t.value.install)
    copied.value = true
    setTimeout(() => copied.value = false, 1600)
  }
  catch {}
}

/* aceternity 式聚光灯卡片：鼠标位置驱动径向高光 */
function spotlight(event: MouseEvent) {
  const card = event.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
  card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
}
</script>

<template>
  <div class="kit-home">
    <!-- Hero：极光背景 + 网格纹理 -->
    <section class="hero">
      <div class="hero__aurora" aria-hidden="true">
        <i class="hero__blob hero__blob--1" /><i class="hero__blob hero__blob--2" /><i class="hero__blob hero__blob--3" />
      </div>
      <div class="hero__grid" aria-hidden="true" />

      <div class="hero__inner">
        <div class="hero__copy">
          <span class="hero__badge">{{ t.badge }}</span>
          <h1 class="hero__title">
            {{ t.title1 }}<br>
            <span class="hero__title-gradient">{{ t.title2 }}</span>
          </h1>
          <p class="hero__sub">{{ t.sub }}</p>
          <div class="hero__actions">
            <a class="hero__btn hero__btn--primary" :href="`${base}/guide/getting-started`">{{ t.start }} →</a>
            <a class="hero__btn hero__btn--ghost" href="https://github.com/isla4ever/yotsuba-kit" target="_blank" rel="noreferrer">
              {{ t.github }}
            </a>
          </div>
          <button type="button" class="hero__install" :class="{ 'is-copied': copied }" @click="copyInstall">
            <span class="hero__install-dollar">$</span>
            <code>{{ t.install }}</code>
            <span class="hero__install-copy">{{ copied ? `✓ ${t.copied}` : '⧉' }}</span>
          </button>
        </div>

        <!-- 手机壳实机演示：390px 真实密度 × 0.72 缩放,贴合壳体 -->
        <div class="hero__demo">
          <div class="phone" :class="{ 'is-dark': demoTheme === 'dark' }">
            <div class="phone__screen">
              <div class="phone__viewport">
                <YsSchedule
                  ref="scheduleRef"
                  v-model:week="week"
                  :courses="courses"
                  :term-start="termStart"
                  :transition="transition"
                  :visible-days="demoDays"
                  :row-height="54"
                  :course-times="demoTimes"
                  :top-bar="demoTopBar"
                  :theme="demoTheme"
                  :swipeable="true"
                  week-picker="builtin"
                  course-detail="builtin"
                  :guide="{ mode: 'walkthrough', steps: defaultScheduleGuideSteps }"
                  @course-tap="autoPlay = false"
                  @week-picker-open="autoPlay = false"
                />
              </div>
            </div>
          </div>

          <div class="hero__panel">
            <div class="hero__panel-row">
              <span class="hero__panel-label">动画</span>
              <button
                v-for="item in transitions"
                :key="item.name"
                type="button"
                class="hero__chip"
                :class="{ 'is-active': transition === item.name }"
                @click="transition = item.name"
              >
                {{ item.label }}
              </button>
            </div>
            <div class="hero__panel-row">
              <span class="hero__panel-label">顶栏</span>
              <button
                v-for="preset in (['compact', 'standard', 'expanded'] as const)"
                :key="preset"
                type="button"
                class="hero__chip"
                :class="{ 'is-active': demoTopBar === preset }"
                @click="demoTopBar = preset"
              >
                {{ preset }}
              </button>
            </div>
            <div class="hero__panel-row">
              <span class="hero__panel-label">更多</span>
              <button type="button" class="hero__chip" :class="{ 'is-active': demoTheme === 'dark' }" @click="demoTheme = demoTheme === 'dark' ? 'light' : 'dark'">
                深色
              </button>
              <button type="button" class="hero__chip" :class="{ 'is-active': demoDays === 5 }" @click="demoDays = demoDays === 5 ? 7 : 5">
                隐藏周末
              </button>
              <button type="button" class="hero__chip hero__chip--guide" @click="playGuide">
                手把手引导 ✨
              </button>
            </div>
          </div>
          <p class="hero__demo-tip">{{ t.demoTip }}</p>
        </div>
      </div>

      <!-- 统计条 -->
      <div class="stats">
        <div v-for="stat in t.stats" :key="stat.label" class="stats__item">
          <b>{{ stat.value }}</b>
          <span>{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <!-- Bento 特性网格：聚光灯悬停 -->
    <section class="bento">
      <article
        v-for="feature in t.features"
        :key="feature.title"
        class="bento__card"
        @mousemove="spotlight"
      >
        <span class="bento__icon">{{ feature.icon }}</span>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.desc }}</p>
      </article>
    </section>
  </div>
</template>

<style scoped>
.kit-home {
  --kh-bg: #0b0e14;
  --kh-text: #eef1f7;
  --kh-text-2: #9aa4b6;
  --kh-accent: #5b8def;
  --kh-accent-2: #8f6bef;
  --kh-accent-3: #35b795;

  margin: 0 auto;
  color: var(--kh-text);
}

/* ------------------------------ Hero ------------------------------ */

.hero {
  position: relative;
  padding: 72px 24px 34px;
  overflow: hidden;
  background: var(--kh-bg);
  border-radius: 0 0 28px 28px;
  isolation: isolate;
}

.hero__aurora { position: absolute; inset: 0; z-index: -2; filter: blur(70px); }

.hero__blob {
  position: absolute;
  display: block;
  border-radius: 50%;
  opacity: 0.5;
  animation: kh-drift 16s ease-in-out infinite alternate;
}

.hero__blob--1 { top: -18%; left: -8%; width: 46%; height: 60%; background: #274bb3; }
.hero__blob--2 { right: -10%; bottom: -30%; width: 52%; height: 70%; background: #5b2fb0; animation-delay: -6s; }
.hero__blob--3 { top: 22%; left: 42%; width: 30%; height: 44%; background: #0f6b5c; animation-delay: -11s; }

.hero__grid {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(rgb(255 255 255 / 4%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 4%) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: radial-gradient(ellipse 90% 80% at 50% 0%, #000 55%, transparent 100%);
}

.hero__inner {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 34px;
  align-items: center;
  max-width: 1100px;
  margin: 0 auto;
}

@media (width <= 860px) {
  .hero__inner { grid-template-columns: 1fr; }
}

.hero__badge {
  display: inline-block;
  padding: 5px 13px;
  font-size: 12px;
  color: var(--kh-text-2);
  background: rgb(255 255 255 / 6%);
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 99px;
}

.hero__title {
  margin: 18px 0 0;
  font-size: clamp(30px, 4.6vw, 50px);
  font-weight: 800;
  line-height: 1.16;
  letter-spacing: -0.5px;
}

.hero__title-gradient {
  background: linear-gradient(100deg, var(--kh-accent), var(--kh-accent-2) 55%, var(--kh-accent-3));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero__sub {
  max-width: 480px;
  margin: 16px 0 0;
  font-size: 15px;
  line-height: 1.75;
  color: var(--kh-text-2);
}

.hero__actions { display: flex; gap: 12px; margin-top: 26px; }

.hero__btn {
  padding: 10px 22px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none !important;
  border-radius: 10px;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.hero__btn:hover { transform: translateY(-1px); }

.hero__btn--primary {
  color: #fff !important;
  background: linear-gradient(120deg, var(--kh-accent), var(--kh-accent-2));
  box-shadow: 0 8px 26px rgb(91 141 239 / 34%);
}

.hero__btn--ghost {
  color: var(--kh-text) !important;
  background: rgb(255 255 255 / 7%);
  border: 1px solid rgb(255 255 255 / 14%);
}

/* uiverse 风格复制安装条 */
.hero__install {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  padding: 10px 14px;
  margin-top: 20px;
  font-family: var(--vp-font-family-mono, monospace);
  font-size: 13px;
  color: var(--kh-text);
  cursor: pointer;
  background: rgb(255 255 255 / 5%);
  border: 1px solid rgb(255 255 255 / 14%);
  border-radius: 10px;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.hero__install:hover {
  border-color: rgb(91 141 239 / 60%);
  box-shadow: 0 0 0 3px rgb(91 141 239 / 14%);
}

.hero__install.is-copied { border-color: var(--kh-accent-3); }
.hero__install-dollar { color: var(--kh-accent-3); }
.hero__install-copy { font-size: 12px; color: var(--kh-text-2); }
.hero__install.is-copied .hero__install-copy { color: var(--kh-accent-3); }

/* 手机壳：390px 真实密度 × 0.77 缩放,严丝合缝 */
.hero__demo { display: flex; flex-direction: column; align-items: center; }

.phone {
  position: relative;
  width: 320px;
  padding: 10px;
  background: linear-gradient(160deg, #2a3140, #161b25);
  border-radius: 40px;
  box-shadow:
    0 24px 70px rgb(0 0 0 / 55%),
    inset 0 1px 0 rgb(255 255 255 / 14%);
}

.phone__screen {
  position: relative;
  width: 300px;
  height: 480px;
  overflow: hidden;
  background: #f6f7f9;
  border-radius: 30px;
}

.phone.is-dark .phone__screen { background: #14171c; }

.phone__viewport {
  position: absolute;
  top: 0;
  left: 0;
  width: 390px;
  height: 623px;
  transform: scale(0.7692);
  transform-origin: top left;
}

.phone__viewport > * { height: 100%; }

/* 配置面板 */
.hero__panel {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 12px 14px;
  margin-top: 16px;
  background: rgb(255 255 255 / 5%);
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 14px;
}

.hero__panel-row { display: flex; gap: 6px; align-items: center; }

.hero__panel-label {
  width: 34px;
  font-size: 11px;
  color: var(--kh-text-2);
}

.hero__chip {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--kh-text-2);
  cursor: pointer;
  background: rgb(255 255 255 / 6%);
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 99px;
  transition: all 160ms ease;
}

.hero__chip.is-active {
  color: #fff;
  background: linear-gradient(120deg, var(--kh-accent), var(--kh-accent-2));
  border-color: transparent;
}

.hero__chip--guide {
  color: #ffd98a;
  border-color: rgb(255 217 138 / 34%);
}

.hero__demo-tip { margin-top: 9px; font-size: 11px; color: var(--kh-text-2); }

/* 统计条 */
.stats {
  display: flex;
  gap: 12px;
  justify-content: center;
  max-width: 1100px;
  padding: 26px 0 6px;
  margin: 26px auto 0;
  border-top: 1px solid rgb(255 255 255 / 8%);
}

.stats__item {
  display: flex;
  flex: 1;
  flex-direction: column;
  max-width: 190px;
  align-items: center;
}

.stats__item b {
  font-size: 26px;
  background: linear-gradient(120deg, var(--kh-accent), var(--kh-accent-2));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stats__item span { font-size: 11px; color: var(--kh-text-2); }

/* ------------------------------ Bento ------------------------------ */

.bento {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  max-width: 1100px;
  padding: 40px 24px 64px;
  margin: 0 auto;
}

@media (width <= 860px) {
  .bento { grid-template-columns: 1fr; }
}

.bento__card {
  position: relative;
  padding: 22px 20px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  transition: transform 200ms ease, border-color 200ms ease;
}

.bento__card::before {
  position: absolute;
  inset: 0;
  content: "";
  pointer-events: none;
  background: radial-gradient(340px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgb(91 141 239 / 12%), transparent 65%);
  opacity: 0;
  transition: opacity 250ms ease;
}

.bento__card:hover { border-color: rgb(91 141 239 / 45%); transform: translateY(-2px); }
.bento__card:hover::before { opacity: 1; }

.bento__icon { font-size: 22px; }

.bento__card h3 {
  margin: 10px 0 6px;
  font-size: 15px;
  font-weight: 760;
  color: var(--vp-c-text-1);
}

.bento__card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

@keyframes kh-drift {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(4%, 6%, 0) scale(1.12); }
}

@media (prefers-reduced-motion: reduce) {
  .hero__blob { animation: none; }
}
</style>
