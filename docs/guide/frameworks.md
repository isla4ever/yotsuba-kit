# 选择接入方式

所有平台共享同一套课程、学期和 Today 语义，但使用各自原生的数据绑定与交互实现。先按项目运行环境选择入口，再阅读对应框架页。

| 项目环境 | 推荐包 | 何时选择 | 接入文档 |
| --- | --- | --- | --- |
| Vue 3 | `@iyotsuba/schedule-vue` | 需要完整组件、插槽、事件和模板引用 | [Vue 3](/frameworks/vue) |
| React | `@iyotsuba/schedule-react` | 需要类型化配置、回调和组件引用 | [React](/frameworks/react-elements#react) |
| 原生 HTML、Ionic、uni-app H5 | `@iyotsuba/schedule-elements` | 项目可以渲染标准 Custom Elements | [Custom Elements](/frameworks/react-elements#原生-html-elements) |
| Flutter | `yotsuba_schedule_kit` | 需要 Flutter 原生手势、布局和 Material 集成 | [Flutter](/frameworks/flutter) |
| 仅做数据计算 | `@iyotsuba/schedule-core` | 不需要界面，只处理学期、冲突、提醒或交换 | [Core API](/api/core) |

## 共同的数据边界

无论使用哪种框架，都建议由宿主维护 `courses`、当前周、天气、日计划和 Today 布局。组件通过事件或回调报告用户意图，不直接写入数据库、状态库或系统能力。

这样可以让 Web 与 Flutter 共享业务语义，同时保留各平台原生的渲染、无障碍和交互体验。

## 微信与小程序环境

微信内置浏览器和普通 H5 页面可以使用 Vue、React 或 Custom Elements。微信小程序原生运行时不支持标准 Custom Elements，因此不属于当前支持范围；使用 uni-app 时，请选择 H5 编译目标。

尚未确定技术栈时，可以先在 [在线演示](https://iyotsuba.top/schedule?preview=website&source=docs) 中确认交互，再从 [5 分钟接入](/guide/getting-started) 开始。
