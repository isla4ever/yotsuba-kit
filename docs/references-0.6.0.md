# 0.6.0 课表项目与依赖调研

调研时间:2026-07-27。本文只记录产品/架构参考和许可边界,不表示 Yotsuba 复制了下列项目的源码或视觉资产。

## 开源项目

| 项目 | 许可证 | 可参考部分 | 0.6.0 采用边界 |
| --- | --- | --- | --- |
| [JonasWanke/timetable](https://github.com/JonasWanke/timetable) | Apache-2.0 | Flutter 日/周可见范围控制器、事件拖动回调、主题注入 | 只参考控制器与回调边界;Yotsuba 保留中国学期引擎和自有网格 |
| [gnahz77/SchedU](https://github.com/gnahz77/SchedU) | MIT | 中文 Flutter 课表、冲突课程、JSON/教务导入的分层 | 仅参考移动信息架构;AI/教务导入不进入 UI 组件库 |
| [BenderBlog/traintime_pda](https://github.com/BenderBlog/traintime_pda) | MPL-2.0 | 中国高校课表、日程、桌面/平板 Master-Detail 场景 | 只用于需求校验;不复制 MPL 文件、图标或页面实现 |
| [schedule-x/schedule-x](https://github.com/schedule-x/schedule-x) | MIT | 框架包装、插件化日历、宿主组件注入 | 参考 Core / Vue / Elements / React 分层;不引入其日历运行时 |
| [fullcalendar/fullcalendar](https://github.com/fullcalendar/fullcalendar) | MIT | 拖拽互动插件、受控事件模型、框架 connector | 作为插件 API 参考;不引入,避免包体和通用日历语义覆盖高校课表语义 |

## 依赖决策

- Web 继续使用标准 Pointer Events、Vue Transition 和现有主题令牌,不增加 `@fullcalendar/interaction` 或 `@schedule-x/*`。
- Flutter 继续使用 SDK 内置手势、动画与 Material 控件,不引入另一套 timetable 运行时。
- `yotsuba_schedule_kit` 保持仅依赖 Flutter SDK;`@iyotsuba/schedule-core` 保持零运行时依赖。
- 所有天气、定位、教务导入、日历写入和分享副作用仍由宿主授权并注入,组件库不主动执行。

## 实际落地

- 采用了“引擎/框架绑定/消费演示”分层、受控布局回调和公开方法。
- 采用了移动端整卡拖动、四角缩放、重叠课分支和详情过渡的产品思路,但代码均在 Yotsuba 数据契约上独立实现。
- 未采用通用日历的全量时间轴、远程教务导入或第三方天气权限封装,以保持包边界简单。
