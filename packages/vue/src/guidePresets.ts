import type { GuideStep } from '@iyotsuba/schedule-core'

/**
 * 课表官方引导剧本。锚点为组件内置 data-ys 语义锚：
 * grid / top-bar-week / weekday-bar / course-card，宿主也可换成任意 CSS 选择器。
 * walkthrough 模式下 expect 生效（真实完成动作才前进）；tips/spotlight 忽略 expect。
 */
export const defaultScheduleGuideSteps: GuideStep[] = [
  {
    id: 'swipe-week',
    target: 'grid',
    title: '滑动换周',
    body: '在课表上左右滑动即可切换教学周,动画丝滑不打断。',
    expect: 'swipe-left',
    hintAfterMs: 2500,
  },
  {
    id: 'course-detail',
    target: 'course-card',
    title: '查看课程详情',
    body: '点击任意课程卡片,查看时间、地点、周次;重叠课程会先让你选择。',
    expect: 'tap',
  },
  {
    id: 'week-picker',
    target: 'top-bar-week',
    title: '快速跳转周',
    body: '点击顶部周数,可打开周选择器直接跳到任意一周。',
    expect: 'tap',
  },
]
