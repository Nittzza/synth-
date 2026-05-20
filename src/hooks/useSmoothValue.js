import { useEffect, useRef, useState } from 'react'

/**
 * Exponential smoothing for scalar values (voice level, bloom intensity).
 */
export function useSmoothValue(target, smoothing = 0.08) {
  const [value, setValue] = useState(target)
  const rafRef = useRef(null)
  const currentRef = useRef(target)

  useEffect(() => {
    const tick = () => {
      const current = currentRef.current
      const next = current + (target - current) * smoothing
      currentRef.current = next
      setValue(next)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, smoothing])

  return value
}
