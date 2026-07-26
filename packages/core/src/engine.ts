import type {
  Course,
  CourseTime,
  DayOverride,
  DisplayCourse,
  OverlapGroup,
  ScheduleRow,
  WeekModel,
} from './types'

export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 学期第 week 周星期 weekday 对应的日期（termStart 应为第 1 周周一） */
export function dateFor(termStart: Date, week: number, weekday: number): Date {
  const date = new Date(termStart)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + (week - 1) * 7 + weekday - 1)
  return date
}

/** 某日期落在学期第几周（clamp 到 [1, totalWeeks]） */
export function weekOf(date: Date, termStart: Date, totalWeeks: number): number {
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  const start = new Date(termStart)
  start.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((target.getTime() - start.getTime()) / 86_400_000)
  return Math.min(totalWeeks, Math.max(1, Math.floor(diffDays / 7) + 1))
}

/** 课程在指定周是否实际上课（周次范围 + 单双周） */
export function isCourseActive(course: Course, week: number): boolean {
  if (week < course.startWeek || week > course.endWeek) {
    return false
  }
  if (course.parity === 'odd') {
    return week % 2 === 1
  }
  if (course.parity === 'even') {
    return week % 2 === 0
  }
  return true
}

/**
 * 生成某周的展示课程：
 * - 假日（holiday）当天课程整列移除；
 * - 补班（makeup）当天替换为来源星期在该周真实生效的课程（尊重单双周）；
 * - 其余课程原样保留，非本周课程 active 为 false（由适配层置灰展示）。
 */
export function buildDisplayCourses(
  courses: Course[],
  week: number,
  options: { termStart?: Date, overrides?: DayOverride[] } = {},
): DisplayCourse[] {
  const { termStart, overrides = [] } = options
  const overrideByWeekday = new Map<number, DayOverride>()
  if (termStart) {
    for (let weekday = 1; weekday <= 7; weekday++) {
      const key = formatDateKey(dateFor(termStart, week, weekday))
      const override = overrides.find(item => item.date === key)
      if (override) {
        overrideByWeekday.set(weekday, override)
      }
    }
  }

  const result: DisplayCourse[] = []
  for (const course of courses) {
    const override = overrideByWeekday.get(course.weekday)
    if (override) {
      continue // 该展示日被假日清空或被补班替换
    }
    result.push({
      ...course,
      displayId: course.id,
      active: isCourseActive(course, week),
    })
  }

  for (const [weekday, override] of overrideByWeekday) {
    if (override.kind !== 'makeup' || !override.sourceWeekday) {
      continue
    }
    for (const course of courses) {
      if (course.weekday !== override.sourceWeekday || !isCourseActive(course, week)) {
        continue
      }
      result.push({
        ...course,
        weekday,
        displayId: `${course.id}@makeup-${override.date}`,
        active: true,
        makeup: {
          sourceWeekday: override.sourceWeekday,
          date: override.date,
          name: override.name,
        },
      })
    }
  }

  return result
}

function overlaps(a: DisplayCourse, b: DisplayCourse): boolean {
  return a.weekday === b.weekday
    && a.startSection <= b.endSection
    && b.startSection <= a.endSection
}

/** 连通分量式重叠分组（A-B 相交、B-C 相交则 A/B/C 同组） */
export function buildOverlapGroups(courses: DisplayCourse[]): OverlapGroup[] {
  const groups: OverlapGroup[] = []
  const visited = new Set<string>()
  for (const course of courses) {
    if (visited.has(course.displayId)) {
      continue
    }
    const group: DisplayCourse[] = []
    const queue = [course]
    while (queue.length) {
      const current = queue.shift()!
      if (visited.has(current.displayId)) {
        continue
      }
      visited.add(current.displayId)
      group.push(current)
      for (const candidate of courses) {
        if (!visited.has(candidate.displayId) && overlaps(current, candidate)) {
          queue.push(candidate)
        }
      }
    }
    if (group.length > 1) {
      const startSection = Math.min(...group.map(item => item.startSection))
      const endSection = Math.max(...group.map(item => item.endSection))
      groups.push({
        id: `${course.weekday}-${startSection}-${endSection}`,
        weekday: course.weekday,
        startSection,
        endSection,
        courses: group,
      })
    }
  }
  return groups
}

/** 组装某周完整模型：展示课程按“非本周在前、本周在后”排序，保证本周卡渲染在上层 */
export function buildWeekModel(
  courses: Course[],
  week: number,
  options: { termStart?: Date, overrides?: DayOverride[] } = {},
): WeekModel {
  const displayCourses = buildDisplayCourses(courses, week, options)
    .sort((a, b) => Number(a.active) - Number(b.active))
  return {
    week,
    courses: displayCourses,
    overlapGroups: buildOverlapGroups(displayCourses),
  }
}

/** 课程冲突检测（新增/编辑表单用）：同天、节次相交、周次相交、单双周相容 */
export function findConflicts(
  candidate: Pick<Course, 'weekday' | 'startSection' | 'endSection' | 'startWeek' | 'endWeek' | 'parity'>,
  courses: Course[],
  ignoredId?: string,
): Course[] {
  return courses.filter((course) => {
    if (course.id === ignoredId || course.weekday !== candidate.weekday) {
      return false
    }
    const sectionOverlap = candidate.startSection <= course.endSection
      && course.startSection <= candidate.endSection
    if (!sectionOverlap || candidate.endWeek < course.startWeek || course.endWeek < candidate.startWeek) {
      return false
    }
    const a = candidate.parity ?? 'every'
    const b = course.parity ?? 'every'
    return a === 'every' || b === 'every' || a === b
  })
}

/** 时间轴行（含午休分隔行） */
export function buildScheduleRows(
  times: CourseTime[],
  options: { breakAfterSection?: number, breakLabel?: string, maxSection?: number } = {},
): ScheduleRow[] {
  const { breakAfterSection = 4, breakLabel = '午休', maxSection } = options
  const total = Math.max(times.length, maxSection ?? 0)
  const rows: ScheduleRow[] = []
  for (let section = 1; section <= total; section++) {
    rows.push({
      key: `section-${section}`,
      section,
      time: times[section - 1] ?? null,
      label: '',
      isBreak: false,
    })
    if (section === breakAfterSection && section < total) {
      rows.push({ key: 'break', section: null, time: null, label: breakLabel, isBreak: true })
    }
  }
  return rows
}

/** 标准作息（可被 courseTimes 覆盖） */
export const STANDARD_COURSE_TIMES: CourseTime[] = [
  { start: '08:00', end: '08:45' },
  { start: '08:55', end: '09:40' },
  { start: '10:00', end: '10:45' },
  { start: '10:55', end: '11:40' },
  { start: '14:30', end: '15:15' },
  { start: '15:25', end: '16:10' },
  { start: '16:20', end: '17:05' },
  { start: '17:15', end: '18:00' },
  { start: '18:10', end: '18:55' },
  { start: '19:30', end: '20:15' },
  { start: '20:25', end: '21:10' },
  { start: '21:20', end: '22:05' },
]
