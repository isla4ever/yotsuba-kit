# Yotsuba Schedule Kit

高度可配置的开源课表组件库。中国高校学期语义(单双周 / 调休补班 / 重叠课)开箱即用,
换周动画可插拔(招牌 wave 波浪覆盖 / slide / fade / 自定义 TransitionSpec),
主题令牌体系,框架无关。

| 包 | 说明 |
| --- | --- |
| [`@yotsuba/schedule-core`](packages/core) | 零依赖 TS:学期引擎、过渡协议、主题令牌、天气/引导协议 |
| [`@yotsuba/schedule-vue`](packages/vue) | Vue 3 组件 `<YsSchedule>` |
| [`@yotsuba/schedule-elements`](packages/elements) | `<ys-schedule>` 自定义元素(React / uni-app H5 / 原生 HTML) |

文档:https://isla4ever.github.io/yotsuba-kit/(建设中)

## 开发

```bash
pnpm install
pnpm build        # 构建全部包
pnpm test         # 全部测试
pnpm docs:dev     # 本地文档站
```

## 路线图

- **P1(当前)** core + Vue(wave/slide/fade 过渡、三档表头、天气协议)+ 文档骨架
- **P2** 引导三模式(tips / spotlight / walkthrough)、`<YsToday>` widget 系统、文档站上线 + 动效演示视频
- **P3** `@yotsuba/schedule-react`、Flutter 版发布至 pub.dev、英文文档

## License

MIT
