import type { Course, CourseMaterial } from './types'

/** 将旧版字符串资料与结构化资料统一为可渲染模型。 */
export function normalizeCourseMaterials(course: Pick<Course, 'materials'>): CourseMaterial[] {
  return (course.materials ?? [])
    .map(item => typeof item === 'string' ? { name: item } : item)
    .filter(item => item.name.trim().length > 0)
}
/** 汇总课程需要携带的教材与资料，并按名称去重。 */
export function courseCarryItems(course: Pick<Course, 'books' | 'materials'>): CourseMaterial[] {
  const items: CourseMaterial[] = [
    ...(course.books ?? []).map(book => ({
      id: book.id,
      name: book.title,
      kind: 'book' as const,
      required: book.required,
      note: book.note,
    })),
    ...normalizeCourseMaterials(course),
  ]
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = item.name.trim().toLocaleLowerCase()
    if (!key || seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}
