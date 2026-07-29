let animationEpoch: number | undefined

export function weatherAnimationPhase(): string {
  if (typeof performance === 'undefined') {
    return '0ms'
  }
  const now = performance.now()
  animationEpoch ??= now
  return `${animationEpoch - now}ms`
}
