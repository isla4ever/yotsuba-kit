# Yotsuba Schedule Kit

高度可配置的开源课表组件库。中国高校学期语义(单双周 / 调休补班 / 重叠课)开箱即用,
课程天气场景、默认流光、教材与任务、详情过渡和移动端 Today 排版统一在同一套可插拔 API 中。

| 包 | 说明 |
| --- | --- |
| [`@iyotsuba/schedule-core`](packages/core) | 零依赖 TS:学期引擎、过渡协议、主题令牌、天气/引导协议 |
| [`@iyotsuba/schedule-vue`](packages/vue) | Vue 3 组件 `<YsSchedule>` |
| [`@iyotsuba/schedule-elements`](packages/elements) | `<ys-schedule>` / `<ys-today>` 自定义元素(uni-app H5 / 原生 HTML) |
| [`@iyotsuba/schedule-react`](packages/react) | React 类型化绑定 `<YsSchedule>` `<YsToday>` |

文档官网:https://isla4ever.github.io/yotsuba-kit/
消费方示例与依赖测试:https://github.com/isla4ever/yotsuba-kit-playground(Vue 全功能 / React / 原生 HTML,每日 CI 对最新发布版跑消费测试)

## Vue 配置面

`<YsSchedule>` 的主要展示与交互能力均可受控:

- Header:`topBar="compact | standard | expanded | none"`,并提供 `top-bar` / `top-bar-tools` slot。
- 课表:`visibleDays`, `rowHeight`, `weekdayBar`, `density`, `palette`, `theme`;`Course` 支持结构化 `books` / `materials` / `tasks`,并兼容旧版字符串资料。
- 动效:`transition` 支持 wave / slide / fade / cube / drop / zoom / 自定义协议;`cardEffect` 支持 5 档卡片效果,`shimmer` 为默认。
- 天气:`weather` 接受宿主 Provider 的快照,课程卡天气图标/色调与 `weatherScene` 默认开启;组件不会自行请求定位或网络。
- 详情:`detail.layout` 支持 compact / standard / full,`hero`, `fields`, `actions` 控制天气联动样式、字段顺序及分享 / 编辑 / 删除动作;`emptyText` / `emptyTexts` 保留空字段 label 并允许覆盖提示词,重叠课选择到详情使用层内过渡。
- 弹层:`sheets.placement` 提供全局默认,`sheets.placements` 可按 weekPicker / courseDetail / courseForm / dayPlanner / background 分别设置;`adjustable` 在每个弹层 Header 提供局部位置切换。
- 今日:`<YsToday v-model:widgets>` 控制模块顺序与 `1x1` / `1x2` / `2x1` / `2x2` 尺寸;`arrangeable` 开启长按/入口编辑、整卡拖动让位和四角连续缩放。任意模块可用 `#widget-<id>` 替换,并提供 `setWidgets` / `setArranging` / `moveWidget` / `resizeWidget` / `toggleWidget` / `layoutReset` 方法。
- 按钮和面板:week picker、详情、课程表单、日计划、背景选择器均可使用内置实现或切换为宿主管理。

```vue
<YsSchedule
  v-model:week="week"
  :courses="courses"
  :weather="weatherSnapshot"
  top-bar="expanded"
  density="rich"
  palette="morandi"
  transition="wave"
  card-effect="shimmer"
  weather-scene
  :sheets="{
    placement: 'bottom',
    placements: { courseDetail: 'right', weekPicker: 'center' },
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
  @course-share="shareCourse"
  @detail-layout-change="detailLayout = $event"
/>
```

`weather` 是受控数据,UI 库不会在加载时暗中申请定位或请求网络。宿主应在用户点击天气入口后调用 `navigator.geolocation`,再用 `@iyotsuba/schedule-core/weather/open-meteo` 导出的 `createOpenMeteoProvider({ latitude, longitude })`（或自有 WeatherProvider）生成 `WeatherSnapshot`,同时传给 `YsSchedule` 与 `YsToday`;详情、今日卡片与背景场景会共享这份天气状态。

## 0.6.0 重点

- 课程卡默认显示对应日天气图标与背景色调,星期栏可显示天气与温度,动态天气场景与默认流光均可关闭或替换。
- 课程数据增加教材、结构化携带物和课程任务;Today 直接汇总下一节课的教材和未完成任务。
- 详情空值不再留白,重叠课进入详情有连续过渡;Vue / Elements / React 共用同一套行为和公开方法。
- Today 专注移动端触摸交互:整卡拖动、智能让位、四角缩放,不绑定桌面方向键。

## 开发

```bash
pnpm install
pnpm build        # 构建全部包
pnpm test         # 全部测试
pnpm docs:dev     # 本地文档站
```

## 当前能力

- core:学期引擎、提醒、ICS、分享码、主题、动效、天气与引导协议。
- Vue:课表、今日、编辑、日计划、背景、引导、天气场景、可编排详情与弹层。
- elements / React:自定义元素与类型化 React 绑定。

## License

MIT
