import type { Course } from '../src/types'
import { describe, expect, it } from 'vitest'
import { fromZhengfang } from '../src/adapters'
import {
  buildDisplayCourses,
  buildOverlapGroups,
  buildScheduleRows,
  buildWeekModel,
  dateFor,
  findConflicts,
  isCourseActive,
  STANDARD_COURSE_TIMES,
  weekOf,
} from '../src/engine'
import { resolveTransition, validateTransition, waveTransition } from '../src/motion'

function course(partial: Partial<Course> & Pick<Course, 'id' | 'weekday'>): Course {
  return {
    name: partial.id,
    startSection: 1,
    endSection: 2,
    startWeek: 1,
    endWeek: 20,
    ...partial,
  }
}

describe('week math', () => {
  const termStart = new Date(2026, 2, 2) // 2026-03-02 周一

  it('maps dates to weeks with clamping', () => {
    expect(weekOf(new Date(2026, 2, 2), termStart, 20)).toBe(1)
    expect(weekOf(new Date(2026, 2, 9), termStart, 20)).toBe(2)
    expect(weekOf(new Date(2025, 11, 1), termStart, 20)).toBe(1)
    expect(weekOf(new Date(2027, 0, 1), termStart, 20)).toBe(20)
  })

  it('computes the date of a weekday in a week', () => {
    expect(dateFor(termStart, 2, 3).getDate()).toBe(11)
  })
})

describe('parity', () => {
  it('respects odd/even weeks', () => {
    const odd = course({ id: 'odd', weekday: 1, parity: 'odd' })
    const even = course({ id: 'even', weekday: 1, parity: 'even' })
    expect(isCourseActive(odd, 1)).toBe(true)
    expect(isCourseActive(odd, 2)).toBe(false)
    expect(isCourseActive(even, 2)).toBe(true)
    expect(isCourseActive(even, 3)).toBe(false)
  })

  it('respects week range', () => {
    const short = course({ id: 's', weekday: 1, startWeek: 3, endWeek: 5 })
    expect(isCourseActive(short, 2)).toBe(false)
    expect(isCourseActive(short, 4)).toBe(true)
    expect(isCourseActive(short, 6)).toBe(false)
  })
})

describe('makeup days', () => {
  const termStart = new Date(2026, 2, 2)

  it('copies only active source-weekday courses onto the makeup day', () => {
    const courses = [
      course({ id: 'mon-every', weekday: 1 }),
      course({ id: 'mon-odd', weekday: 1, parity: 'odd' }),
      course({ id: 'sat', weekday: 6 }),
    ]
    // 第 2 周周六(2026-03-14)补周一的课
    const display = buildDisplayCourses(courses, 2, {
      termStart,
      overrides: [{ date: '2026-03-14', kind: 'makeup', sourceWeekday: 1 }],
    })
    const saturday = display.filter(item => item.weekday === 6)
    // 原周六课被替换；周一单周课第 2 周不生效，不复制
    expect(saturday.map(item => item.id).sort()).toEqual(['mon-every'])
    expect(saturday[0]?.makeup?.sourceWeekday).toBe(1)
  })

  it('clears holiday days entirely', () => {
    const courses = [course({ id: 'fri', weekday: 5 })]
    const display = buildDisplayCourses(courses, 1, {
      termStart,
      overrides: [{ date: '2026-03-06', kind: 'holiday' }],
    })
    expect(display).toHaveLength(0)
  })
})

describe('overlap groups', () => {
  it('groups transitively overlapping courses', () => {
    const display = buildDisplayCourses([
      course({ id: 'a', weekday: 1, startSection: 1, endSection: 2 }),
      course({ id: 'b', weekday: 1, startSection: 2, endSection: 3 }),
      course({ id: 'c', weekday: 1, startSection: 3, endSection: 4 }),
      course({ id: 'solo', weekday: 2 }),
    ], 1)
    const groups = buildOverlapGroups(display)
    expect(groups).toHaveLength(1)
    expect(groups[0]?.courses).toHaveLength(3)
    expect(groups[0]?.startSection).toBe(1)
    expect(groups[0]?.endSection).toBe(4)
  })
})

