# Roadmap — 功能全景与优先级

> 原则:**不拆新包**。除框架适配层(vue/react/elements)外,一切新能力进 `schedule-core`(纯逻辑)与 `schedule-vue`(UI);
> 装一个 `@iyotsuba/schedule-vue` 即可用全部三大组件(Schedule / Today / Guide),永远如此。

## 调研基准

- **WakeUp 课表 / 超级课程表**(国内课表 App 事实标准):教务抓取 + 分享口令 + Excel 三路导入、上课前 N 分钟提醒、桌面小组件(格子高度/透明度/字号/边框全可调)、背景图 + 贴纸深度自定义、多课表切换、导出系统日历、多端同步。
- **FullCalendar / DayPilot**(通用日程组件事实标准):多视图切换(日/周/月)、拖拽新增/移动/缩放事件、ICS/Google Calendar 集成、主题设计器。
- 我们的差异位:**课表领域语义 + 动效品质 + 开箱三组件**,通用日程库不做学期语义,课表 App 不做可嵌入组件。

## P5(下一步,按优先级)

| # | 能力 | 放置 | 说明 |
| --- | --- | --- | --- |
| 1 | **编辑模式** | vue | 对齐微信版:长按空白格拖选节次 → 内置课程表单 sheet(名称/地点/周次/单双周/颜色)、编辑、删除;`editable` prop + `course-add/update/remove` 事件;内置表单照例可关可换 |
| 2 | **上课提醒引擎** | core | `computeReminders(courses, {leadMinutes})` 纯函数产出提醒时间表 + `Notification`/宿主推送参考实现;WakeUp 级核心刚需 |
| 3 | **导入导出适配器族** | core | 已有正方(zhengfang);新增:课表分享码(压缩 JSON + 二维码文本)、Excel/CSV、**ICS 导出**(对齐 FullCalendar 生态与系统日历) |
| 4 | **多课表/多学期** | core+vue | `createScheduleStore` 多 profile(学期)切换与持久化适配器 |
| 5 | **背景与皮肤层** | vue | 背景图 + 卡片毛玻璃/透明度令牌(超级课程表人群的深度自定义)、`--ys-card-opacity` 等 tokens 扩展 |

## P6(增强)

| 能力 | 说明 |
| --- | --- |
| 手势跟手 scrub | 手指拖动实时驱动换周进度,松手补完(wave/slide 双支持) |
| 日视图 | Today 时间线升级为完整日视图,周/日切换 |
| `YsScheduleMini` 缩略渲染 | 只读紧凑模式,供宿主 App 桌面小组件 / 分享卡使用 |
| 分享图导出 | `exportImage()`(html-to-image 可选依赖),对齐"晒课表"场景 |
| a11y 深化 | 键盘周导航、焦点循环、屏幕阅读器周摘要 |

## 明确不做(边界)

拍照搜题、空教室查询、成绩/绩点、社交——App 层业务,不属于组件库;宿主可用 Today 的自定义 widget 插槽自行承载。
