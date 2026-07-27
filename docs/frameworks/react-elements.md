# React 与 Custom Elements

`@iyotsuba/schedule-elements` 注册 `<ys-schedule>` / `<ys-today>`，可在原生 HTML、uni-app H5、Ionic 等 DOM 环境使用。`@iyotsuba/schedule-react` 在此基础上提供类型化 Props、事件回调和 ref。

## React

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

React 事件采用 `onUpdateWeek`、`onCourseTap`、`onWidgetResize` 等 camelCase Props；可调用的方法与 Vue ref 完全对齐。`YsScheduleElement`、`YsTodayElement`、Props 类型和 Course 类型均从包根导出。

## 原生 HTML / Elements

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

对象 Props 应使用 DOM property 赋值，而不是 HTML attribute 字符串。框架包装会替你完成这一点；原生场景应在 `register()` 后再创建元素。

## 版本边界

当前 NPM 已发布版本并未同步到 `0.6.0`。`0.6.0` 的课程任务、Today 四角缩放、详情空状态等 API 请以 current main 源码和演示验证，待 registry 发布后再把安装版本升级。详见 [版本与发布状态](/guide/release-status)。
