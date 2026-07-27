# Schedule 课表

`<YsSchedule>` 是面向应用页的高层组件：周 Header、日期表头、课表网格、天气场景、内置详情、表单、日计划、背景和引导都已组合好。它不保存你的业务数据，所有可变数据都通过 Props 输入、事件回传。

> `0.6.0` 是 current main 的 API。注册表当前稳定版仍为 `0.5.0`；在发布完成前，请以 [版本与发布状态](/guide/release-status) 判断安装版本。

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

课程数据、教材、携带物和任务的结构见 [Course 数据模型](/components/course-data)。纯学期计算、ICS、分享码和提醒见 [Core API](/api/core)。

## Props

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
| `topBar` | `'compact' \| 'standard' \| 'expanded' \| 'none'` | `'standard'` | 课表 Header 档位 |
| `topBarTitle` | `string` | `'本学期课表'` | Header 标题 |
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
| `cardEffect` | `'none' \| 'shimmer' \| 'glow' \| 'aurora' \| 'breathe'` | `'shimmer'` | 流光为默认；换周和 reduce-motion 时自动收敛 |
| `weather` | `WeatherSnapshot \| null` | `null` | 由宿主提供的天气快照 |
| `weatherCard` | `WeatherCardConfig \| false` | 全开 | 控制课程卡图标、背景色调、文案和强度 |
| `weekdayWeather` | `'none' \| 'icon' \| 'full'` | `'icon'` | 星期栏天气信息层级 |
| `weatherScene` | `boolean` | `true` | 受天气快照驱动的背景场景 |

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

完整事件见 [事件](/api/events)，公开 ref 方法见 [方法](/api/methods)，替换点见 [插槽](/api/slots)。

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

设置 `course-form="none"` 后，可监听 `cell-select` 和 `course-form-request` 自行接管表单。编辑所需的 `books`、`materials`、`tasks` 都是 [Course](/components/course-data) 的受控字段。

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

缺少信息时保留字段 label 并显示 `emptyText`；`emptyTexts` 可按 `DetailField` 逐项覆盖。重叠课从选择态进入详情时保持同一弹层内连续过渡。
