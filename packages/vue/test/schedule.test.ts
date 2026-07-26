import type { Course } from '@yotsuba/schedule-core'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import YsSchedule from '../src/YsSchedule.vue'

const courses: Course[] = [
  { id: 'stable', name: '高等数学', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20 },
  { id: 'week1', name: '体育', weekday: 4, startSection: 1, endSection: 2, startWeek: 1, endWeek: 1 },
]

describe('ysSchedule', () => {
  it('renders courses, inactive badge and top bar', () => {
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 2, reduceMotion: true },
    })
    expect(wrapper.text()).toContain('高等数学')
    expect(wrapper.text()).toContain('非本周')
    expect(wrapper.text()).toContain('第 2 周')
    expect(wrapper.text()).toContain('本学期课表')
  })

  it('hides top bar and weekday bar on demand', () => {
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 1, reduceMotion: true, topBar: 'none', weekdayBar: false },
    })
    expect(wrapper.text()).not.toContain('本学期课表')
    expect(wrapper.find('.ys-schedule__weekday-bar').exists()).toBe(false)
  })

  it('keeps the leaving layer during a wave transition', async () => {
    vi.useFakeTimers()
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 1, reduceMotion: false, transition: 'wave' },
    })
    await wrapper.setProps({ week: 2 })
    await nextTick()
    expect(wrapper.findAll('.ys-schedule__layer')).toHaveLength(2)
    expect(wrapper.emitted('weekChange')).toBeTruthy()
    vi.advanceTimersByTime(600)
    await nextTick()
    expect(wrapper.findAll('.ys-schedule__layer')).toHaveLength(1)
    vi.useRealTimers()
  })

  it('slides the whole page for the slide transition', async () => {
    vi.useFakeTimers()
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 1, reduceMotion: false, transition: 'slide' },
    })
    await wrapper.setProps({ week: 2 })
    await nextTick()
    const entering = wrapper.find('.ys-schedule__layer--current')
    const leaving = wrapper.find('.ys-schedule__layer--leaving')
    expect(entering.attributes('style')).toContain('ys-page-enter')
    expect(entering.attributes('style')).toContain('--ys-from-x: 100%')
    expect(leaving.attributes('style')).toContain('ys-page-leave')
    // 轻量波浪淡入叠加在换页上
    expect(
      entering.find('.ys-schedule__card-slot').attributes('style'),
    ).toContain('ys-cell-stagger')
    vi.advanceTimersByTime(600)
    vi.useRealTimers()
  })

  it('skips the transition when reduceMotion is on', async () => {
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 1, reduceMotion: true },
    })
    await wrapper.setProps({ week: 2 })
    await nextTick()
    expect(wrapper.findAll('.ys-schedule__layer')).toHaveLength(1)
  })

  it('exposes navigation methods that clamp and emit', async () => {
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 1, totalWeeks: 20, reduceMotion: true },
    })
    const vm = wrapper.vm as unknown as { setWeek: (week: number) => void, previous: () => void }
    vm.setWeek(5)
    await nextTick()
    expect(wrapper.emitted('update:week')?.[0]).toEqual([5])
    vm.previous()
    await nextTick()
    expect(wrapper.emitted('update:week')).toHaveLength(1)
  })

  it('emits courseTap with the overlap stack and opens the builtin detail', async () => {
    const overlapping: Course[] = [
      { id: 'a', name: '课程A', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20 },
      { id: 'b', name: '课程B', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20 },
    ]
    const wrapper = mount(YsSchedule, {
      props: { courses: overlapping, week: 1, reduceMotion: true },
    })
    await wrapper.find('.ys-schedule__layer--current .ys-course-card').trigger('click')
    const tap = wrapper.emitted('courseTap')?.[0] as [unknown, unknown[]]
    expect(tap[1]).toHaveLength(2)
    // 内置详情：重叠课先出现选择列表（teleport 到 body）
    await nextTick()
    expect(document.body.textContent).toContain('选择课程')
  })

  it('opens the builtin week picker from the top bar', async () => {
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 1, reduceMotion: true },
    })
    await wrapper.find('.ys-topbar__week').trigger('click')
    expect(wrapper.emitted('weekPickerOpen')).toBeTruthy()
    await nextTick()
    expect(document.body.textContent).toContain('选择教学周')
  })
})
