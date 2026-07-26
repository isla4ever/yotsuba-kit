# Today 今日指挥台

`<YsToday>` 与 `<YsSchedule>` 共用同一份 `courses` 数据即天然联动,widget 注册表驱动、顺序显隐全可配。

```vue
<YsToday
  :courses="courses"
  :term-start="termStart"
  :widgets="[
    { id: 'next-course' },
    { id: 'today-timeline' },
    { id: 'week-glance' },
    { id: 'weather', enabled: false }, // 动态开关
    { id: 'my-plans' }, // 自定义 widget
  ]"
  :weather="weatherSnapshot"
  @course-tap="openCourse"
>
  <template #widget-my-plans>
    <h3>我的计划</h3>
    <!-- 任意宿主内容 -->
  </template>
</YsToday>
```

## 内置 widget

| id | 内容 | 跨度 |
| --- | --- | --- |
| `next-course` | 正在上课 / 下一节课(倒计时、地点,点击进详情) | 整行 |
| `today-timeline` | 今日课程时间线(已结束置灰 / 进行中加粗) | 整行 |
| `week-glance` | 当前周 / 今日课程数 / 已完成 | 半行 |
| `weather` | 当前温度 + 今日天况与温区(需传 `weather`) | 半行 |

## 自定义 widget

`widgets` 数组里写任意 id,再提供 `#widget-<id>` 插槽即可插入自己的卡片;**内置 id 的同名插槽可整体替换内置实现**。插槽作用域提供 `{ week, todayCourses, ongoing, upcoming, weather }`,你的自定义卡片可以直接复用引擎算好的数据。

## Props / Events

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `courses` / `termStart` / `overrides` / `courseTimes` / `totalWeeks` | 同 `YsSchedule` | — | 传同一份即与课表联动 |
| `widgets` | `TodayWidgetConfig[]` | 四个内置 | 顺序即展示顺序,`enabled: false` 隐藏 |
| `theme` / `weather` | 同 `YsSchedule` | — | |
| `now` | `Date` | 实时 | 演示/测试可注入固定时刻 |
| `title` | `string` | `'今日'` | |

事件:`course-tap (course)`、`widget-tap (id)`。
