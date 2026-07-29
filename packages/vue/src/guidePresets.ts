import type { GuideStep } from '@iyotsuba/schedule-core'

/**
 * 课表官方引导剧本。锚点为组件内置 data-ys 语义锚：
 * schedule-overview / grid / time-axis / top-bar-week / weekday-bar / course-card，
 * 宿主也可换成任意 CSS 选择器。
 * walkthrough 模式下 expect 生效（真实完成动作才前进）；tips/spotlight 忽略 expect。
 */
export const defaultScheduleGuideSteps: GuideStep[] = [
  {
    id: 'schedule-overview',
    target: 'schedule-overview',
    title: '一周课程，一眼看清',
    body: '课程、周次、当天安排与分时天气都在这张课表里保持联动。',
  },
  {
    id: 'week-picker',
    target: 'top-bar-week',
    title: '定位教学周',
    body: '这里显示当前教学周，点按后可以快速跳转到任意周次。',
  },
  {
    id: 'weekday-context',
    target: 'weekday-bar',
    title: '日期与天气同屏',
    body: '星期栏会对齐实际日期；丰富模式下还会补充每天的天气信息。',
  },
  {
    id: 'time-axis',
    target: 'time-axis',
    title: '时间轴保持参照',
    body: '节次与上下课时间始终固定在左侧，浏览全天课程时不会失去位置感。',
  },
  {
    id: 'swipe-week',
    target: 'grid',
    title: '轻扫切换周次',
    body: '在课表区域左右轻扫即可换周，课程会沿当前动画方向自然过渡。',
    expect: 'swipe-left',
    hintAfterMs: 2600,
  },
  {
    id: 'course-detail',
    target: 'course-card',
    title: '课程与分时天气',
    body: '课程卡会按上课时段匹配天气；点按课程可查看地点、资料、任务与详细预报。',
  },
]

/** 今日模块官方引导剧本；隐藏的 widget 会由引导层自动跳过。 */
export const defaultTodayGuideSteps: GuideStep[] = [
  {
    id: 'today-overview',
    target: 'today-head',
    title: '欢迎来到今日',
    body: '这里把当前课程、天气、任务和计划整理成一张随时可扫读的看板。',
  },
  {
    id: 'today-next-course',
    target: 'today-next-course',
    title: '先看眼前这一节',
    body: '下一节课程会显示时间、地点和倒计时；上课后会自动切换为进行中。',
  },
  {
    id: 'today-weather',
    target: 'today-weather',
    title: '天气随时间变化',
    body: '天气组件会按面板尺寸展示当前状况、逐时变化和温度趋势。',
  },
  {
    id: 'today-timeline',
    target: 'today-timeline',
    title: '沿时间线安排一天',
    body: '今日课程按时间排序，已结束、进行中和待开始状态清晰分开。',
  },
  {
    id: 'today-readiness',
    target: 'today-readiness',
    title: '出门前检查携带物',
    body: '教材、电脑和实验用品会按当天课程自动汇总，减少临时遗漏。',
  },
  {
    id: 'today-tasks',
    target: 'today-tasks',
    title: '课程任务集中处理',
    body: '与今天课程相关的作业集中展示，待完成内容优先出现在视线内。',
  },
  {
    id: 'today-plans',
    target: 'today-plans',
    title: '课程之外也有计划',
    body: '复习、提交和会议等个人安排可以与课程节奏放在同一张看板里。',
  },
  {
    id: 'today-arrange',
    target: 'today-arrange',
    title: '按你的节奏重新排布',
    body: '进入布局模式后，可以拖动组件排序，并从四角调整每块信息的尺寸。',
  },
]
