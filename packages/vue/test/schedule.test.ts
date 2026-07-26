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
  it('renders courses and inactive badge', () => {
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 2, reduceMotion: true },
    })
    expect(wrapper.text()).toContain('高等数学')
    expect(wrapper.text()).toContain('非本周')
  })

  it('keeps the leaving layer during a wave transition', async () => {
    vi.useFakeTimers()
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 1, reduceMotion: false, transition: 'wave' },
    })
    await wrapper.setProps({ week: 2 })
    await nextTick()
    // 波浪期间：旧层 + 新层同时存在
    expect(wrapper.findAll('.ys-schedule__layer')).toHaveLength(2)
    expect(wrapper.emitted('weekChange')).toBeTruthy()
    vi.advanceTimersByTime(600)
    await nextTick()
    expect(wrapper.findAll('.ys-schedule__layer')).toHaveLength(1)
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
    // week prop 仍是 1（受控），previous 应 clamp 到 1 → 不触发新事件
    expect(wrapper.emitted('update:week')).toHaveLength(1)
  })

  it('emits courseTap with the overlap stack', async () => {
    const overlapping: Course[] = [
      { id: 'a', name: 'A', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20 },
      { id: 'b', name: 'B', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20 },
    ]
    const wrapper = mount(YsSchedule, {
      props: { courses: overlapping, week: 1, reduceMotion: true },
    })
    await wrapper.find('.ys-schedule__layer--current .ys-schedule__card-slot').trigger('click')
    const tap = wrapper.emitted('courseTap')?.[0] as [unknown, unknown[]]
    expect(tap[1]).toHaveLength(2)
  })
})
