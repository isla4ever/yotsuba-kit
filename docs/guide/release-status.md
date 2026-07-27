# 版本与发布状态

官网会区分 current main 的能力和 registry 已发布版本，避免文档展示了用户尚无法安装的 API。

| 分发 | 注册表稳定版 | current main | 说明 |
| --- | --- | --- | --- |
| `@iyotsuba/schedule-core` | `0.5.0` | `0.6.0` | 0.6 增加课程资料、任务和统一视觉 / Today API |
| `@iyotsuba/schedule-vue` | `0.5.0` | `0.6.0` | 在线官网演示使用 current main |
| `@iyotsuba/schedule-elements` | `0.5.0` | `0.6.0` | 需要和 core / Vue 同步发版 |
| `@iyotsuba/schedule-react` | `0.3.1` | `0.6.0` | React 包需单独验证并同步发版 |
| `yotsuba_schedule_kit` (pub.dev) | `0.5.0` | `0.6.0` | Flutter 包需要通过 `dart pub publish --dry-run` 后发布 |

## 使用原则

- 生产安装请固定到表中“注册表稳定版”，并只使用该版本的 changelog 所列 API。
- 官网中的 `0.6.0` 页面用于 current main、演示和即将发布的 API 审阅；不要把它当成已经可从 NPM 或 pub.dev 获取的版本。
- 发布 `0.6.0` 前，Web 需要完成 package build、unit / e2e、consumer playground 验证和 NPM dry-run；Flutter 需要 `flutter analyze`、`flutter test`、example web build 与 `dart pub publish --dry-run`。
- 完成上述验证且获得发布授权后，应同时更新本页稳定版、安装示例和 CHANGELOG，保持官网与注册表一致。
