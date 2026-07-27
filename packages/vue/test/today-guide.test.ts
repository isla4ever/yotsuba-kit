import type { Course } from '@iyotsuba/schedule-core'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
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
        'widget-my-widget': ({ size, layout, resizing }: {
          size: string
          layout: { columns: number, rows: number }
          resizing: boolean
        }) => h('p', {
          class: 'custom-widget',
          'data-size': size,
          'data-layout': `${layout.columns}x${layout.rows}`,
          'data-resizing': `${resizing}`,
        }, '自定义内容'),
      },
    })
    const widgets = wrapper.findAll('.ys-today__widget')
    expect(widgets).toHaveLength(2)
    expect(wrapper.find('.custom-widget').text()).toBe('自定义内容')
    expect(wrapper.find('.custom-widget').attributes('data-size')).toBe('2x1')
    expect(wrapper.find('.custom-widget').attributes('data-layout')).toBe('2x1')
    expect(wrapper.find('.custom-widget').attributes('data-resizing')).toBe('false')
    expect(wrapper.text()).not.toContain('WeatherProvider')
  })

  it('adapts the weekly overview content to the selected size', async () => {
    const wrapper = mount(YsToday, {
      props: {
        courses,
        termStart,
        now: monday0910,
        widgets: [{ id: 'week-glance', size: '2x2' }],
      },
    })
    expect(wrapper.find('.ys-today__week-chart').exists()).toBe(true)
    expect(wrapper.findAll('.ys-today__week-bar')).toHaveLength(7)
    expect(wrapper.text()).toContain('本周共 3 个课程块')

    await wrapper.setProps({ widgets: [{ id: 'week-glance', size: '1x1' }] })
    await nextTick()
    expect(wrapper.find('.ys-today__week-chart').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('本周共 3 个课程块')
  })

  it('supports mobile arrangement, four-corner resize, host moves, and reset', async () => {
    vi.useFakeTimers()
    const wrapper = mount(YsToday, {
      props: {
        courses,
        termStart,
        now: monday0910,
        widgets: [{ id: 'next-course' }, { id: 'weather' }],
      },
    })
    const first = wrapper.find('[data-widget="next-course"]')
    await first.trigger('pointerdown', { button: 0, clientX: 10, clientY: 10 })
    vi.advanceTimersByTime(500)
    await nextTick()
    expect(wrapper.find('.ys-today').classes()).toContain('is-arranging')
    expect(wrapper.findAll('.ys-today__widget-controls')).toHaveLength(0)
    expect(wrapper.findAll('.ys-today__resize-handle')).toHaveLength(4)
    expect(wrapper.findAll('[aria-label*="缩放next-course"]')).toHaveLength(4)
    expect(wrapper.findAll('[aria-label*="缩放weather"]')).toHaveLength(0)

    const resize = wrapper.find('[aria-label="从bottom-right缩放next-course"]')
    await resize.trigger('pointerdown', { button: 0, clientX: 0, clientY: 0, pointerId: 1 })
    await resize.trigger('pointermove', { clientX: 90, clientY: 90, pointerId: 1 })
    await resize.trigger('pointerup', { clientX: 90, clientY: 90, pointerId: 1 })
    expect(wrapper.emitted('update:widgets')?.at(-1)?.[0]).toMatchObject([
      { id: 'next-course', size: '2x2' },
      { id: 'weather', size: '1x1' },
    ])
    expect(wrapper.emitted('widgetResize')?.at(-1)).toEqual(['next-course', '2x2', 'bottom-right'])

    const second = wrapper.find('[data-widget="weather"]')
    await second.trigger('pointerdown', { button: 0, clientX: 10, clientY: 10, pointerId: 2 })
    await second.trigger('pointerup', { clientX: 10, clientY: 10, pointerId: 2 })
    expect(wrapper.findAll('.ys-today__resize-handle')).toHaveLength(4)
    expect(wrapper.findAll('[aria-label*="缩放next-course"]')).toHaveLength(0)
    expect(wrapper.findAll('[aria-label*="缩放weather"]')).toHaveLength(4)

    ;(wrapper.vm as unknown as { moveWidget: (id: string, offset: -1 | 1) => void })
      .moveWidget('next-course', 1)
    expect(wrapper.emitted('layoutChange')?.at(-1)?.[0]).toMatchObject([
      { id: 'weather' },
      { id: 'next-course' },
    ])
    expect(wrapper.emitted('widgetMove')?.at(-1)).toEqual(['next-course', 0, 1])

    ;(wrapper.vm as unknown as { layoutReset: () => void }).layoutReset()
    expect(wrapper.emitted('layoutChange')?.at(-1)?.[0]).toMatchObject([
      { id: 'next-course', size: '2x1' },
      { id: 'weather', size: '1x1' },
    ])
    wrapper.unmount()
    vi.useRealTimers()
  })

  it('aggregates books and structured materials and renders weather motion by default', () => {
    const wrapper = mount(YsToday, {
      props: {
        courses: [{
          ...courses[0]!,
          books: [{ title: '高等数学（第八版）' }],
          materials: [{ name: '计算器', kind: 'device' }],
          tasks: [{ id: 'task-1', title: '完成第三章习题' }],
        }],
        termStart,
        now: monday0910,
        weather: {
          current: { kind: 'rain', temperatureC: 27 },
          daily: [{ date: '2026-07-20', kind: 'rain', lowC: 24, highC: 30 }],
          updatedAt: Date.now(),
        },
      },
    })
    expect(wrapper.text()).toContain('高等数学（第八版）、计算器')
    expect(wrapper.text()).toContain('完成第三章习题')
    expect(wrapper.find('.ys-today__weather-scene').exists()).toBe(true)
    expect(wrapper.find('.ys-weather-glyph').exists()).toBe(true)
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
