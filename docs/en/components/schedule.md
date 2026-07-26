# Schedule

`<YsSchedule>` is the core component: top week bar + weekday header + week grid + transitions + gestures + built-in week picker / course detail.

Built-in panels are ready-made yet replaceable: set `weekPicker` / `courseDetail` to `'none'` and take over via events; keep them and fine-tune with slots and `--ys-*` CSS variables.

## Props (excerpt)

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `courses` | `Course[]` | — | Controlled data source |
| `week` | `number` | `1` | `v-model:week` |
| `termStart` | `Date` | — | Monday of week 1; enables dates, today highlight, makeup days |
| `overrides` | `DayOverride[]` | `[]` | Makeup / holiday days |
| `topBar` | `'compact' \| 'standard' \| 'expanded' \| 'none'` | `'standard'` | Three genuinely different top-bar layouts |
| `transition` | `'wave' \| 'slide' \| 'none' \| TransitionSpec` | `'wave'` | Week transition |
| `theme` | `'light' \| 'dark' \| Partial<ThemeTokens>` | `'light'` | Token overrides |
| `guide` | `GuideConfig \| false` | `false` | Three-mode onboarding (tips / spotlight / walkthrough) |
| `weekPicker` / `courseDetail` | `'builtin' \| 'none'` | `'builtin'` | Built-in panels |

Full reference (Chinese): [组件 API](/components/schedule). Events: `update:week`, `week-change`, `course-tap`, `day-tap`, `swipe`, `week-picker-open`, `guide-step`, `guide-finish`, `transition-start/end`. Methods via ref: `setWeek`, `next`, `previous`, `openCourse`, `openWeekPicker`, `startGuide`, `closeSheets`.
