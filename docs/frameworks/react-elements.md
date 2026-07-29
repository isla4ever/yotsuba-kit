# React 与 Custom Elements

React 项目使用 `@iyotsuba/schedule-react` 获得类型化 Props、事件回调和引用方法。原生 HTML、uni-app H5、Ionic 等 DOM 环境可以直接使用 `@iyotsuba/schedule-elements` 注册的 `<ys-schedule>` 与 `<ys-today>`。

::: info 版本说明
React、Elements 与 Core 当前稳定版均为 `0.7.1`。多个包同时使用时应保持同一版本线。
:::

## React 接入

```bash
pnpm add @iyotsuba/schedule-react@0.7.1
```

```tsx
import { useRef, useState } from 'react'
import { YsSchedule, YsToday, type YsScheduleElement } from '@iyotsuba/schedule-react'

export function SchedulePage() {
  const [week, setWeek] = useState(1)
  const schedule = useRef<YsScheduleElement>(null)

  return (
    <>
      <button onClick={() => schedule.current?.openWeekPicker()}>选择周次</button>
      <YsSchedule
        ref={schedule}
        week={week}
        courses={courses}
        termStart={termStart}
        weather={weatherSnapshot}
        cardEffect="shimmer"
        weatherScene
        onUpdateWeek={setWeek}
        onCourseShare={course => shareCourse(course)}
      />
      <YsToday courses={courses} termStart={termStart} onWidgetsChange={saveWidgets} />
    </>
  )
}
```

React 通过 `week` 与 `onUpdateWeek` 组成受控周次。其他事件使用 `onCourseTap`、`onWidgetResize` 等 camelCase Props；实例方法与 Vue 版本保持一致。`YsScheduleElement`、`YsTodayElement`、Props 类型和 `Course` 类型均从包根导出。

## 原生 HTML / Elements

```bash
pnpm add @iyotsuba/schedule-elements@0.7.1
```

```ts
import { register } from '@iyotsuba/schedule-elements'

register()
const schedule = document.querySelector('ys-schedule')
schedule.courses = courses
schedule.week = 1
schedule.addEventListener('update:week', event => {
  console.log(event.detail)
})
schedule.openCourse('math-01')
```

课程、天气等对象 Props 应通过 DOM property 赋值，不能序列化为 HTML attribute 字符串。原生场景应先调用 `register()`，再创建和配置元素。

## 下一步

| 目标 | 文档 |
| --- | --- |
| 查询 React 事件名称 | [事件](/api/events) |
| 调用周次、详情和布局方法 | [方法](/api/methods) |
| 理解课程与任务字段 | [课程数据](/components/course-data) |
| 查看其他框架的选择建议 | [选择接入方式](/guide/frameworks) |
