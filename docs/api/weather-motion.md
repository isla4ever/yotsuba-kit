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

`WeatherSnapshot` 同时支持当前、逐日和小时级数据：

```ts
const weather: WeatherSnapshot = {
  current: { kind: 'clear', temperatureC: 24, label: '晴' },
  daily: [
    { date: '2026-09-07', kind: 'cloudy', highC: 27, lowC: 19, label: '多云' },
  ],
  hourly: [
    { time: '2026-09-07T08:00', kind: 'clear', temperatureC: 21, label: '晴' },
    { time: '2026-09-07T14:00', kind: 'rain', temperatureC: 24, label: '阵雨' },
  ],
  updatedAt: Date.now(),
}
```

## 课程时段匹配

`YsSchedule` 使用作息表中课程开始节次的时间，在课程日期内选择最近的 `hourly` 点。只有没有小时数据时才回退到 `daily`，因此同一天早课和晚课可以使用不同的天气材质、动态图标与详情温度。周末课程使用完全相同的规则。

课程卡默认只显示局部天气材质；`WeatherCardConfig.glyph` 和 `label` 需要显式开启。非本周课程会压低饱和度和天气层可见度，避免天气颜色破坏状态识别。

## 页面场景与课程光效

- 页面级 `weatherScene` 是低频模糊氛围，适合在应用壳层只渲染一份，使课表、Today 和导航保持连续。
- 课程卡天气材质负责局部太阳光晕、云缘、雨痕、雾层或雪花，不复制完整天气图标。
- `shimmer`、`glow`、`aurora`、`breathe` 等显式 `cardEffect` 会替换课程卡天气材质，避免两套效果互相干扰。
- `reduceMotion` 或系统减少动态效果开启时，循环动画会收敛为静态材质；信息和状态不依赖动画表达。

## 权限边界

`createOpenMeteoProvider` 是按需导入的参考实现，不会自行请求定位。宿主必须先获得用户授权并传入经纬度，同时自行决定缓存、失败回退和刷新时机。只需要模拟展示时，可以直接构造 `WeatherSnapshot`，无需任何微信验证或账号校验。

## API

| API | 用途 |
| --- | --- |
| `createOpenMeteoProvider(options)` | Open-Meteo `WeatherProvider` 参考实现；返回当前、逐日和小时级天气，宿主决定何时定位、请求和缓存 |
| `lightTheme` / `darkTheme` | 默认主题令牌 |
| `tokensToCssVars(tokens)` | 将主题令牌转为 `--ys-*` CSS 变量 |
| `resolvePalette(nameOrColors)` | 解析六套内置或自定义课程色板 |
| `createCourseColorResolver(tokens)` | 按课程名生成稳定颜色 |
| `resolveTransition(nameOrSpec)` | 取得内置或自定义 `TransitionSpec` |
| `validateTransition(spec)` | 在接入前验证自定义换周动画协议 |
| `createGuideMachine(config)` | 创建引导状态机，可给非课表页面复用 |

内置换周过渡包括 `wave`、`slide`、`fade`、`cube`、`drop`、`zoom` 和 `none`。自定义 `TransitionSpec` 可声明进出场关键帧、时长、延迟和稳定课程跳过策略，无需修改组件源码。

[返回 Core API 总览](/api/core)
