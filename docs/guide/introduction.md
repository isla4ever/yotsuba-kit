# 介绍

Yotsuba Schedule Kit 是一套**高度可配置的课表组件库**,把中国高校课表的真实复杂度做成了开箱即用的能力:

- **学期引擎**:单双周、周次范围、调休补班(按日期把来源星期的有效课程复制到补班日)、假日清空、重叠课连通分组、非本周置灰。
- **换周动效体系**:招牌的 `wave` 波浪覆盖（骨架常驻、稳定格静止、任何一帧不出现空网格），以及 `slide` / `fade` / `cube` / `drop` / `zoom` / `none`；全部通过 `TransitionSpec` 协议开放自定义。
- **分层架构**:
  - `@iyotsuba/schedule-core` — 零依赖 TypeScript,纯函数引擎 + 协议定义,可独立用于任何框架;
  - `@iyotsuba/schedule-vue` — Vue 3 组件 `<YsSchedule>` / `<YsToday>`；
  - `@iyotsuba/schedule-elements` — `<ys-schedule>` / `<ys-today>` 自定义元素；
  - `@iyotsuba/schedule-react` — React 类型化绑定；
  - `yotsuba_schedule_kit` — Flutter 原生组件包。
- **开放协议**:天气（`WeatherProvider`，组件库绝不私自发网络请求）、引导（`GuideMachine` 三模式状态机）、主题（`--ys-*` 令牌）、课程资料 / 教材 / 任务和受控 Today 布局。

`<YsToday>` 已提供 7 个内置模块、整卡拖动智能让位、四角缩放、空状态文案和 `#widget-<id>` 自定义插槽。请从[组件](/components/today)开始查看，或从[Core API](/api/core)按函数检索。

完整 Web 消费演示位于 [yotsuba-kit-playground](https://github.com/isla4ever/yotsuba-kit-playground)，Flutter 组件包、完整应用与演示位于 [yotsuba-kit-flutter](https://github.com/isla4ever/yotsuba-kit-flutter)。
