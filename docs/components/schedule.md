# Schedule 课表组件

`<YsSchedule>` 用于构建完整课表页面，已经组合周次栏、日期栏、课表网格、天气场景、课程详情、编辑表单、日计划、背景和新手引导。所有业务数据由宿主通过配置项传入，组件通过事件报告用户操作。

首次接入请先完成 [5 分钟接入](/guide/getting-started)。本页集中说明课表组件的配置项、事件、方法和插槽，不需要在接入过程中切换页面。

::: info 0.7.1
本页对应 `0.7.1` 稳定 API，包含小时级课程天气、全局天气场景、三档信息密度、层叠课程稳定换周和重新进入引导等能力。
:::

## 最小接入

```vue
<script setup lang="ts">
import { YsSchedule, type Course } from '@iyotsuba/schedule-vue'
import { ref } from 'vue'

const week = ref(1)
const courses = ref<Course[]>([])
</script>

<template>
  <YsSchedule
    v-model:week="week"
    :courses="courses"
    :term-start="new Date(2026, 8, 7)"
  />
</template>
```

课程、教材、携带物和任务的结构见[课程数据](/components/course-data)。学期计算、ICS、分享码和提醒见[学期、课程与数据交换](/api/term-data)。

## 配置项（Props）

### 数据与学期

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `courses` | `Course[]` | `[]` | 受控课程数据 |
| `week` | `number` | `1` | 当前周，配合 `v-model:week` |
| `totalWeeks` | `number` | `20` | 总周数；公开 `setWeek()` 会自动 clamp |
| `termStart` | `Date` | — | 第 1 周周一；日期、今日态和调休依赖它 |
| `overrides` | `DayOverride[]` | `[]` | `makeup` 补班和 `holiday` 假日 |
| `courseTimes` | `CourseTime[] \| 'standard'` | `'standard'` | 作息表 |
| `dayPlans` | `DayPlanMap` | `{}` | 日期键到计划列表；与 Today 传同一份即可联动 |

### 网格与顶栏

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `visibleDays` | `5 \| 6 \| 7` | `7` | 可见工作日数量 |
| `rowHeight` | `number` | `56` | 普通节次行高（px） |
| `breakAfterSection` | `number` | `4` | 午休分隔位置 |
| `topBar` | `'compact' \| 'standard' \| 'expanded' \| 'none'` | `'standard'` | 顶部栏信息密度 |
| `topBarTitle` | `string` | `'本学期课表'` | 顶部栏标题 |
| `weekdayBar` | `boolean` | `true` | 星期 / 日期表头 |
| `swipeable` | `boolean` | `true` | 触摸滑动换周 |
| `reduceMotion` | `boolean \| 'auto'` | `'auto'` | `auto` 跟随系统减少动态效果 |

### 视觉、天气与动效

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `transition` | 内置名或 `TransitionSpec` | `'wave'` | `wave / slide / fade / cube / drop / zoom / none`，也可传自定义协议 |
| `theme` | `'light' \| 'dark' \| Partial<ThemeTokens>` | `'light'` | 主题令牌 |
| `density` | `'minimal' \| 'normal' \| 'rich'` | `'normal'` | 课程信息密度 |
| `palette` | `PaletteName \| string[]` | 内置 | 六套内置配色或自定义颜色数组 |
| `cardEffect` | `'none' \| 'shimmer' \| 'glow' \| 'aurora' \| 'breathe'` | `'none'` | 显式光效会替换课程卡局部微动态天气材质，换周和 reduce-motion 时自动收敛 |
| `weather` | `WeatherSnapshot \| null` | `null` | 由宿主提供的当前、逐日与可选小时级天气快照 |
| `weatherCard` | `WeatherCardConfig \| false` | 仅局部材质 | 控制课程卡局部微动态天气材质、可选图标、文案和强度 |
| `weekdayWeather` | `'none' \| 'icon' \| 'full'` | `'icon'` | 星期栏天气信息层级 |
| `weatherScene` | `boolean` | `true` | 是否显示由天气快照驱动的低频模糊氛围层；应用壳层只保留一份即可贯穿多个模块 |

### 内置界面与宿主接管

