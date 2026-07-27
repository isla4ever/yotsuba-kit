# 选择你的阅读路径

Yotsuba Schedule Kit 是面向中国高校课表场景的跨端组件库。它把学期计算、课程展示、今日视图和常用交互整理成稳定的数据契约，让产品团队不必从零处理单双周、调休、重叠课程和移动端排版。

你不需要先通读全部文档。请从当前目标开始：

| 你的目标 | 建议入口 | 完成后你会得到 |
| --- | --- | --- |
| 先运行一个课表 | [5 分钟接入](/guide/getting-started) | 一个可换周、可展示课程的最小页面 |
| 接入现有 Vue、React 或 Flutter 项目 | [选择接入方式](/guide/frameworks) | 对应包、数据绑定方式与平台边界 |
| 设计完整课表产品 | [Schedule 课表组件](/components/schedule) | 天气、详情、编辑、背景与日计划的组合方案 |
| 构建“今日”页面 | [Today 今日视图](/components/today) | 课程、任务、教材、计划与天气的可排版视图 |
| 查询具体配置 | [API 总览](/api/core) | 配置项、事件、方法和插槽的精确说明 |

## 组件库负责什么

- `@iyotsuba/schedule-core` 负责学期周次、单双周、调休、重叠课程、提醒和数据交换等确定性计算。
- Web 与 Flutter 组件负责课表、Today、详情、弹层、主题和动效的界面行为。
- 事件、公开方法和插槽负责把业务操作交还给宿主应用。

## 宿主应用负责什么

课程数据的保存、用户定位、天气请求、系统日历、分享和账号同步仍由你的应用负责。组件不会因被引入而主动申请权限或写入业务数据。

## 项目与演示

- [yotsuba-kit](https://github.com/isla4ever/yotsuba-kit)：Core、Vue、React 与 Custom Elements 组件及本文档。
- [yotsuba-kit-playground](https://github.com/isla4ever/yotsuba-kit-playground)：Vue 与 React 的完整接入示例。
- [yotsuba-kit-flutter](https://github.com/isla4ever/yotsuba-kit-flutter)：Flutter 组件、示例应用与公开 API 演示。

第一次使用时，建议继续阅读 [5 分钟接入](/guide/getting-started)。
