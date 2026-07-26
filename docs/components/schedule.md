# Schedule 课表

`<YsSchedule>` 是核心课表组件:周视图网格 + 换周过渡 + 表头 + 手势。

## Props

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `courses` | `Course[]` | — | 课程数据(受控) |
| `week` | `number` | `1` | 当前周,支持 `v-model:week` |
| `totalWeeks` | `number` | `20` | 总周数(setWeek 自动 clamp) |
| `termStart` | `Date` | — | 第 1 周周一;传入后表头显示日期、今日高亮、补班生效 |
| `overrides` | `DayOverride[]` | `[]` | 调休(makeup)/假日(holiday) |
| `courseTimes` | `CourseTime[] \| 'standard'` | `'standard'` | 作息表 |
| `visibleDays` | `5 \| 6 \| 7` | `7` | 显示天数 |
| `rowHeight` | `number` | `56` | 节次行高(px) |
| `breakAfterSection` | `number` | `4` | 午休分隔位置 |
| `header` | `'compact' \| 'standard' \| 'expanded' \| 'none'` | `'standard'` | 表头三档高度(44 / 66 / 92px) |
| `transition` | `'wave' \| 'slide' \| 'fade' \| 'none' \| TransitionSpec` | `'wave'` | 换周过渡 |
| `theme` | `'light' \| 'dark' \| Partial<ThemeTokens>` | `'light'` | 主题令牌 |
| `weather` | `WeatherSnapshot \| null` | `null` | 天气数据(expanded 表头展示) |
| `reduceMotion` | `boolean \| 'auto'` | `'auto'` | 减弱动效;auto 跟随系统 |
| `swipeable` | `boolean` | `true` | 触摸滑动换周 |
| `locale` | `{ weekdays?, inactiveBadge?, breakLabel? }` | — | 文案定制 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:week` | `(week)` | v-model 配套 |
| `week-change` | `(week, previous)` | 周变化(含滑动/外部 setWeek) |
| `course-tap` | `(course, stack)` | 点课;stack 为该格重叠组全部课程 |
| `day-tap` | `(weekday, date)` | 点表头某天 |
| `swipe` | `(direction)` | 滑动触发翻周(1 下一周 / -1 上一周) |
| `transition-start` / `transition-end` | `(spec)` | 过渡生命周期 |

## Methods(ref 暴露)

| 方法 | 说明 |
| --- | --- |
| `setWeek(week)` | 跳转周(自动 clamp,带过渡) |
| `getWeek()` | 当前周 |
| `next()` / `previous()` | 前后翻周 |

## Slots

| 插槽 | 作用域 | 说明 |
| --- | --- | --- |
| `course` | `{ course, active, color }` | 整体替换课程卡 |
| `day` | `{ weekday, label, date, weather }` | 整体替换表头单日 |
