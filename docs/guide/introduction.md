# 介绍

Yotsuba Schedule Kit 是一套**高度可配置的课表组件库**,把中国高校课表的真实复杂度做成了开箱即用的能力:

- **学期引擎**:单双周、周次范围、调休补班(按日期把来源星期的有效课程复制到补班日)、假日清空、重叠课连通分组、非本周置灰。
- **换周动效体系**:招牌的 `wave` 波浪覆盖(骨架常驻、稳定格静止、任何一帧不出现空网格),以及 `slide` / `fade` / `none`;全部通过 `TransitionSpec` 协议开放自定义。
- **分层架构**:
  - `@iyotsuba/schedule-core` — 零依赖 TypeScript,纯函数引擎 + 协议定义,可独立用于任何框架;
  - `@iyotsuba/schedule-vue` — Vue 3 组件 `<YsSchedule>`;
  - `@iyotsuba/schedule-elements` — `<ys-schedule>` 自定义元素,React / uni-app / 原生页面直接可用。
- **开放协议**:天气(`WeatherProvider`,库绝不私自发网络请求)、引导(`GuideMachine` 三模式状态机)、主题(`--ys-*` 令牌)。

> 今日指挥台组件 `<YsToday>`(widget 注册表、与课表联动)在 P2 路线中。
