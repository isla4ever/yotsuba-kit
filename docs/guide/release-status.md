# 版本状态

官网以稳定版使用文档为基础，同时展示下一版本的候选 API。候选版本来自当前 `main` 分支源码，不等同于已经发布到 NPM 或 pub.dev 的安装包。

| 分发包 | 注册表稳定版 | 主分支候选版本 | 状态说明 |
| --- | --- | --- | --- |
| `@iyotsuba/schedule-core` | `0.5.0` | `0.6.0` | 候选版增加课程资料、任务和统一视觉协议 |
| `@iyotsuba/schedule-vue` | `0.5.0` | `0.6.0` | 官网在线演示使用候选版能力 |
| `@iyotsuba/schedule-elements` | `0.5.0` | `0.6.0` | 将与 Core、Vue 同步发布 |
| `@iyotsuba/schedule-react` | `0.3.1` | `0.6.0` | 发布前需要完成独立消费者验证 |
| `yotsuba_schedule_kit` | `0.5.0` | `0.6.0` | 发布前需要完成 pub.dev 检查 |

## 如何选择版本

- 新的生产项目：安装“注册表稳定版”，并以对应 CHANGELOG 为功能边界。
- 评估下一版本：使用 `main` 分支源码、官网演示和候选 API 文档，不要将其视为已发布包。
- 升级已有项目：等待正式版本发布后，再同时升级相互依赖的 Core、Vue、Elements 或 React 包。

## 发布门槛

Web 包需要通过构建、单元测试、端到端测试、消费者示例和 NPM dry-run；Flutter 包需要通过静态分析、测试、示例构建和 `dart pub publish --dry-run`。完成验证并获得发布授权后，官网安装命令、CHANGELOG 与本页会同步更新。
