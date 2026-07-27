# 插槽

插槽用于替换局部界面，同时保留组件的数据计算和交互协议。即使自定义课程卡、详情字段或 Today 模块，周次、重叠、天气和布局数据仍由组件提供。

当只需要调整颜色、间距或字体时，优先使用[主题与品牌](/guide/theming)；只有结构和内容需要改变时再使用插槽。

## YsSchedule

| 插槽 | 作用域 | 用途 |
| --- | --- | --- |
| `top-bar` | `{ week, totalWeeks, openWeekPicker }` | 完整替换顶部周次栏 |
| `top-bar-tools` | — | 在内置顶部栏右侧放入宿主操作 |
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

使用 `#widget-<id>` 注册或替换模块。自定义 id 会创建新的业务模块；内置 id 会替换对应的默认内容。

| 作用域 | 含义 |
| --- | --- |
| `week` | 当前学期周次 |
| `todayCourses` | 今日生效课程 |
| `ongoing` / `upcoming` | 正在上课 / 下一节课 |
| `weather` | 当前日天气数据 |
| `readiness` | 下一节课教材与携带物 |
| `courseTasks` | 今日未完成课程任务 |
| `size` | 当前模块的网格尺寸 |
| `layout` | 归一化后的 `{ columns, rows }`，便于按 `1x1 / 1x2 / 2x1 / 2x2` 响应式展示内容 |
| `arranging` | 是否正在编辑布局 |
| `resizing` | 当前模块是否正在通过四角控点缩放 |

```vue
<YsToday :courses="courses" :term-start="termStart" :widgets="[{ id: 'announcements' }]">
  <template #widget-announcements="{ arranging, layout }">
    <h3>教务通知</h3>
    <NoticeChart v-if="layout.columns === 2 && layout.rows === 2" />
    <p v-else>{{ arranging ? '拖动调整位置' : latestNotice }}</p>
  </template>
</YsToday>
```
