import { HAND_CONNECTIONS } from './handConnections'

const BOX_COLOR = '#e040fb'
const LINE_COLOR = 'rgba(255, 255, 255, 0.95)'
const DOT_COLOR = '#ff4444'
const DOT_GLOW = 'rgba(255, 80, 80, 0.55)'

function bounds(landmarks, pad = 0.025) {
  let minX = 1
  let maxX = 0
  let minY = 1
  let maxY = 0
  for (const p of landmarks) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  return {
    x: Math.max(0, minX - pad),
    y: Math.max(0, minY - pad),
    w: Math.min(1, maxX - minX + pad * 2),
    h: Math.min(1, maxY - minY + pad * 2),
  }
}

/**
 * Draw MediaPipe-style hand skeleton on a canvas (normalized landmarks 0–1).
 */
export function drawHandOverlay(ctx, landmarks, width, height, { active = false } = {}) {
  if (!landmarks?.length) return

  const box = bounds(landmarks)
  const bx = box.x * width
  const by = box.y * height
  const bw = box.w * width
  const bh = box.h * height

  ctx.save()

  ctx.strokeStyle = active ? '#fff59d' : BOX_COLOR
  ctx.lineWidth = active ? 3.5 : 2.5
  ctx.shadowColor = active ? 'rgba(255, 245, 157, 0.7)' : 'rgba(224, 64, 251, 0.45)'
  ctx.shadowBlur = active ? 14 : 10
  ctx.strokeRect(bx, by, bw, bh)
  ctx.shadowBlur = 0

  ctx.strokeStyle = LINE_COLOR
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (const [a, b] of HAND_CONNECTIONS) {
    const p1 = landmarks[a]
    const p2 = landmarks[b]
    if (!p1 || !p2) continue
    ctx.beginPath()
    ctx.moveTo(p1.x * width, p1.y * height)
    ctx.lineTo(p2.x * width, p2.y * height)
    ctx.stroke()
  }

  for (const p of landmarks) {
    const x = p.x * width
    const y = p.y * height
    ctx.fillStyle = DOT_GLOW
    ctx.beginPath()
    ctx.arc(x, y, 7, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = DOT_COLOR
    ctx.beginPath()
    ctx.arc(x, y, 4.5, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}
