import { useEffect, useRef } from 'react'
import {
  MAX_ACTIVE,
  createAestheticBurst,
  drawAestheticBurst,
  randomScreenOrigin,
} from '../utils/aestheticBursts'

/**
 * Bursts only when `trigger` fires (gesture change) — never while holding still.
 */
export default function RippleExplosion({ trigger, gesture, activeChord }) {
  const canvasRef = useRef(null)
  const burstsRef = useRef([])
  const rafRef = useRef(null)
  const lastTriggerRef = useRef(0)
  const gestureRef = useRef(gesture)
  const chordRef = useRef(activeChord)

  gestureRef.current = gesture
  chordRef.current = activeChord

  useEffect(() => {
    if (!trigger || trigger === lastTriggerRef.current) return
    if (!gestureRef.current || !chordRef.current) return
    lastTriggerRef.current = trigger

    for (let i = 0; i < 3; i++) {
      burstsRef.current.push(
        createAestheticBurst({
          gesture: gestureRef.current,
          activeChord: chordRef.current,
          origin: randomScreenOrigin(),
          voiceLevel: 0,
          impact: i === 0,
        }),
      )
    }
    if (burstsRef.current.length > MAX_ACTIVE) {
      burstsRef.current = burstsRef.current.slice(-MAX_ACTIVE)
    }
  }, [trigger])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const resize = () => {
      const lw = window.innerWidth
      const lh = window.innerHeight
      canvas.width = lw
      canvas.height = lh
      canvas.style.width = `${lw}px`
      canvas.style.height = `${lh}px`
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const ctx = canvas.getContext('2d')
      const lw = window.innerWidth
      const lh = window.innerHeight

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, lw, lh)

      const pool = burstsRef.current
      let write = 0
      for (let i = 0; i < pool.length; i++) {
        if (drawAestheticBurst(ctx, pool[i], lw, lh)) {
          pool[write++] = pool[i]
        }
      }
      pool.length = write

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[12] h-full w-full"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
