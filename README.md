# Yotsuba Kit 四叶草课表组件库

Yotsuba Kit 是面向中国高校课表与课程日程产品的跨框架开源组件体系。它将单双周、起止周、调休补班、重叠课程等学期规则，与天气联动、课程详情、教材任务、弹层和「今日」看板整理为稳定、可组合、可受控的 API。

组件只负责课表领域模型与界面表现，不在加载时申请定位、访问教务系统或执行系统副作用。无论是在 Vue、React、原生 H5 还是 Flutter 中，宿主都可以按自己的数据源、权限策略和产品结构完成接入。

## 快速入口

| 入口 | 地址 | 适合场景 |
| --- | --- | --- |
| **在线示例** | [iyotsuba.top](https://iyotsuba.top/) | 直接体验移动端课表、Today、天气和弹层交互 |
| **官网文档** | [isla4ever.github.io/yotsuba-kit](https://isla4ever.github.io/yotsuba-kit/) | 查看设计说明、组件配置和完整 API |
| **5 分钟接入** | [快速开始](https://isla4ever.github.io/yotsuba-kit/guide/getting-started.html) | 从最小课程数据运行第一个课表 |
| **Web 示例源码** | [yotsuba-kit-playground](https://github.com/isla4ever/yotsuba-kit-playground) | 查看 Vue、React 与原生 HTML 的完整消费方式 |
| **Flutter 示例源码** | [yotsuba-kit-flutter](https://github.com/isla4ever/yotsuba-kit-flutter/tree/main/packages/yotsuba_schedule_kit/example) | 查看 Flutter 组件公开 API 的完整用法 |
| **版本状态** | [发布与兼容性](https://isla4ever.github.io/yotsuba-kit/guide/release-status.html) | 核对 NPM、pub.dev 和跨框架版本线 |

当前稳定版为 `0.7.1`，项目采用 [MIT License](LICENSE)。

## 如何选择

| 需求 | 推荐入口 |
| --- | --- |
| Vue 3 应用 | `@iyotsuba/schedule-vue` |
| React 应用 | `@iyotsuba/schedule-react` |
| 原生 HTML、uni-app H5、Ionic 等 DOM 环境 | `@iyotsuba/schedule-elements` |
| 只需要学期计算、ICS、提醒、天气 Provider 或数据交换 | `@iyotsuba/schedule-core` |
| Flutter 应用 | [`yotsuba_schedule_kit`](https://pub.dev/packages/yotsuba_schedule_kit) |
| 想先确认视觉与交互 | [打开在线示例](https://iyotsuba.top/) |

## Yotsuba 项目关系

三个仓库采用统一的 `yotsuba-kit-*` 命名：

| 项目 | 定位 | 演示内容 |
| --- | --- | --- |
| **[yotsuba-kit](https://github.com/isla4ever/yotsuba-kit)** | Web 主体组件库与文档 | `core`、Vue、React、Custom Elements API 和官网内嵌移动演示 |
| **[yotsuba-kit-playground](https://github.com/isla4ever/yotsuba-kit-playground)** | Web 消费方演示与依赖验证 | Vue 全功能演示、React 演示、原生 HTML 演示、每日 registry 消费测试 |
| **[yotsuba-kit-flutter](https://github.com/isla4ever/yotsuba-kit-flutter)** | Flutter 组件包、完整应用与演示 | `yotsuba_schedule_kit`、Flutter 课表 / 今日 / 设置演示、跨平台完整应用 |

Web 与 Flutter 复用同一组产品概念：`Schedule`、`Today`、课程数据、天气、详情、弹层和布局；平台实现保持独立，不为了“代码一致”牺牲 Vue / React / Flutter 各自的原生交互。

## 包结构

| 包 | 说明 |
| --- | --- |
| [`@iyotsuba/schedule-core`](packages/core) | 零运行时依赖 TypeScript：学期引擎、重叠分组、提醒、ICS、分享码、主题、天气和动效协议 |
| [`@iyotsuba/schedule-vue`](packages/vue) | Vue 3 `<YsSchedule>` / `<YsToday>`，包含完整插槽、事件和公开方法 |
| [`@iyotsuba/schedule-elements`](packages/elements) | `<ys-schedule>` / `<ys-today>` 自定义元素，适用于原生 HTML、uni-app H5、Ionic 等 DOM 环境 |
| [`@iyotsuba/schedule-react`](packages/react) | React 类型化绑定，提供 Props、事件回调和元素 ref |

Flutter 对应包是 [`yotsuba_schedule_kit`](https://pub.dev/packages/yotsuba_schedule_kit)，源码和演示位于 [yotsuba-kit-flutter](https://github.com/isla4ever/yotsuba-kit-flutter)。

## 核心能力

### 学期与课程

- 中国高校常用的单双周、周次范围、调休补班、假日和重叠课程
- 受控 `Course` 数据，支持教材 `books`、结构化携带物 `materials`、课程任务 `tasks`、备注和宿主 `meta`
- 内置课程新增、编辑、删除、冲突提示、日计划和自定义背景
- 纯函数导出 ICS、分享码、提醒计划和教务数据适配

### 视觉与交互

- `wave / slide / fade / cube / drop / zoom / none` 七种换周模式和自定义 `TransitionSpec`
- 六套课程配色、三档信息密度；课程卡按上课时间匹配小时级天气，微光 / 辉光 / 极光 / 呼吸与天气层自动互斥
- 晴、多云、阴、雾、小雨、中雨、大雨、雷阵雨、雪均有独立动态图标、局部微动态课程卡材质和低频页面氛围
- 全局天气场景贯穿课表、Today 与导航表面；非本周课程保持失色，不被天气色重新染色
- 减少动态效果、触摸换周、无空白帧过渡和浅深色主题令牌

### 详情、弹层与 Today

- 详情字段、空值提示、操作区、Hero 和紧凑 / 标准 / 全面布局均可编排
- 周选择器、课程详情、表单、日计划和背景选择器可使用内置实现，也可由宿主接管
- 弹层支持底部、居中、右侧，并可按弹层类型设置默认位置
- Today 内置下一节课、时间线、课前准备、课程任务、计划、周概览和天气七种模块
- 长按进入布局编辑、整卡拖动智能让位，选中单卡后显示贴边四角缩放控点，并支持 `#widget-<id>` 自定义模块
- `1x1 / 1x2 / 2x1 / 2x2` 可分别呈现摘要、列表、紧凑趋势与完整图表，缩放时同步过渡内容层级

## 快速开始

### Vue

```bash
pnpm add @iyotsuba/schedule-vue@0.7.1
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { YsSchedule, type Course } from '@iyotsuba/schedule-vue'

const week = ref(1)
const courses = ref<Course[]>([
  {
    id: 'math',
    name: '高等数学',
    weekday: 1,
    startSection: 1,
    endSection: 2,
    startWeek: 1,
    endWeek: 20,
    books: [{ title: '高等数学（第八版）', required: true }],
    materials: [{ name: '计算器', kind: 'device' }],
    tasks: [{ id: 'math-3', title: '完成第三章课后题' }],
  },
])
</script>

<template>
  <YsSchedule
    v-model:week="week"
    :courses="courses"
    :term-start="new Date(2026, 8, 7)"
    card-effect="none"
    :weather-card="{ enabled: true, background: true }"
    weather-scene
    style="height: 720px"
  />
</template>
```

### React

```bash
pnpm add @iyotsuba/schedule-react@0.7.1
```

```tsx
<YsSchedule
  week={week}
  courses={courses}
  termStart={termStart}
  onUpdateWeek={setWeek}
  onCourseTap={openCourse}
/>
```

### Flutter

```bash
flutter pub add yotsuba_schedule_kit
```

Flutter 的完整接入与演示见 [yotsuba-kit-flutter](https://github.com/isla4ever/yotsuba-kit-flutter)。

## 受控边界

组件库不会在加载时暗中申请定位、请求天气、写入日历、发送通知或持久化课程。宿主负责权限、网络、缓存和业务副作用，再把 `WeatherSnapshot`、课程、计划和布局数据传入组件。这样组件可以在公众号 H5、普通 Web、桌面浏览器和 Flutter 应用中保持一致的能力边界。

## 文档索引

- [Schedule 组件](https://isla4ever.github.io/yotsuba-kit/components/schedule.html)
- [Today 组件](https://isla4ever.github.io/yotsuba-kit/components/today.html)
- [Course、教材、携带物与任务](https://isla4ever.github.io/yotsuba-kit/components/course-data.html)
- [Core API](https://isla4ever.github.io/yotsuba-kit/api/core.html)
- [事件 / 方法 / 插槽](https://isla4ever.github.io/yotsuba-kit/api/events.html)
- [Vue / React / Elements / Flutter 接入](https://isla4ever.github.io/yotsuba-kit/frameworks/vue.html)

## 本地开发

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
pnpm e2e
pnpm docs:dev
```

发布包之前，还需要在 [yotsuba-kit-playground](https://github.com/isla4ever/yotsuba-kit-playground) 中使用 registry 产物完成独立消费验证。

## License

[MIT](LICENSE)
