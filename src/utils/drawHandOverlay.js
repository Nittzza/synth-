import { HAND_CONNECTIONS } from './handConnections'

const BOX_COLOR = '#e040fb'
const LINE_COLOR = 'rgba(255, 255, 255, 0.85)'

/** Fingertip colors for debug (thumb → pinky) */
export const FINGERTIP_COLORS = {
  thumb: '#ffeb3b',
  index: '#f44336',
  middle: '#4caf50',
  ring: '#2196f3',
  pinky: '#e91e63',
}

const TIP_INDEX = { thumb: 4, index: 8, middle: 12, ring: 16, pinky: 20 }

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
 * Draw hand skeleton + colored fingertip dots.
 * fingerStates optional — extended tips get full color, curled get dim gray.
 */
export function drawHandOverlay(
  ctx,
  landmarks,
  width,
  height,
  { active = false, fingerStates = null } = {},
) {
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

  for (const [name, tipIdx] of Object.entries(TIP_INDEX)) {
    const p = landmarks[tipIdx]
    const x = p.x * width
    const y = p.y * height
    const extended = fingerStates ? fingerStates[name] : true
    const color = FINGERTIP_COLORS[name]
    const radius = extended ? 7 : 4
    const alpha = extended ? 1 : 0.35

    ctx.globalAlpha = alpha
    ctx.fillStyle = extended ? color : 'rgba(160,160,160,0.8)'
    ctx.beginPath()
    ctx.arc(x, y, radius + 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = extended ? color : '#888'
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  ctx.restore()
}
