import type { Course, WeekParity } from './types'

/** 旧版正方教务爬虫格式（number/day/weekState 等）→ 标准 Course */
export interface ZhengfangRawCourse {
  name?: string
  teacher?: string
  classRoom?: string
  day?: string | number
  number?: string | number[]
  schoolTime?: { day?: string | number, number?: string | number[] }
  startWeek?: number
  endWeek?: number
  /** 0 每周 / 1 单周 / 2 双周 */
  weekState?: number
  isCustom?: boolean
}

const DAY_ALIASES: Record<string, number> = {
  周一: 1, 星期一: 1, 一: 1,
  周二: 2, 星期二: 2, 二: 2,
  周三: 3, 星期三: 3, 三: 3,
  周四: 4, 星期四: 4, 四: 4,
  周五: 5, 星期五: 5, 五: 5,
  周六: 6, 星期六: 6, 六: 6,
  周日: 7, 周天: 7, 星期日: 7, 星期天: 7, 日: 7, 天: 7,
}

export function normalizeWeekday(value: unknown): number {
  const numeric = Number(value)
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= 7) {
    return numeric
  }
  return DAY_ALIASES[String(value ?? '').trim()] ?? 1
}

export function parseSections(value: unknown): [number, number] | null {
  const values = Array.isArray(value)
    ? value.map(Number)
    : String(value ?? '')
        .split(/[,，\-~至]/)
        .map(Number)
  const sections = values
    .filter(section => Number.isFinite(section) && section > 0)
    .map(section => Math.trunc(section))
    .sort((a, b) => a - b)
  if (!sections.length) {
    return null
  }
  return [sections[0]!, sections.at(-1) ?? sections[0]!]
}

const PARITY_BY_STATE: Record<number, WeekParity> = { 0: 'every', 1: 'odd', 2: 'even' }

/** 转换正方教务原始课程列表；解析失败的条目静默丢弃 */
export function fromZhengfang(raw: ZhengfangRawCourse[]): Course[] {
  return raw.flatMap((item, index) => {
    const sections = parseSections(item.number ?? item.schoolTime?.number)
    if (!sections) {
      return []
    }
    const weekday = normalizeWeekday(item.day ?? item.schoolTime?.day)
    const name = String(item.name ?? '').trim() || '未命名课程'
    return [{
      id: `${name}|${weekday}|${sections.join('-')}|${item.teacher ?? ''}|${item.startWeek ?? 1}#${index}`,
      name,
      teacher: String(item.teacher ?? '').trim() || undefined,
      location: String(item.classRoom ?? '').trim() || undefined,
      weekday,
      startSection: sections[0]!,
      endSection: sections[1]!,
      startWeek: Math.max(1, Number(item.startWeek) || 1),
      endWeek: Math.max(1, Number(item.endWeek) || 1),
      parity: PARITY_BY_STATE[Number(item.weekState)] ?? 'every',
      custom: Boolean(item.isCustom),
    } satisfies Course]
  })
}
