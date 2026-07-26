import { useLayoutEffect, useRef } from 'react'

/**
 * 自定义元素桥：props 以 DOM property 形式下发（支持对象/数组/Date），
 * 事件按 Vue custom element 的派发名监听（原名 + 连字符名双注册，detail 为 emit 参数数组）。
 */
export function useElementBridge<T extends HTMLElement>(
  properties: Record<string, unknown>,
  events: Record<string, ((...args: never[]) => void) | undefined>,
) {
  const ref = useRef<T | null>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    for (const [key, value] of Object.entries(properties)) {
      if (value !== undefined) {
        (el as unknown as Record<string, unknown>)[key] = value
      }
    }
  })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }
    const disposers: Array<() => void> = []
    for (const [name, handler] of Object.entries(events)) {
      if (!handler) {
        continue
      }
      const listener = (event: Event) => {
        const detail = (event as CustomEvent).detail
        ;(handler as (...args: unknown[]) => void)(...(Array.isArray(detail) ? detail : [detail]))
      }
      const hyphenated = name.replace(/([A-Z])/g, '-$1').toLowerCase()
      el.addEventListener(name, listener)
      disposers.push(() => el.removeEventListener(name, listener))
      if (hyphenated !== name) {
        el.addEventListener(hyphenated, listener)
        disposers.push(() => el.removeEventListener(hyphenated, listener))
      }
    }
    return () => disposers.forEach(dispose => dispose())
  })

  return ref
}
