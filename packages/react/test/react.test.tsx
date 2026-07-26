import type { Course } from '@iyotsuba/schedule-core'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { YsSchedule } from '../src/YsSchedule'

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
    const { container } = render(
      <YsSchedule courses={courses} week={1} reduceMotion onUpdateWeek={onUpdateWeek} />,
    )
    const el = container.querySelector('ys-schedule')!
    el.dispatchEvent(new CustomEvent('update:week', { detail: [5] }))
    expect(onUpdateWeek).toHaveBeenCalledWith(5)
  })
})
