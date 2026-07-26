# 框架接入

## Vue 3

直接使用 `@iyotsuba/schedule-vue`,见[快速开始](/guide/getting-started)。

## React

通过 Web Component 接入:

```tsx
import { useEffect, useRef } from 'react'
import '@iyotsuba/schedule-elements'

export function Schedule({ courses, week, onWeekChange }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    el.courses = courses
    el.week = week
    const handler = e => onWeekChange(e.detail[0])
    el.addEventListener('week-change', handler)
    return () => el.removeEventListener('week-change', handler)
  }, [courses, week])
  return <ys-schedule ref={ref} style={{ height: 640 }} />
}
```

> React 专属适配包 `@iyotsuba/schedule-react` 在 P3 路线中。

## uni-app(H5)/ Ionic / 原生 HTML

任何能渲染 DOM 的环境都可以用 `<ys-schedule>` 自定义元素;iife 产物支持 CDN `<script>` 直接引入并自动注册。

## 小程序原生

微信小程序不支持自定义元素,暂不在支持范围;uni-app 编译到 H5 端可用。
