import type { Course } from '@iyotsuba/schedule-core'
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
    expect(entering.attributes('style')).toContain('ys-layer-in')
    expect(entering.attributes('style')).toContain('translateX(100%)')
    expect(leaving.attributes('style')).toContain('ys-layer-out')
    // 轻量波浪淡入叠加在换页上
    expect(
      entering.find('.ys-schedule__card-slot').attributes('style'),
    ).toContain('ys-cell-stagger')
    vi.advanceTimersByTime(600)
    vi.useRealTimers()
  })

  it('cube transition rotates layers with a board perspective', async () => {
    vi.useFakeTimers()
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 2, reduceMotion: false, transition: 'cube' },
    })
    await wrapper.setProps({ week: 1 }) // 上一周:方向镜像
    await nextTick()
    expect(wrapper.find('.ys-schedule__board').attributes('style')).toContain('perspective: 1200px')
    const entering = wrapper.find('.ys-schedule__layer--current')
    const leaving = wrapper.find('.ys-schedule__layer--leaving')
    expect(entering.attributes('style')).toContain('rotateY(-90deg)')
    expect(entering.attributes('style')).toContain('translateX(-100%)')
    expect(entering.attributes('style')).toContain('transform-origin: right center')
    expect(leaving.attributes('style')).toContain('--ys-l-to-o: 0.02')
    expect(leaving.attributes('style')).toContain('z-index: 3')
    vi.advanceTimersByTime(590)
    await nextTick()
    expect(wrapper.findAll('.ys-schedule__layer')).toHaveLength(2)
    vi.advanceTimersByTime(100)
    vi.useRealTimers()
  })

  it('zoom transition mirrors scale around 1 by direction', async () => {
    vi.useFakeTimers()
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 1, reduceMotion: false, transition: 'zoom' },
    })
    await wrapper.setProps({ week: 2 })
    await nextTick()
    const entering = wrapper.find('.ys-schedule__layer--current')
    const leaving = wrapper.find('.ys-schedule__layer--leaving')
    expect(entering.attributes('style')).toContain('scale(0.94)')
    expect(leaving.attributes('style')).toContain('ys-layer-out 480ms')
    expect(leaving.attributes('style')).toContain('z-index: 3')
    vi.advanceTimersByTime(600)
    await wrapper.setProps({ week: 1 }) // 反向 → 1.06
    await nextTick()
    expect(wrapper.find('.ys-schedule__layer--current').attributes('style')).toContain('scale(1.06')
    vi.advanceTimersByTime(600)
    vi.useRealTimers()
  })

  it('drop transition falls per-cell and keeps stable cells still', async () => {
    vi.useFakeTimers()
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 1, reduceMotion: false, transition: 'drop' },
    })
    await wrapper.setProps({ week: 2 })
    await nextTick()
    const slots = wrapper.findAll('.ys-schedule__layer--current .ys-schedule__card-slot')
    const styles = slots.map(slot => slot.attributes('style') ?? '')
    // 稳定卡(高等数学 两周不变)无动画;变化卡(体育→非本周)带坠落进场
    expect(styles.some(style => !style.includes('animation'))).toBe(true)
    expect(styles.some(style => style.includes('ys-cell-in') && style.includes('translateY(-24px)'))).toBe(true)
    vi.advanceTimersByTime(800)
    vi.useRealTimers()
  })

  it('applies palette presets and density classes', () => {
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 1, reduceMotion: true, palette: 'cyber', density: 'minimal' },
    })
    expect(wrapper.classes()).toContain('ys-density-minimal')
    // cyber 首色应用到首个课程卡
    expect(wrapper.find('.ys-course-card').attributes('style')).toContain('#d41193')
    // minimal 下不渲染周数标签
    expect(wrapper.find('.ys-course-card__weeks').exists()).toBe(false)
  })

  it('keeps weather glyphs while making weather backgrounds and card effects exclusive', async () => {
    const wrapper = mount(YsSchedule, {
      props: {
        courses,
        week: 1,
        termStart: new Date(2026, 6, 20),
        reduceMotion: true,
        weather: {
          current: { kind: 'heavy-rain', temperatureC: 24 },
          daily: [{ date: '2026-07-20', kind: 'heavy-rain', lowC: 21, highC: 26 }],
          updatedAt: Date.now(),
        },
      },
    })
    expect(wrapper.find('.ys-course-card').attributes('data-weather')).toBe('heavy-rain')
    expect(wrapper.find('.ys-course-card__weather-bg').exists()).toBe(true)
    expect(wrapper.find('.ys-weather-glyph').exists()).toBe(true)

    await wrapper.setProps({ cardEffect: 'glow' })
    expect(wrapper.attributes('data-ys-effect')).toBe('glow')
    expect(wrapper.find('.ys-course-card__weather-bg').exists()).toBe(false)
    expect(wrapper.find('.ys-weather-glyph').exists()).toBe(true)
  })

  it('pauses card effects while transitioning', async () => {
    vi.useFakeTimers()
    const wrapper = mount(YsSchedule, {
      props: { courses, week: 1, reduceMotion: false, cardEffect: 'shimmer' },
    })
    expect(wrapper.attributes('data-ys-effect')).toBe('shimmer')
    await wrapper.setProps({ week: 2 })
    await nextTick()
    expect(wrapper.attributes('data-ys-effect')).toBeUndefined()
    vi.advanceTimersByTime(700)
    await nextTick()
    expect(wrapper.attributes('data-ys-effect')).toBe('shimmer')
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

  it('can keep builtin sheets inside the schedule container', async () => {
    const wrapper = mount(YsSchedule, {
      props: {
        courses,
        week: 1,
        reduceMotion: true,
        sheets: { contained: true, adjustable: true, placements: { courseDetail: 'right' } },
      },
    })
    await wrapper.find('.ys-course-card').trigger('click')
    await nextTick()
    const overlay = wrapper.find('.ys-sheet__overlay.is-contained')
    expect(overlay.exists()).toBe(true)
    expect(overlay.classes()).toContain('ys-sheet__overlay--right')
    await wrapper.find('.ys-sheet__tool').trigger('click')
    expect(overlay.classes()).toContain('ys-sheet__overlay--bottom')
  })

  it('bubbles the locally selected detail layout to the host', async () => {
    const wrapper = mount(YsSchedule, {
      props: {
        courses,
        week: 1,
        reduceMotion: true,
        detail: { layout: 'standard', adjustable: true },
        sheets: { contained: true },
      },
    })
    await wrapper.find('.ys-course-card').trigger('click')
    await nextTick()
    await wrapper.find('.ys-detail__layout-switch').trigger('click')
    expect(wrapper.emitted('detailLayoutChange')?.[0]).toEqual(['full'])
  })
})
