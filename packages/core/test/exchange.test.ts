import type { Course } from '../src/types'
import { describe, expect, it } from 'vitest'
import {
  computeReminders,
  createShareCode,
  exportICS,
  parseShareCode,
  pendingPlanCount,
} from '../src/exchange'
import { STANDARD_COURSE_TIMES } from '../src/engine'

const termStart = new Date(2026, 2, 2) // 周一
const courses: Course[] = [
  { id: 'math', name: '高等数学', location: '教1-201', teacher: '陈老师', weekday: 1, startSection: 1, endSection: 2, startWeek: 1, endWeek: 2 },
  { id: 'odd', name: '体育', weekday: 2, startSection: 3, endSection: 4, startWeek: 1, endWeek: 4, parity: 'odd' },
]

describe('exportICS', () => {
  it('expands real teaching days and respects parity', () => {
    const ics = exportICS(courses, { termStart, courseTimes: STANDARD_COURSE_TIMES, totalWeeks: 4 })
    expect(ics).toContain('BEGIN:VCALENDAR')
    // 高等数学 2 周 + 体育单周(1/3 周) = 4 个事件
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(4)
    expect(ics).toContain('DTSTART:20260302T080000')
    expect(ics).toContain('LOCATION:教1-201')
    expect(ics).toContain('SUMMARY:高等数学')
  })
})

describe('share code', () => {
  it('round-trips CJK course data', () => {
    const code = createShareCode(courses)
    expect(code.startsWith('YSK1:')).toBe(true)
    const parsed = parseShareCode(code)
    expect(parsed).toHaveLength(2)
    expect(parsed?.[0]?.name).toBe('高等数学')
    expect(parseShareCode('garbage')).toBeNull()
    expect(parseShareCode('YSK1:%%%')).toBeNull()
  })
})

describe('computeReminders', () => {
  it('produces sorted lead-time reminders for active sessions only', () => {
    const reminders = computeReminders(courses, {
      termStart,
      courseTimes: STANDARD_COURSE_TIMES,
      totalWeeks: 2,
      leadMinutes: 15,
    })
    // 第1周：高数(周一)+体育(周二)；第2周：仅高数
    expect(reminders).toHaveLength(3)
    expect(reminders[0]?.at.getHours()).toBe(7)
    expect(reminders[0]?.at.getMinutes()).toBe(45)
    const times = reminders.map(item => item.at.getTime())
    expect([...times].sort((a, b) => a - b)).toEqual(times)
  })

  it('filters by the from cursor', () => {
    const reminders = computeReminders(courses, {
      termStart,
      courseTimes: STANDARD_COURSE_TIMES,
      totalWeeks: 2,
      from: new Date(2026, 2, 4),
    })
    expect(reminders).toHaveLength(1)
    expect(reminders[0]?.week).toBe(2)
  })
})

describe('day plans', () => {
  it('counts pending plans per date', () => {
    const plans = {
      '2026-03-02': [
        { id: 'a', text: 'x', done: false },
        { id: 'b', text: 'y', done: true },
      ],
    }
    expect(pendingPlanCount(plans, new Date(2026, 2, 2))).toBe(1)
    expect(pendingPlanCount(plans, new Date(2026, 2, 3))).toBe(0)
  })
})
