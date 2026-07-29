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

  it('never promotes an inactive overlap while the active course changes weeks', async () => {
    vi.useFakeTimers()
    const overlapping: Course[] = [
      { id: 'odd', name: '体育（单周）', weekday: 4, startSection: 1, endSection: 2, startWeek: 1, endWeek: 16, parity: 'odd' },
      { id: 'even', name: '线性代数（双周）', weekday: 4, startSection: 1, endSection: 2, startWeek: 1, endWeek: 16, parity: 'even' },
    ]
    const wrapper = mount(YsSchedule, {
      props: { courses: overlapping, week: 1, reduceMotion: false, transition: 'wave' },
    })

    const assertTransitionLayers = () => {
      const layers = ['.ys-schedule__layer--leaving', '.ys-schedule__layer--current']
      for (const layer of layers) {
        const slots = wrapper.findAll(`${layer} .ys-schedule__card-slot`)
        const active = slots.find(slot => slot.attributes('data-course-active') === 'true')
        const inactive = slots.find(slot => slot.attributes('data-course-active') === 'false')
        expect(active?.attributes('style')).toContain('z-index: 2')
        expect(inactive?.attributes('style')).toContain('z-index: 0')
        expect(inactive?.attributes('style')).toContain('opacity: 0')
        expect(inactive?.attributes('style')).toContain('visibility: hidden')
      }
    }

    await wrapper.setProps({ week: 2 })
    await nextTick()
    assertTransitionLayers()
    vi.advanceTimersByTime(600)
    await nextTick()
    const settledInactive = wrapper.find('.ys-schedule__layer--current .ys-schedule__card-slot.is-inactive')
    expect(settledInactive.attributes('style')).toContain('z-index: 0')
    expect(settledInactive.attributes('style')).not.toContain('visibility: hidden')

    await wrapper.setProps({ week: 1 })
    await nextTick()
    assertTransitionLayers()
    vi.advanceTimersByTime(600)
    await nextTick()
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

  it('gives minimal, normal and rich density distinct information tiers', async () => {
    const tierCourse: Course = {
      id: 'tier',
      name: '交互设计',
      teacher: '陈老师',
      location: '创新楼B12',
      weekday: 1,
      startSection: 1,
      endSection: 2,
      startWeek: 1,
      endWeek: 16,
      materials: ['电脑'],
    }
    const wrapper = mount(YsSchedule, {
      props: {
        courses: [tierCourse],
        week: 1,
        termStart: new Date(2026, 6, 20),
        density: 'minimal',
        reduceMotion: true,
        weather: {
          daily: [{ date: '2026-07-20', kind: 'clear', highC: 28, lowC: 22 }],
          updatedAt: Date.now(),
        },
      },
    })

    expect(wrapper.find('.ys-schedule__day-weather').exists()).toBe(false)
    expect(wrapper.find('.ys-course-card__room').exists()).toBe(false)
    expect(wrapper.find('.ys-course-card__weeks').exists()).toBe(false)
    expect(wrapper.find('.ys-course-card__rich-meta').exists()).toBe(false)

    await wrapper.setProps({ density: 'normal' })
    expect(wrapper.find('.ys-schedule__day-weather').exists()).toBe(true)
    expect(wrapper.find('.ys-schedule__day-weather small').exists()).toBe(false)
    expect(wrapper.find('.ys-course-card__room').exists()).toBe(true)
    expect(wrapper.find('.ys-course-card__weeks').exists()).toBe(true)
    expect(wrapper.find('.ys-course-card__rich-meta').exists()).toBe(false)

    await wrapper.setProps({ density: 'rich' })
    expect(wrapper.find('.ys-schedule__day-weather small').text()).toBe('28°')
    expect(wrapper.find('.ys-course-card__rich-meta .ys-course-card__teacher').text()).toBe('陈老师')
    expect(wrapper.find('.ys-course-card__rich-meta .ys-course-card__gear').text()).toBe('带')
  })

  it('defaults course weather to background-only and keeps glyphs opt-in', async () => {
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
    expect(wrapper.find('.ys-course-card__weather-bg .ys-weather-art.is-heavy-rain').exists()).toBe(true)
    expect(wrapper.find('.ys-course-card .ys-weather-glyph').exists()).toBe(false)
    expect(wrapper.find('.ys-schedule__day-weather .ys-weather-glyph').exists()).toBe(true)

    await wrapper.setProps({ weatherCard: { enabled: true, glyph: true, background: true } })
    expect(wrapper.find('.ys-course-card .ys-weather-glyph').exists()).toBe(true)

    await wrapper.setProps({ cardEffect: 'glow' })
    expect(wrapper.attributes('data-ys-effect')).toBe('glow')
    expect(wrapper.find('.ys-course-card__weather-bg').exists()).toBe(false)
    expect(wrapper.find('.ys-course-card .ys-weather-glyph').exists()).toBe(true)
  })

  it('keeps inactive course weather visible only as a muted texture', () => {
    const wrapper = mount(YsSchedule, {
      props: {
        courses,
        week: 2,
        termStart: new Date(2026, 6, 20),
        reduceMotion: true,
        weather: {
          daily: [{ date: '2026-07-30', kind: 'clear', highC: 32 }],
          updatedAt: Date.now(),
        },
      },
    })

    const inactiveCard = wrapper.findAll('.ys-course-card').find(card => card.text().includes('体育'))
    expect(inactiveCard?.classes()).toContain('is-muted')
    expect(inactiveCard?.attributes('data-weather')).toBe('clear')
    expect(inactiveCard?.find('.ys-course-card__weather-bg').exists()).toBe(true)
  })

  it('maps courses on the same day to their nearest hourly weather', () => {
    const sameDayCourses: Course[] = [
      { id: 'morning', name: '晨间课程', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20 },
      { id: 'afternoon', name: '午后课程', weekday: 1, startSection: 5, endSection: 6, startWeek: 1, endWeek: 20 },
    ]
    const wrapper = mount(YsSchedule, {
      props: {
        courses: sameDayCourses,
        week: 1,
        termStart: new Date(2026, 6, 20),
        reduceMotion: true,
        weather: {
          daily: [{ date: '2026-07-20', kind: 'cloudy', lowC: 21, highC: 29 }],
          hourly: [
            { time: '2026-07-20T08:00', kind: 'clear', temperatureC: 24 },
            { time: '2026-07-20T15:00', kind: 'snow', temperatureC: 2 },
          ],
          updatedAt: Date.now(),
        },
      },
    })
    const cards = wrapper.findAll('.ys-course-card')
    expect(cards.map(card => card.attributes('data-weather'))).toEqual(['clear', 'snow'])
  })

  it('keeps Saturday and Sunday course cards connected to their weather', () => {
    const weekendCourses: Course[] = [
      { id: 'saturday', name: '周六课程', weekday: 6, startSection: 3, endSection: 4, startWeek: 1, endWeek: 20 },
      { id: 'sunday', name: '周日课程', weekday: 7, startSection: 5, endSection: 6, startWeek: 1, endWeek: 20 },
    ]
    const wrapper = mount(YsSchedule, {
      props: {
        courses: weekendCourses,
        week: 1,
        termStart: new Date(2026, 6, 20),
        reduceMotion: true,
        weather: {
          daily: [
            { date: '2026-07-25', kind: 'cloudy', highC: 27 },
            { date: '2026-07-26', kind: 'rain', highC: 24 },
          ],
          hourly: [
            { time: '2026-07-25T10:00', kind: 'storm', temperatureC: 23 },
            { time: '2026-07-26T14:30', kind: 'snow', temperatureC: 2 },
          ],
          updatedAt: Date.now(),
        },
      },
    })

    expect(wrapper.findAll('.ys-course-card').map(card => card.attributes('data-weather')))
      .toEqual(['storm', 'snow'])
  })

  it('renders two phase-offset fall layers for weather glyphs', () => {
    const wrapper = mount(YsSchedule, {
      props: {
        courses,
        week: 1,
        termStart: new Date(2026, 6, 20),
        reduceMotion: false,
        weekdayWeather: 'icon',
        weather: {
          daily: [{ date: '2026-07-20', kind: 'rain', highC: 24 }],
          updatedAt: Date.now(),
        },
      },
    })

    const glyph = wrapper.find('.ys-schedule__day-weather .ys-weather-glyph')
    expect(glyph.findAll('.ys-weather-glyph__fall')).toHaveLength(2)
    expect(glyph.find('.ys-weather-glyph__fall--primary').exists()).toBe(true)
    expect(glyph.find('.ys-weather-glyph__fall--secondary').exists()).toBe(true)
  })

  it('renders distinct clear, cloud, fog, rain, and snow card artwork', async () => {
    const weather = (kind: 'clear' | 'cloudy' | 'overcast' | 'fog' | 'rain' | 'snow') => ({
      current: { kind },
      daily: [{ date: '2026-07-20', kind }],
      updatedAt: Date.now(),
    })
    const wrapper = mount(YsSchedule, {
      props: {
        courses,
        week: 1,
        termStart: new Date(2026, 6, 20),
        reduceMotion: true,
        weather: weather('rain'),
      },
    })

    expect(wrapper.findAll('.ys-weather-art.is-rain .ys-weather-art__drop')).toHaveLength(7)
    expect(wrapper.find('.ys-weather-art__drop--1').attributes('d')).toBe('m21 47.5-.9 8.2')

    await wrapper.setProps({ weather: weather('clear') })
    expect(wrapper.find('.ys-weather-art.is-clear .ys-weather-art__clear-core').exists()).toBe(true)
    expect(wrapper.findAll('.ys-weather-art.is-clear .ys-weather-art__clear-rays path')).toHaveLength(1)

    await wrapper.setProps({ weather: weather('snow') })
    expect(wrapper.find('.ys-weather-art.is-snow .ys-weather-art__snowflake--main').exists()).toBe(true)
    expect(wrapper.find('.ys-weather-art.is-snow .ys-weather-art__snow-cloud').exists()).toBe(true)

    await wrapper.setProps({ weather: weather('fog') })
    expect(wrapper.findAll('.ys-weather-art.is-fog .ys-weather-art__fog-line')).toHaveLength(3)

    await wrapper.setProps({ weather: weather('cloudy') })
    expect(wrapper.find('.ys-weather-art.is-cloudy .ys-weather-art__sun-halo').exists()).toBe(true)

    await wrapper.setProps({ weather: weather('overcast') })
    expect(wrapper.find('.ys-weather-art.is-overcast .ys-weather-art__sun-halo').exists()).toBe(false)
    expect(wrapper.findAll('.ys-weather-art.is-overcast .ys-weather-art__cloud')).toHaveLength(2)
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

  it('closes the active builtin sheet before opening another one', async () => {
    vi.useFakeTimers()
    const wrapper = mount(YsSchedule, {
      props: {
        courses,
        week: 1,
        reduceMotion: true,
        sheets: { contained: true },
      },
    })

    await wrapper.find('.ys-course-card').trigger('click')
    await nextTick()
    expect(wrapper.findAll('.ys-sheet__overlay')).toHaveLength(1)
    expect(wrapper.text()).toContain('课程详情')

    ;(wrapper.vm as unknown as { openDayPlanner: (dateKey: string) => void }).openDayPlanner('2026-07-30')
    await nextTick()
    vi.advanceTimersByTime(700)
    await nextTick()

    expect(wrapper.findAll('.ys-sheet__overlay')).toHaveLength(1)
    expect(wrapper.text()).toContain('2026-07-30 · 日计划')
    expect(wrapper.text()).not.toContain('课程详情')
    vi.useRealTimers()
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
