import { useEffect, useRef } from 'react'
import { getBurstPalette } from '../utils/burstColors'

const BURST_DURATION = 1400

function createBurst(origin, chord) {
  const colors = getBurstPalette(chord)
  const particles = []
  const sparks = []

  for (let i = 0; i < 14; i++) {
    const angle = (Math.PI * 2 * i) / 14 + Math.random() * 0.5
    const speed = 0.15 + Math.random() * 0.35
    particles.push({
      angle,
      speed,
      size: 4 + Math.random() * 10,
      rot: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      shape: Math.random() > 0.5 ? 'sq' : 'ci',
    })
  }

  for (let i = 0; i < 8; i++) {
    sparks.push({
      angle: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.45,
      size: 5 + Math.random() * 6,
    })
  }

  return {
    id: `${Date.now()}-${Math.random()}`,
    origin,
    colors,
    label: chord?.label ?? '',
    start: performance.now(),
    particles,
    sparks,
    wobble: Math.random() * 100,
  }
}

function drawSketchyCircle(ctx, cx, cy, r, color, alpha, wobble, t) {
  ctx.strokeStyle = color
  ctx.globalAlpha = alpha
  ctx.lineWidth = 1.5 + (1 - t) * 1.5
  ctx.beginPath()
  const segments = 48
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    const w = Math.sin(a * 5 + wobble + t * 8) * 3
    const x = cx + Math.cos(a) * (r + w)
    const y = cy + Math.sin(a) * (r + w)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.stroke()
}

function drawStarburst(ctx, cx, cy, scale, color, alpha) {
  const points = 10
  const outer = 28 * scale
  const inner = 10 * scale
  ctx.fillStyle = color
  ctx.globalAlpha = alpha
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'
  ctx.lineWidth = 2
  ctx.stroke()
}

function drawBurst(ctx, burst, w, h, now) {
  const elapsed = now - burst.start
  const t = elapsed / BURST_DURATION
  if (t >= 1) return false

  const cx = (1 - burst.origin.x) * w
  const cy = burst.origin.y * h
  const { colors } = burst
  const ease = 1 - t * t

  const coreR = 6 + t * 18
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR)
  g.addColorStop(0, colors.core)
  g.addColorStop(0.5, `${colors.accent}99`)
  g.addColorStop(1, 'transparent')
  ctx.globalAlpha = ease * 0.9
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2)
  ctx.fill()

  const rippleCount = 5
  for (let i = 0; i < rippleCount; i++) {
    const rt = Math.max(0, t - i * 0.06)
    const radius = 20 + rt * (120 + i * 25)
    const alpha = ease * (0.85 - i * 0.14) * (1 - rt)
    if (alpha <= 0) continue
    const col = i % 2 === 0 ? colors.ripple : colors.rippleAlt
    drawSketchyCircle(ctx, cx, cy, radius, col, alpha, burst.wobble + i, t)
  }

  if (t < 0.45) {
    const st = t / 0.35
    const scale = st < 1 ? st * 1.2 : 1.2 - (st - 1) * 0.5
    drawStarburst(ctx, cx, cy, scale, colors.star, (1 - t * 2) * 0.95)
  }

  burst.sparks.forEach((s) => {
    const dist = s.speed * t * Math.min(w, h) * 0.5
    const x = cx + Math.cos(s.angle) * dist
    const y = cy + Math.sin(s.angle) * dist
    const a = ease * (1 - t * 0.8)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(s.angle)
    ctx.fillStyle = colors.spark
    ctx.globalAlpha = a
    ctx.beginPath()
    const sz = s.size * (1 - t * 0.5)
    ctx.moveTo(0, -sz)
    ctx.lineTo(sz * 0.6, 0)
    ctx.lineTo(0, sz)
    ctx.lineTo(-sz * 0.6, 0)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  })

  burst.particles.forEach((p) => {
    const dist = p.speed * t * Math.min(w, h) * 0.45
    const x = cx + Math.cos(p.angle) * dist
    const y = cy + Math.sin(p.angle) * dist
    const a = ease * 0.7 * (1 - t)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(p.rot + p.rotSpeed * t * 10)
    ctx.globalAlpha = a
    ctx.fillStyle = p.shape === 'sq' ? colors.square : colors.ripple
    if (p.shape === 'sq') {
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
    } else {
      ctx.beginPath()
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  })

  ctx.globalAlpha = 1
  return true
}

/** Spider-Verse ripples on chord change */
export default function RippleBurstCanvas({ trigger, origin, activeChord, voiceLevel = 0 }) {
  const canvasRef = useRef(null)
  const burstsRef = useRef([])
  const rafRef = useRef(null)
  const lastTriggerRef = useRef(0)

  useEffect(() => {
    if (!trigger || trigger === lastTriggerRef.current || !origin) return
    lastTriggerRef.current = trigger
    burstsRef.current.push(createBurst(origin, activeChord))
    if (burstsRef.current.length > 8) {
      burstsRef.current = burstsRef.current.slice(-8)
    }
  }, [trigger, origin, activeChord, voiceLevel])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const ctx = canvas.getContext('2d')
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const now = performance.now()
      burstsRef.current = burstsRef.current.filter((b) => drawBurst(ctx, b, w, h, now))

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
