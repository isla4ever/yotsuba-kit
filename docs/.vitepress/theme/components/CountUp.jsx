import { useInView, useMotionValue, useSpring } from 'motion/react'
import React, { useCallback, useEffect, useRef } from 'react'

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd,
}) {
  const ref = useRef(null)
  const motionValue = useMotionValue(direction === 'down' ? to : from)

  const damping = 20 + 40 * (1 / duration)
  const stiffness = 100 * (1 / duration)
  const springValue = useSpring(motionValue, { damping, stiffness })
  const isInView = useInView(ref, { once: true, margin: '0px' })

  const getDecimalPlaces = (number) => {
    const stringValue = number.toString()
    if (stringValue.includes('.')) {
      const decimals = stringValue.split('.')[1]
      if (Number.parseInt(decimals, 10) !== 0) {
        return decimals.length
      }
    }
    return 0
  }

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to))
  const formatValue = useCallback((latest) => {
    const hasDecimals = maxDecimals > 0
    const formatted = Intl.NumberFormat('en-US', {
      useGrouping: Boolean(separator),
      minimumFractionDigits: hasDecimals ? maxDecimals : 0,
      maximumFractionDigits: hasDecimals ? maxDecimals : 0,
    }).format(latest)
    return separator ? formatted.replace(/,/g, separator) : formatted
  }, [maxDecimals, separator])

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatValue(direction === 'down' ? to : from)
    }
  }, [direction, formatValue, from, to])

  useEffect(() => {
    if (isInView && startWhen) {
      onStart?.()
      const startTimer = window.setTimeout(() => {
        motionValue.set(direction === 'down' ? from : to)
      }, delay * 1000)
      const endTimer = window.setTimeout(() => onEnd?.(), (delay + duration) * 1000)
      return () => {
        window.clearTimeout(startTimer)
        window.clearTimeout(endTimer)
      }
    }
  }, [delay, direction, duration, from, isInView, motionValue, onEnd, onStart, startWhen, to])

  useEffect(() => springValue.on('change', latest => {
    if (ref.current) {
      ref.current.textContent = formatValue(latest)
    }
  }), [formatValue, springValue])

  return <span ref={ref} className={className} />
}
