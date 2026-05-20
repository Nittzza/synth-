/** Ratatouille-style pops — only on chord change, grow big then fade */

const WARM = {
  stars: ['#FFE566', '#FFD93D', '#FFF3A0'],
  bokeh: [
    'rgba(255, 120, 80, 0.6)',
    'rgba(255, 160, 60, 0.5)',
    'rgba(255, 200, 100, 0.45)',
    'rgba(255, 90, 70, 0.4)',
    'rgba(255, 180, 140, 0.55)',
  ],
  wisp: ['rgba(255, 220, 180, 0.75)', 'rgba(255, 180, 200, 0.6)', 'rgba(255, 240, 200, 0.7)'],
  blob: ['rgba(255, 100, 60, 0.4)', 'rgba(255, 150, 50, 0.35)'],
}

const TYPES = ['bokeh', 'star', 'wisp', 'spiral', 'blob', 'spark']

function pickType() {
  const r = Math.random()
  if (r < 0.3) return 'bokeh'
  if (r < 0.5) return 'star'
  if (r < 0.68) return 'wisp'
  if (r < 0.82) return 'spark'
  if (r < 0.92) return 'spiral'
  return 'blob'
}

export function burstCountForGesture(gesture) {
  if (gesture === 1) return 8
  if (gesture === 2) return 11
  if (gesture === 3) return 14
  if (gesture === 'palm') return 18
  return 10
}

export function randomBurstPoint(faceZone) {
  if (faceZone && Math.random() < 0.5) {
    const a = Math.random() * Math.PI * 2
    const r = faceZone.r * (0.5 + Math.random() * 1.8)
    return {
      x: Math.min(0.94, Math.max(0.06, faceZone.cx + Math.cos(a) * r)),
      y: Math.min(0.9, Math.max(0.08, faceZone.cy + Math.sin(a) * r)),
    }
  }
  return { x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.8 }
}

export function createPop(origin, gesture, voiceLevel = 0) {
  const gestureBoost = gesture === 'palm' ? 1.4 : typeof gesture === 'number' ? 0.9 + gesture * 0.15 : 1
  return {
    id: `${Date.now()}-${Math.random()}`,
    type: pickType(),
    x: origin.x,
    y: origin.y,
    vx: (Math.random() - 0.5) * 0.00008,
    vy: (Math.random() - 0.5) * 0.00006,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.0003,
    baseScale: (0.7 + Math.random() * 0.5) * gestureBoost * (1 + voiceLevel * 0.35),
    phase: Math.random() * Math.PI * 2,
    colorIdx: Math.floor(Math.random() * 5),
    born: performance.now(),
    growMs: 550,
    holdMs: 400,
    fadeMs: 1400,
    depth: Math.random(),
  }
}

function drawStar(ctx, cx, cy, size, color, alpha, rot) {
  const spikes = 4
  const outer = size
  const inner = size * 0.38
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rot)
  ctx.fillStyle = color
  ctx.globalAlpha = alpha
  ctx.shadowBlur = size * 0.6
  ctx.shadowColor = color
  ctx.beginPath()
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawSpark(ctx, cx, cy, size, color, alpha) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.globalAlpha = alpha
  ctx.shadowBlur = 6
  ctx.shadowColor = color
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(a) * size, cy + Math.sin(a) * size)
    ctx.stroke()
  }
}

function drawBokeh(ctx, cx, cy, r, color, alpha, depth) {
  const blur = r * (0.5 + depth * 0.5)
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, blur)
  g.addColorStop(0, color)
  g.addColorStop(0.5, color.replace('0.', '0.0'))
  g.addColorStop(1, 'transparent')
  ctx.globalAlpha = alpha * (0.55 + depth * 0.45)
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, blur, 0, Math.PI * 2)
  ctx.fill()
}

function drawWisp(ctx, cx, cy, len, phase, now, color, alpha) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.globalAlpha = alpha
  ctx.shadowBlur = 8
  ctx.shadowColor = color
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  const segs = 5
  for (let s = 1; s <= segs; s++) {
    const t = s / segs
    ctx.lineTo(
      cx + Math.sin(now * 0.003 + phase + s) * len * 0.28 * t,
      cy - len * t + Math.cos(now * 0.002 + phase) * 10,
    )
  }
  ctx.stroke()
}

function drawSpiral(ctx, cx, cy, size, phase, now, color, alpha) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.globalAlpha = alpha
  ctx.shadowBlur = 6
  ctx.shadowColor = color
  ctx.beginPath()
  for (let i = 0; i <= 40; i++) {
    const t = i / 40
    const a = t * 2.5 * Math.PI * 2 + phase + now * 0.001
    const r = size * t
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.stroke()
}

function drawBlob(ctx, cx, cy, r, color, alpha) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  g.addColorStop(0, color)
  g.addColorStop(1, 'transparent')
  ctx.globalAlpha = alpha
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.ellipse(cx, cy, r * 1.2, r * 0.85, 0, 0, Math.PI * 2)
  ctx.fill()
}

/** Grow in → hold → fade out (not persistent) */
function lifeEnvelope(age, growMs, holdMs, fadeMs) {
  if (age < growMs) return age / growMs
  if (age < growMs + holdMs) return 1
  const fadeAge = age - growMs - holdMs
  return Math.max(0, 1 - fadeAge / fadeMs)
}

export function drawPop(ctx, p, w, h, now) {
  const age = now - p.born
  const total = p.growMs + p.holdMs + p.fadeMs
  if (age > total) return false

  const env = lifeEnvelope(age, p.growMs, p.holdMs, p.fadeMs)
  const grow = age < p.growMs ? age / p.growMs : 1
  const scale = p.baseScale * (0.15 + grow * 0.85) * env
  const alpha = env

  p.x += p.vx
  p.y += p.vy
  p.rot += p.rotSpeed

  const cx = (1 - p.x) * w
  const cy = p.y * h
  const bob = Math.sin(now * 0.003 + p.phase) * 3 * env

  switch (p.type) {
    case 'star':
      drawStar(ctx, cx, cy + bob, 10 + scale * 18, WARM.stars[p.colorIdx % 3], alpha, p.rot)
      break
    case 'spark':
      drawSpark(ctx, cx, cy + bob, 6 + scale * 14, WARM.stars[1], alpha)
      break
    case 'bokeh':
      drawBokeh(ctx, cx, cy + bob, 25 + scale * 55, WARM.bokeh[p.colorIdx % WARM.bokeh.length], alpha, p.depth)
      break
    case 'wisp':
      drawWisp(ctx, cx, cy + bob, 30 + scale * 50, p.phase, now, WARM.wisp[p.colorIdx % WARM.wisp.length], alpha)
      break
    case 'spiral':
      drawSpiral(ctx, cx, cy + bob, 15 + scale * 35, p.phase, now, WARM.wisp[0], alpha)
      break
    case 'blob':
      drawBlob(ctx, cx, cy + bob, 20 + scale * 40, WARM.blob[p.colorIdx % 2], alpha * 0.75)
      break
    default:
      break
  }

  return true
}

export function spawnGestureBurst(pool, gesture, faceZone, voiceLevel = 0) {
  if (!Array.isArray(pool)) return
  const count = burstCountForGesture(gesture)
  for (let i = 0; i < count; i++) {
    pool.push(createPop(randomBurstPoint(faceZone), gesture, voiceLevel))
  }
}
