import type { Course, CourseTime, DayOverride } from './types'
import { buildDisplayCourses, dateFor, formatDateKey } from './engine'

/**
 * 导出 / 分享 / 提醒：全部为纯函数,宿主自由决定落地方式
 * （下载 .ics、系统日历订阅、二维码、本地通知等）。
 */

export interface ExportOptions {
  termStart: Date
  courseTimes: CourseTime[]
  totalWeeks?: number
  overrides?: DayOverride[]
  calendarName?: string
}

function icsEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function icsStamp(date: Date, time: string): string {
  const [hour = '00', minute = '00'] = time.split(':')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}${month}${day}T${hour.padStart(2, '0')}${minute.padStart(2, '0')}00`
}

/**
 * 导出标准 iCalendar（RFC 5545）文本。
 * 按周展开真实上课日（尊重单双周与调休补班/假日），可直接写为 .ics 文件
 * 或作为订阅源返回,导入系统日历 / Google Calendar / Outlook。
 */
export function exportICS(courses: Course[], options: ExportOptions): string {
  const { termStart, courseTimes, totalWeeks = 20, overrides = [], calendarName = '课程表' } = options
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//yotsuba-kit//schedule-core//CN',
    `X-WR-CALNAME:${icsEscape(calendarName)}`,
  ]
  for (let week = 1; week <= totalWeeks; week++) {
    const display = buildDisplayCourses(courses, week, { termStart, overrides })
    for (const item of display) {
      if (!item.active) {
        continue
      }
      const date = dateFor(termStart, week, item.weekday)
      const start = courseTimes[item.startSection - 1]?.start ?? '08:00'
      const end = courseTimes[item.endSection - 1]?.end ?? '09:00'
      lines.push(
        'BEGIN:VEVENT',
        `UID:${icsEscape(item.displayId)}-w${week}@yotsuba-kit`,
        `DTSTART:${icsStamp(date, start)}`,
        `DTEND:${icsStamp(date, end)}`,
        `SUMMARY:${icsEscape(item.name)}`,
        ...(item.location ? [`LOCATION:${icsEscape(item.location)}`] : []),
        ...(item.teacher ? [`DESCRIPTION:${icsEscape(`教师：${item.teacher}`)}`] : []),
        'END:VEVENT',
      )
    }
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

/* ------------------------------ 课表分享码 ------------------------------ */

const SHARE_PREFIX = 'YSK1:'

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach(byte => binary += String.fromCharCode(byte))
  const encoder = (globalThis as { btoa?: (data: string) => string }).btoa
  if (encoder) {
    return encoder(binary)
  }
  // Node 环境
  return (globalThis as unknown as { Buffer: { from: (s: string, e: string) => { toString: (e: string) => string } } })
    .Buffer.from(text, 'utf8').toString('base64')
}

function fromBase64(encoded: string): string {
  const decoder = (globalThis as { atob?: (data: string) => string }).atob
  if (decoder) {
    const binary = decoder(encoded)
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  }
  return (globalThis as unknown as { Buffer: { from: (s: string, e: string) => { toString: (e: string) => string } } })
    .Buffer.from(encoded, 'base64').toString('utf8')
}

/** 生成课表分享码（可直接生成二维码/口令粘贴）。 */
export function createShareCode(courses: Course[]): string {
  return SHARE_PREFIX + toBase64(JSON.stringify(courses))
}

/** 解析课表分享码；非法内容返回 null。 */
export function parseShareCode(code: string): Course[] | null {
  if (!code.startsWith(SHARE_PREFIX)) {
    return null
  }
  try {
    const parsed = JSON.parse(fromBase64(code.slice(SHARE_PREFIX.length)))
    return Array.isArray(parsed) ? parsed as Course[] : null
  }
  catch {
    return null
  }
}

/* ------------------------------ 上课提醒引擎 ------------------------------ */

export interface Reminder {
  /** 提醒触发时刻 */
  at: Date
  /** 上课开始时刻 */
  startsAt: Date
  week: number
  course: Course & { weekday: number }
}

/**
 * 计算学期内全部上课提醒时刻（纯函数）。
 * 宿主用它对接 Notification API、Service Worker、App 推送或系统日历闹钟。
 */
export function computeReminders(
  courses: Course[],
  options: ExportOptions & { leadMinutes?: number, from?: Date },
): Reminder[] {
  const { termStart, courseTimes, totalWeeks = 20, overrides = [], leadMinutes = 15, from } = options
  const reminders: Reminder[] = []
  for (let week = 1; week <= totalWeeks; week++) {
    const display = buildDisplayCourses(courses, week, { termStart, overrides })
    for (const item of display) {
      if (!item.active) {
        continue
      }
      const date = dateFor(termStart, week, item.weekday)
      const [hour = 8, minute = 0] = (courseTimes[item.startSection - 1]?.start ?? '08:00').split(':').map(Number)
      const startsAt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute)
      const at = new Date(startsAt.getTime() - leadMinutes * 60_000)
      if (from && at <= from) {
        continue
      }
      reminders.push({ at, startsAt, week, course: item })
    }
  }
  return reminders.sort((a, b) => a.at.getTime() - b.at.getTime())
}

/* ------------------------------ 日计划 ------------------------------ */

export interface DayPlan {
  id: string
  text: string
  done: boolean
}

/** 日计划集合：dateKey(YYYY-MM-DD) → 计划列表 */
export type DayPlanMap = Record<string, DayPlan[]>

export function pendingPlanCount(plans: DayPlanMap, date: Date): number {
  return (plans[formatDateKey(date)] ?? []).filter(plan => !plan.done).length
}
