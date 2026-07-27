# Flutter：yotsuba_schedule_kit

Flutter 包与 Web 共享产品能力边界，但保留 Flutter 原生 Material、手势、语义和布局实现。包不依赖状态管理、定位、网络、日历或分享插件。

源码、完整应用和只使用公开 API 的 Flutter 演示位于 [isla4ever/yotsuba-kit-flutter](https://github.com/isla4ever/yotsuba-kit-flutter)。

## 安装

```bash
flutter pub add yotsuba_schedule_kit
```

pub.dev 当前稳定版是 `0.5.0`；工作区中的 `0.6.0` 为待发布源码。发布状态见 [版本与发布状态](/guide/release-status)。

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
  cardEffect: YsCardEffect.shimmer,
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

`YsSchedule` 只在 `onWeekChanged`、`onCourseTap`、`onCourseShare`、`onCourseEdit`、`onCourseRemove` 等回调中报告用户意图。日历写入、分享和持久化始终属于宿主应用。

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

`YsTodayWidgetIds` 提供 `nextCourse`、`timeline`、`readiness`、`plans`、`courseTasks`、`weekGlance` 和 `weather`。通过 `customBuilders` 注入任意业务卡片，长按后可拖动整卡并从四角缩放。

## 天气与权限

传入 `YsWeatherSnapshot`，或实现 `YsWeatherProvider`；定位与网络请求仍由应用自己触发和处理。这样使用者可以选择系统定位、学校天气服务或本地缓存，而不会因导入组件包被动申请权限。
