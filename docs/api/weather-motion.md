# 天气、主题与动效

天气、主题和动效均通过明确的数据或配置传入。Core 负责将它们解析为跨框架可复用的令牌与协议；定位授权、天气请求和缓存策略由宿主控制。

```ts
import {
  createCourseColorResolver,
  darkTheme,
  lightTheme,
  resolvePalette,
  resolveTransition,
  validateTransition,
} from '@iyotsuba/schedule-core'
import { createOpenMeteoProvider } from '@iyotsuba/schedule-core/weather/open-meteo'

const provider = createOpenMeteoProvider({ latitude, longitude })
const weather = await provider.getSnapshot()
```

## API

| API | 用途 |
| --- | --- |
| `createOpenMeteoProvider(options)` | Open-Meteo `WeatherProvider` 参考实现；宿主决定何时定位、请求和缓存 |
| `lightTheme` / `darkTheme` | 默认主题令牌 |
| `tokensToCssVars(tokens)` | 将主题令牌转为 `--ys-*` CSS 变量 |
| `resolvePalette(nameOrColors)` | 解析六套内置或自定义课程色板 |
| `createCourseColorResolver(tokens)` | 按课程名生成稳定颜色 |
| `resolveTransition(nameOrSpec)` | 取得内置或自定义 `TransitionSpec` |
| `validateTransition(spec)` | 在接入前验证自定义换周动画协议 |
| `createGuideMachine(config)` | 创建引导状态机，可给非课表页面复用 |

内置换周过渡包括 `wave`、`slide`、`fade`、`cube`、`drop`、`zoom` 和 `none`。自定义 `TransitionSpec` 可声明进出场关键帧、时长、延迟和稳定课程跳过策略，无需修改组件源码。

[返回 Core API 总览](/api/core)