| Prop | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `weekPicker` / `courseDetail` | `'builtin' \| 'none'` | `'builtin'` | 关闭后只发事件，由宿主渲染界面 |
| `courseForm` | `'builtin' \| 'none'` | `'builtin'` | 编辑模式的课程表单 |
| `dayPlanner` | `'builtin' \| 'none'` | `'builtin'` | 日期计划面板 |
| `backgroundPicker` | `'builtin' \| 'none'` | `'builtin'` | 上传、裁剪课表背景的面板 |
| `editable` | `boolean` | `false` | 空白格选节次新增、详情编辑和删除 |
| `background` | `{ image?, opacity?, blur? } \| null` | `null` | 受控背景配置 |
| `sheets` | `SheetConfig` | — | 全局和按类型的弹层位置、毛玻璃、contained、adjustable |
| `detail` | `ScheduleDetailConfig` | — | Hero、布局、字段、操作、空状态文案和局部调整入口 |
| `guide` | `GuideConfig \| false` | `false` | tips / spotlight / walkthrough 引导 |

## 事件

事件只报告用户意图和受控数据变化。宿主收到事件后更新 `courses`、`week`、`dayPlans` 或背景等状态，组件不会自行写入 store、网络接口或系统能力。

| 事件 | 参数 | 触发时机 |
| --- | --- | --- |
| `update:week` | `(week: number)` | `v-model:week` 回写 |
| `week-change` | `(week: number, previous: number)` | 当前教学周改变 |
| `course-tap` | `(course: DisplayCourse, stack: DisplayCourse[])` | 点击课程；`stack` 包含同一位置的重叠课程 |
| `day-tap` | `(weekday: number, date: Date \| null)` | 点击日期表头 |
| `swipe` | `(direction: 1 \| -1)` | 手势翻周；`1` 为下一周，`-1` 为上一周 |
| `week-picker-open` | — | 请求打开周选择器，适合宿主接管界面 |
| `transition-start` / `transition-end` | `(spec: TransitionSpec)` | 换周过渡开始或结束 |
| `guide-step` | `(step: GuideStep, index: number)` | 引导进入新步骤 |
| `guide-finish` | — | 引导完成或被跳过 |
| `course-add` | `(course: Course)` | 内置表单提交新增课程 |
| `course-update` | `(course: Course, previousId: string)` | 内置表单提交课程修改 |
| `course-remove` | `(course: DisplayCourse)` | 用户确认删除课程 |
| `cell-select` | `(weekday: number, startSection: number, endSection: number)` | 编辑模式选中空白节次 |
| `course-form-request` | `(prefill: Partial<Course>)` | 请求宿主打开自定义课程表单 |
| `plan-add` | `(dateKey: string, text: string)` | 新增日计划 |
| `plan-toggle` / `plan-remove` | `(dateKey: string, id: string)` | 切换或删除日计划 |
| `background-change` | `(dataUrl: string \| null)` | 应用或移除自定义背景 |
| `course-share` | `(course: DisplayCourse)` | 详情页请求宿主执行分享 |
| `detail-layout-change` | `(layout: DetailLayout)` | 用户切换详情信息密度 |

```vue
<YsSchedule
  v-model:week="week"
  :courses="courses"
  @course-tap="(course, stack) => trackCourseOpen(course, stack.length)"
  @course-add="course => courses.push(course)"
  @plan-toggle="(dateKey, id) => togglePlan(dateKey, id)"
  @course-share="shareCourse"
/>
```

Vue 使用表中的 kebab-case 名称。React 的 camelCase 回调与 Today 事件对照仍统一收录在 [事件 API](/api/events)。

## 方法

通过 Vue 模板引用可以执行翻周、打开详情或弹层等界面命令。方法只操作当前组件；业务数据仍通过受控 Props 更新。

| 方法 | 说明 |
| --- | --- |
| `setWeek(week)` | 跳转到合法周次，并触发 `update:week` |
| `getWeek()` | 返回当前显示的教学周 |
| `next()` / `previous()` | 前后翻一周 |
| `openCourse(id)` | 打开指定课程的内置详情 |
| `openWeekPicker()` | 打开周选择器；宿主接管时发出 `week-picker-open` |
| `openCourseForm(prefill?)` | 打开课程表单，可预填 `Partial<Course>` |
| `openDayPlanner(date?)` | 打开指定日期的计划面板 |
| `openBackgroundPicker()` | 打开背景上传与裁剪面板 |
| `closeSheets()` | 关闭所有内置弹层 |
| `startGuide()` | 从第一步启动当前配置的引导 |

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { YsSchedule } from '@iyotsuba/schedule-vue'

const schedule = ref<InstanceType<typeof YsSchedule> | null>(null)
</script>

<template>
  <button type="button" @click="schedule?.setWeek(8)">前往第 8 周</button>
  <button type="button" @click="schedule?.openCourse('math-01')">查看高等数学</button>
  <YsSchedule ref="schedule" :courses="courses" :term-start="termStart" />
