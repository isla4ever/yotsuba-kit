# 天气、主题与动效

天气是宿主注入的受控数据；主题和动效则由 Core 解析为跨框架可复用的令牌与协议。组件不会擅自请求定位权限，也不会在后台刷新天气。

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
| `createOpenMeteoProvider(options)` | 可选的 Open-Meteo WeatherProvider 参考实现；宿主仍决定何时定位、请求和缓存 |
| `lightTheme` / `darkTheme` | 默认主题令牌 |
| `tokensToCssVars(tokens)` | 将主题令牌转为 `--ys-*` CSS 变量 |
| `resolvePalette(nameOrColors)` | 解析六套内置或自定义课程色板 |
| `createCourseColorResolver(tokens)` | 按课程名生成稳定颜色 |
| `resolveTransition(nameOrSpec)` | 取得内置或自定义 `TransitionSpec` |
| `validateTransition(spec)` | 在接入前验证自定义换周动画协议 |
| `createGuideMachine(config)` | 创建引导状态机，可给非课表页面复用 |

内置转换包括 `wave`、`slide`、`fade`、`cube`、`drop`、`zoom` 和 `none`。自定义 `TransitionSpec` 描述进出场关键帧、时长、延迟和稳定格跳过策略，不需要 fork 组件。

[返回 Core API 总览](/api/core)
