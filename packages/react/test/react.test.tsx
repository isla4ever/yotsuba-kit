import type { Course, DayPlanMap, DetailLayout } from '@iyotsuba/schedule-core'
import { render } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { YsSchedule } from '../src/YsSchedule'
import type { YsScheduleElement } from '../src/YsSchedule'
import { YsToday } from '../src/YsToday'
import type { YsTodayElement } from '../src/YsToday'

const courses: Course[] = [
  { id: 'math', name: '高等数学', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20 },
]

describe('ysSchedule react binding', () => {
  it('renders the custom element and assigns properties', () => {
    const { container } = render(
      <YsSchedule courses={courses} week={2} reduceMotion topBar="none" />,
    )
    const el = container.querySelector('ys-schedule') as HTMLElement & { courses: Course[], week: number }
    expect(el).toBeTruthy()
    expect(el.week).toBe(2)
    expect(el.courses).toHaveLength(1)
    // 自定义元素已升级并渲染 shadow DOM 内容
    expect(el.shadowRoot?.textContent).toContain('高等数学')
  })

  it('forwards custom element events to react handlers', () => {
    const onUpdateWeek = vi.fn()
    const onCourseUpdate = vi.fn()
    const onDetailLayoutChange = vi.fn()
    const { container } = render(
      <YsSchedule
        courses={courses}
        week={1}
        reduceMotion
        onUpdateWeek={onUpdateWeek}
        onCourseUpdate={onCourseUpdate}
        onDetailLayoutChange={onDetailLayoutChange}
      />,
    )
    const el = container.querySelector('ys-schedule')!
    el.dispatchEvent(new CustomEvent('update:week', { detail: [5] }))
    el.dispatchEvent(new CustomEvent('courseUpdate', { detail: [courses[0], 'old-math'] }))
    el.dispatchEvent(new CustomEvent('detailLayoutChange', { detail: ['full' satisfies DetailLayout] }))
    expect(onUpdateWeek).toHaveBeenCalledWith(5)
    expect(onCourseUpdate).toHaveBeenCalledWith(courses[0], 'old-math')
    expect(onDetailLayoutChange).toHaveBeenCalledWith('full')
  })

  it('assigns advanced schedule configuration as element properties', () => {
    const dayPlans: DayPlanMap = {
      '2026-07-27': [{ id: 'plan-1', text: '复习第三章', done: false }],
    }
    const { container } = render(
      <YsSchedule
        courses={courses}
        editable
        dayPlans={dayPlans}
        background={{ image: 'data:image/png;base64,demo', opacity: 0.72, blur: 8 }}
        density="rich"
        palette="morandi"
        cardEffect="shimmer"
        weatherCard={{ enabled: true, glyph: true, background: true }}
        weekdayWeather="full"
        weatherScene
        sheets={{ placements: { courseDetail: 'right' }, adjustable: true }}
        detail={{ hero: 'weather', layout: 'full', adjustable: true, emptyText: '暂无信息' }}
      />,
    )
    const el = container.querySelector('ys-schedule') as HTMLElement & Record<string, unknown>
    expect(el.editable).toBe(true)
    expect(el.dayPlans).toBe(dayPlans)
    expect(el.density).toBe('rich')
    expect(el.palette).toBe('morandi')
    expect(el.cardEffect).toBe('shimmer')
    expect(el.weekdayWeather).toBe('full')
    expect(el.weatherScene).toBe(true)
    expect(el.sheets).toEqual({ placements: { courseDetail: 'right' }, adjustable: true })
    expect(el.detail).toEqual({ hero: 'weather', layout: 'full', adjustable: true, emptyText: '暂无信息' })
  })

  it('supports controlled Today layouts and arrangement events', () => {
    const onWidgetsChange = vi.fn()
    const onLayoutEditing = vi.fn()
    const widgets = [
      { id: 'next-course', size: 'compact' as const },
      { id: 'weather', size: 'large' as const },
    ]
    const { container } = render(
      <YsToday
        courses={courses}
        termStart={new Date(2026, 1, 23)}
        widgets={widgets}
        arrangeable
        dayPlans={{}}
        onWidgetsChange={onWidgetsChange}
        onLayoutEditing={onLayoutEditing}
      />,
    )
    const el = container.querySelector('ys-today') as HTMLElement & Record<string, unknown>
    expect(el.widgets).toBe(widgets)
    expect(el.arrangeable).toBe(true)

    el.dispatchEvent(new CustomEvent('update:widgets', { detail: [widgets.slice().reverse()] }))
    el.dispatchEvent(new CustomEvent('layoutEditing', { detail: [true] }))
    expect(onWidgetsChange).toHaveBeenCalledWith(widgets.slice().reverse())
    expect(onLayoutEditing).toHaveBeenCalledWith(true)
  })

  it('forwards element refs with public schedule and Today methods', () => {
    const scheduleRef = createRef<YsScheduleElement>()
    const todayRef = createRef<YsTodayElement>()
    render(
      <>
        <YsSchedule ref={scheduleRef} courses={courses} reduceMotion />
        <YsToday
          ref={todayRef}
          courses={courses}
          termStart={new Date(2026, 1, 23)}
          reduceMotion
        />
      </>,
    )
    expect(typeof scheduleRef.current?.openCourse).toBe('function')
    expect(typeof scheduleRef.current?.next).toBe('function')
    expect(typeof todayRef.current?.setArranging).toBe('function')
    expect(typeof todayRef.current?.layoutReset).toBe('function')
  })
})
