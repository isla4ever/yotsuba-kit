# 插槽

插槽用于替换视图，不改变 core 行为。即使提供完整自定义课程卡、详情字段或 Today widget，周次、重叠、天气、拖动排版等数据仍由组件计算。

## YsSchedule

| 插槽 | 作用域 | 用途 |
| --- | --- | --- |
| `top-bar` | `{ week, totalWeeks, openWeekPicker }` | 完整替换顶部周 Header |
| `top-bar-tools` | — | 在内置 Header 右侧放入宿主工具 |
| `day` | `{ weekday, label, date }` | 替换单个日期表头 |
| `course` | `{ course, active, color }` | 替换课程卡 |
| `detail-field` | `{ field, label, course, emptyText }` | 逐字段替换详情内容 |
| `detail-extra` | `{ course }` | 在详情字段后追加内容 |
| `detail-actions` | `{ course, close }` | 替换详情底部动作区 |

```vue
<YsSchedule :courses="courses" :term-start="termStart">
  <template #top-bar-tools>
    <button type="button" @click="syncCalendar">同步日历</button>
  </template>

  <template #detail-field="{ field, label, course, emptyText }">
    <MyDetailField :field="field" :label="label" :course="course" :empty-text="emptyText" />
  </template>
</YsSchedule>
```

## YsToday

使用 `#widget-<id>`。未知 id 可创建业务卡片，内置 id 可整体替换默认卡片：

| 作用域 | 含义 |
| --- | --- |
| `week` | 当前学期周次 |
| `todayCourses` | 今日生效课程 |
| `ongoing` / `upcoming` | 正在上课 / 下一节课 |
| `weather` | 当前日天气数据 |
| `readiness` | 下一节课教材与携带物 |
| `courseTasks` | 今日未完成课程任务 |
| `size` | 当前 widget 网格尺寸 |
| `layout` | 归一化后的 `{ columns, rows }`，便于按 `1x1 / 1x2 / 2x1 / 2x2` 响应式展示内容 |
| `arranging` | 是否正在编辑布局 |
| `resizing` | 当前 widget 是否正在被四角控点缩放 |

```vue
<YsToday :courses="courses" :term-start="termStart" :widgets="[{ id: 'announcements' }]">
  <template #widget-announcements="{ arranging, layout }">
    <h3>教务通知</h3>
    <NoticeChart v-if="layout.columns === 2 && layout.rows === 2" />
    <p v-else>{{ arranging ? '拖动调整位置' : latestNotice }}</p>
  </template>
</YsToday>
```