describe('week model ordering', () => {
  it('sorts inactive courses first so active ones render on top', () => {
    const model = buildWeekModel([
      course({ id: 'active', weekday: 1 }),
      course({ id: 'inactive', weekday: 1, startWeek: 5, endWeek: 6 }),
    ], 1)
    expect(model.courses.map(item => item.id)).toEqual(['inactive', 'active'])
  })
})

describe('conflicts', () => {
  it('detects section/week/parity intersection', () => {
    const existing = [course({ id: 'x', weekday: 1, startSection: 1, endSection: 2, parity: 'odd' })]
    expect(findConflicts({ weekday: 1, startSection: 2, endSection: 3, startWeek: 1, endWeek: 20, parity: 'even' }, existing)).toHaveLength(0)
    expect(findConflicts({ weekday: 1, startSection: 2, endSection: 3, startWeek: 1, endWeek: 20, parity: 'odd' }, existing)).toHaveLength(1)
    expect(findConflicts({ weekday: 2, startSection: 1, endSection: 2, startWeek: 1, endWeek: 20 }, existing)).toHaveLength(0)
  })
})

describe('rows', () => {
  it('inserts the break row after the configured section', () => {
    const rows = buildScheduleRows(STANDARD_COURSE_TIMES)
    expect(rows.filter(row => row.isBreak)).toHaveLength(1)
    expect(rows.findIndex(row => row.isBreak)).toBe(4)
    expect(rows).toHaveLength(13)
  })
})

describe('zhengfang adapter', () => {
  it('parses legacy day/number formats', () => {
    const parsed = fromZhengfang([
      { name: '高数', day: '周一', number: '1-2', startWeek: 1, endWeek: 20, weekState: 0 },
      { name: '英语', day: 3, number: [5, 6], startWeek: 2, endWeek: 16, weekState: 2 },
      { name: '坏数据', day: '周八', number: 'abc' },
    ])
    expect(parsed).toHaveLength(2)
    expect(parsed[0]).toMatchObject({ weekday: 1, startSection: 1, endSection: 2, parity: 'every' })
    expect(parsed[1]).toMatchObject({ weekday: 3, startSection: 5, endSection: 6, parity: 'even' })
  })
})

describe('transitions', () => {
  it('wave delay follows direction', () => {
    const ctx = { direction: 1 as const, columns: 7 }
    // 去下一周：右列先扫
    expect(waveTransition.delayFor({ weekday: 7, startSection: 1 }, ctx)).toBe(0)
    expect(waveTransition.delayFor({ weekday: 1, startSection: 1 }, ctx)).toBe(180)
    const back = { direction: -1 as const, columns: 7 }
    expect(waveTransition.delayFor({ weekday: 1, startSection: 1 }, back)).toBe(0)
  })

  it('keeps wave enter and leave fades complementary', () => {
    expect(waveTransition.leaveLagMs).toBe(0)
    expect(waveTransition.leaveMs).toBe(waveTransition.enterMs)
    expect(waveTransition.leave.easing).toBe(waveTransition.enter.easing)
  })

  it('resolves builtin names and validates custom specs', () => {
    expect(resolveTransition('slide').name).toBe('slide')
    expect(resolveTransition('slide').mode).toBe('page')
    expect(resolveTransition('fade').name).toBe('fade')
    expect(resolveTransition('fade').mode).toBe('layer')
    expect(resolveTransition(undefined).name).toBe('wave')
    expect(validateTransition(waveTransition)).toHaveLength(0)
    expect(validateTransition(resolveTransition('fade'))).toHaveLength(0)
    expect(validateTransition(resolveTransition('cube'))).toHaveLength(0)
    expect(validateTransition(resolveTransition('zoom'))).toHaveLength(0)
    expect(validateTransition({ ...waveTransition, totalMs: 2000 })).not.toHaveLength(0)
  })
})