</template>
```

React 与 Custom Elements 通过元素引用调用同名方法，类型入口统一见 [方法 API](/api/methods)。

## 插槽

插槽用于替换局部结构，同时保留课表的周次、冲突、天气和弹层计算。只调整颜色、字体或间距时，优先使用主题变量。

| 插槽 | 作用域 | 用途 |
| --- | --- | --- |
| `top-bar` | `{ week, totalWeeks, openWeekPicker }` | 完整替换顶部周次栏 |
| `top-bar-tools` | — | 在内置顶部栏右侧加入宿主操作 |
| `day` | `{ weekday, label, date, weather }` | 替换单个日期与天气表头 |
| `course` | `{ course, active, color }` | 替换课程卡内容 |
| `detail-field` | `{ field, label, course, emptyText }` | 按字段替换详情内容 |
| `detail-extra` | `{ course }` | 在详情字段后追加业务内容 |
| `detail-actions` | `{ course, close }` | 替换详情底部动作区 |

```vue
<YsSchedule :courses="courses" :term-start="termStart">
  <template #top-bar-tools>
    <button type="button" @click="syncCalendar">同步日历</button>
  </template>

  <template #course="{ course, active, color }">
    <CourseCard :course="course" :muted="!active" :color="color" />
  </template>

  <template #detail-actions="{ course, close }">
    <button type="button" @click="shareCourse(course)">分享</button>
    <button type="button" @click="close">关闭</button>
  </template>
</YsSchedule>
```

跨组件的 Today 自定义模块和全部作用域汇总仍保留在 [插槽 API](/api/slots)。

## 编辑模式

`editable` 开启后，用户可点击或拖选空白节次，组件会发出课程新增、更新和删除请求。组件不会写入你的 store：

```vue
<YsSchedule
  :courses="courses"
  editable
  @course-add="course => courses.push(course)"
  @course-update="(course, previousId) => replaceById(previousId, course)"
  @course-remove="course => removeById(course.id)"
/>
```

设置 `course-form="none"` 后，可以监听 `cell-select` 和 `course-form-request` 接管表单。编辑所需的 `books`、`materials`、`tasks` 都是 [Course](/components/course-data) 的受控字段。

## 日计划

向 `dayPlans` 传入 `YYYY-MM-DD -> DayPlan[]`。日期栏会显示未完成角标；内置面板只发出 `plan-add`、`plan-toggle`、`plan-remove`，由宿主持久化。将同一 `dayPlans` 传给 `<YsToday>`，计划会自然同步到 Today 模块。

## 自定义背景

```vue
<YsSchedule
  :background="{ image: coverUrl, opacity: 0.32, blur: 0 }"
  @background-change="value => saveBackground(value)"
/>
```

调用 `openBackgroundPicker()` 可打开内置上传与裁剪面板。关闭 `backgroundPicker` 后，背景选择仍可由宿主自行实现。

## 天气、详情与弹层

天气不是组件内部网络请求。宿主完成定位、权限、缓存和 Provider 选择后，将 `WeatherSnapshot` 同时传给 `<YsSchedule>` 和 `<YsToday>`：

```vue
<YsSchedule
  :weather="weatherSnapshot"
  weekday-weather="full"
  weather-scene
  :sheets="{
    placement: 'bottom',
    placements: { weekPicker: 'center', courseDetail: 'right' },
    glass: true,
    contained: true,
    adjustable: true,
  }"
  :detail="{
    hero: 'weather',
    layout: 'standard',
    fields: ['time', 'weeks', 'location', 'teacher', 'weather', 'note', 'materials', 'tasks'],
    emptyText: '暂无信息',
    actions: ['share', 'edit'],
    adjustable: true,
  }"
/>
```

`hourly` 存在时，课程卡和详情会按照课程开始节次对应的时间选择同一天最近的小时点；同一天早课与晚课可以呈现不同天气和温度。缺少小时数据时才回退到 `daily`。周六、周日与工作日使用同一套匹配规则。

非本周课程始终保持失色状态，天气层不会重新为它着色。显式 `cardEffect` 会替换课程卡天气材质，避免两套光效叠加；页面级天气场景仍可保留。

缺少信息时，详情会保留字段标签并显示 `emptyText`；可以通过 `emptyTexts` 按 `DetailField` 覆盖提示语。重叠课程从选择列表进入详情时，会在同一弹层内保持连续过渡。
