import { useEffect, useRef } from 'react'
import { drawHandOverlay } from '../utils/drawHandOverlay'

/**
 * Live hand skeleton + colored fingertip dots (extended = bright, curled = dim).
 */
export default function HandTrackingOverlay({ video, landmarks, gesture, fingerStates }) {
  const canvasRef = useRef(null)
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !video) return undefined

    const syncSize = () => {
      const parent = video.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const w = Math.round(rect.width)
      const h = Math.round(rect.height)
      if (w < 1 || h < 1) return

      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      sizeRef.current = { w, h, dpr }
    }

    syncSize()
    const ro = new ResizeObserver(syncSize)
    ro.observe(video.parentElement)
    window.addEventListener('resize', syncSize)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', syncSize)
    }
  }, [video])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const { w, h, dpr } = sizeRef.current
    const ctx = canvas.getContext('2d')
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!landmarks?.length || w < 1) return

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const active = gesture != null
    drawHandOverlay(ctx, landmarks, w, h, { active, fingerStates })
  }, [landmarks, gesture, fingerStates])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full object-cover"
      aria-hidden
    />
  )
}
