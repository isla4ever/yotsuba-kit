import type { Course } from '@iyotsuba/schedule-core'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { defaultScheduleGuideSteps } from '../src/guidePresets'
import YsSchedule from '../src/YsSchedule.vue'
import YsToday from '../src/YsToday.vue'

// 2026-07-20 是周一；构造“现在”为第 1 周周一 09:10（第 1 节课中）
const termStart = new Date(2026, 6, 20)
const monday0910 = new Date(2026, 6, 20, 9, 10)

const courses: Course[] = [
  { id: 'math', name: '高等数学', location: '教1-201', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20 },
  { id: 'ds', name: '数据结构', weekday: 1, startSection: 5, endSection: 6, startWeek: 1, endWeek: 20 },
  { id: 'tue', name: '大学英语', weekday: 2, startSection: 3, endSection: 4, startWeek: 1, endWeek: 20 },
]

describe('ysToday', () => {
  it('shows ongoing course, timeline and stats for today', () => {
    const wrapper = mount(YsToday, {
      props: { courses, termStart, now: monday0910 },
    })
    expect(wrapper.text()).toContain('正在上课')
    expect(wrapper.text()).toContain('高等数学')
    expect(wrapper.text()).toContain('今日课程 · 2 节')
    // 周二的课不出现
    expect(wrapper.text()).not.toContain('大学英语')
    expect(wrapper.text()).toContain('第1周')
  })

  it('respects widget config order and custom widget slots', () => {
    const wrapper = mount(YsToday, {
      props: {
        courses,
        termStart,
        now: monday0910,
        widgets: [{ id: 'week-glance' }, { id: 'my-widget' }, { id: 'weather', enabled: false }],
      },
      slots: {
        'widget-my-widget': '<p class="custom-widget">自定义内容</p>',
      },
    })
    const widgets = wrapper.findAll('.ys-today__widget')
    expect(widgets).toHaveLength(2)
    expect(wrapper.find('.custom-widget').text()).toBe('自定义内容')
    expect(wrapper.text()).not.toContain('WeatherProvider')
  })
})

describe('guide integration', () => {
  it('starts a walkthrough and advances on the real swipe action', async () => {
    const wrapper = mount(YsSchedule, {
      props: {
        courses,
        week: 1,
        termStart,
        reduceMotion: true,
        guide: { mode: 'walkthrough' as const, steps: defaultScheduleGuideSteps },
      },
      attachTo: document.body,
    })
    const vm = wrapper.vm as unknown as { startGuide: () => void }
    vm.startGuide()
    await nextTick()
    expect(document.body.textContent).toContain('滑动换周')
    expect(document.body.textContent).toContain('1 / 3')
    expect(wrapper.emitted('guideStep')).toBeTruthy()

    // 桥接真实滑动动作 → 前进到第 2 步
    const guide = wrapper.findComponent({ name: 'YsGuide' })
    ;(guide.vm as unknown as { notify: (a: string) => void }).notify('swipe-left')
    await nextTick()
    expect(document.body.textContent).toContain('查看课程详情')
    wrapper.unmount()
  })

  it('spotlight mode advances with buttons and finishes', async () => {
    const wrapper = mount(YsSchedule, {
      props: {
        courses,
        week: 1,
        termStart,
        reduceMotion: true,
        guide: { mode: 'spotlight' as const, steps: defaultScheduleGuideSteps.slice(0, 2) },
      },
      attachTo: document.body,
    })
    ;(wrapper.vm as unknown as { startGuide: () => void }).startGuide()
    await nextTick()
    const nextBtn = () =>
      Array.from(document.querySelectorAll('.ys-guide__btn--primary')).at(-1) as HTMLButtonElement
    nextBtn().click()
    await nextTick()
    expect(document.body.textContent).toContain('查看课程详情')
    nextBtn().click()
    await nextTick()
    expect(wrapper.emitted('guideFinish')).toBeTruthy()
    wrapper.unmount()
  })
})
