# Flutter：yotsuba_schedule_kit

`yotsuba_schedule_kit` 面向需要原生 Flutter 渲染、手势和无障碍语义的移动应用。它与 Web 版本共享课程模型和能力边界，但不依赖特定状态管理、定位、网络、日历或分享插件。

源码、完整应用和只使用公开 API 的 Flutter 演示位于 [isla4ever/yotsuba-kit-flutter](https://github.com/isla4ever/yotsuba-kit-flutter)。

## 安装

```bash
flutter pub add yotsuba_schedule_kit:^0.7.1
```

::: info 版本说明
pub.dev 当前稳定版为 `0.7.1`，与 Web 包共享课程、小时级天气和 Today 信息层级的产品语义。
:::

## 完整课表

```dart
YsSchedule(
  week: week,
  totalWeeks: 20,
  courses: courses,
  termStart: DateTime(2026, 9, 7),
  onWeekChanged: (value) => setState(() => week = value),
  transition: YsTransition.wave,
  headerStyle: YsHeaderStyle.standard,
  density: YsScheduleDensity.rich,
  cardEffect: YsCardEffect.none,
  weatherCardBackground: true,
  weather: weather,
  weatherScene: true,
  detail: const YsCourseDetailConfig(
    hero: YsDetailHero.weather,
    layout: YsDetailLayout.standard,
    emptyText: '暂无信息',
  ),
  sheets: const YsSheetConfig(
    placement: YsSheetPlacement.bottom,
    placements: {YsSheetKind.courseDetail: YsSheetPlacement.right},
    adjustable: true,
  ),
)
```

`YsSchedule` 通过 `onWeekChanged`、`onCourseTap`、`onCourseShare`、`onCourseEdit` 和 `onCourseRemove` 等回调报告用户操作。宿主应用负责更新状态，并决定是否写入日历、发起分享或持久化数据。

## 课程数据与 Today 联动

```dart
final courses = <YsCourse>[
  YsCourse(
    id: 'math',
    name: '高等数学',
    weekday: 1,
    startSection: 1,
    endSection: 2,
    startWeek: 1,
    endWeek: 20,
    books: const [YsCourseBook(title: '高等数学（第八版）', required: true)],
    materialDetails: const [YsCourseMaterial(name: '计算器', kind: YsCourseMaterialKind.device)],
    tasks: const [YsCourseTask(id: 'math-3', title: '完成第三章课后题')],
  ),
]

YsToday(
  courses: courses,
  termStart: DateTime(2026, 9, 7),
  widgets: widgets,
  onWidgetsChanged: saveWidgets,
  onWidgetMove: (id, from, to) => persistMove(id, from, to),
  onWidgetResize: (id, size, corner) => persistSize(id, size, corner),
)
```

`YsTodayWidgetIds` 提供 `nextCourse`、`timeline`、`readiness`、`plans`、`courseTasks`、`weekGlance` 和 `weather`。通过 `customBuilders` 可以注入业务模块；布局编辑状态下支持拖动排序和四角缩放。

## 天气与权限

传入 `YsWeatherSnapshot`，或实现 `YsWeatherProvider`。`hourly` 存在时，课程卡和详情会按课程开始时间选择最近小时点；Today 天气模块也会根据 `1x1 / 1x2 / 2x1 / 2x2` 尺寸分别展示摘要、逐小时列表或温度趋势。定位与网络请求仍由应用主动触发，因此可以自由选择系统定位、学校天气服务或本地缓存，也不会因导入组件包而自动申请权限。

## 下一步

| 目标 | 文档 |
| --- | --- |
| 查看完整 Flutter 示例 | [yotsuba-kit-flutter](https://github.com/isla4ever/yotsuba-kit-flutter) |
| 理解跨端课程字段 | [课程数据](/components/course-data) |
| 设计天气与主题接入 | [天气、主题与动效](/api/weather-motion) |
| 比较 Web 与 Flutter 方案 | [选择接入方式](/guide/frameworks) |
