# 版本状态

官网、在线演示与跨端包当前使用 `0.7.1` 能力线。Web 四包互相引用时需要保持同一版本；Flutter 保持相同的产品语义，但使用独立的 Dart API。

| 分发包 | 稳定版 | 主要职责 |
| --- | --- | --- |
| `@iyotsuba/schedule-core` | `0.7.1` | 学期引擎、课程模型、小时天气、主题、动效与引导协议 |
| `@iyotsuba/schedule-vue` | `0.7.1` | Vue 课表、Today、详情、弹层、天气视觉与引导界面 |
| `@iyotsuba/schedule-elements` | `0.7.1` | 原生 DOM / H5 自定义元素分发 |
| `@iyotsuba/schedule-react` | `0.7.1` | React 类型绑定、事件回调和实例引用 |
| `yotsuba_schedule_kit` | `0.7.1` | Flutter 原生课表、Today、弹层与天气视觉 |

## 如何选择版本

- Vue 项目通常只安装 `@iyotsuba/schedule-vue@0.7.1`，由包管理器解析兼容的 Core。
- React 项目安装 `@iyotsuba/schedule-react@0.7.1`；原生 H5 使用 `@iyotsuba/schedule-elements@0.7.1`。
- 直接组合多个 Web 包时，不要混用 `0.6.x` 与 `0.7.x`。
- Flutter 项目安装 `yotsuba_schedule_kit:^0.7.1`，按 Dart 类型迁移，不与 NPM 包共享二进制依赖。

## 0.7.1 验收边界

- 课程卡根据课程开始时间匹配小时级天气，同日课程不再被迫使用同一种天气。
- 非本周课程保持失色，周末课程仍有天气材质，长课程名与教室信息受行数约束。
- 层叠课程换周时，非本周卡在任何动画帧都不得覆盖或透出到本周卡上方。
- 应用级天气场景只渲染一份，并贯穿课表、Today 与导航表面。
- Web 包必须通过类型检查、单元测试、构建和 registry-only 消费验证。
- Flutter 包必须通过静态分析、测试、示例构建和 `dart pub publish --dry-run`。

具体行为变化见根目录 [CHANGELOG](https://github.com/isla4ever/yotsuba-kit/blob/main/CHANGELOG.md)。
