# 框架接入

## Vue 3

直接使用 `@iyotsuba/schedule-vue`，见[Vue 3 接入](/frameworks/vue)。

## React

使用官方类型化绑定 `@iyotsuba/schedule-react`（内部桥接自定义元素，Props / 事件全量 TS 类型）：

```tsx
import { YsSchedule, YsToday } from '@iyotsuba/schedule-react'
import { useState } from 'react'

export function Schedule({ courses }) {
  const [week, setWeek] = useState(1)
  return (
    <YsSchedule
      courses={courses}
      week={week}
      onUpdateWeek={setWeek}
      onCourseTap={(course, stack) => console.log(course, stack)}
      style={{ height: 640 }}
    />
  )
}
```

## uni-app(H5)/ Ionic / 原生 HTML

任何能渲染 DOM 的环境都可以用 `<ys-schedule>` 自定义元素；iife 产物支持 CDN `<script>` 直接引入并自动注册。

## 小程序原生

微信小程序不支持自定义元素,暂不在支持范围;uni-app 编译到 H5 端可用。

Flutter 包、发布状态和跨框架 API 对照分别见 [Flutter 接入](/frameworks/flutter)、[React 与 Elements](/frameworks/react-elements) 和 [版本与发布状态](/guide/release-status)。
