/** Watercolor-style sea creatures — Pinterest reference aesthetic */

const JELLY_VARIANTS = ['cyan', 'pink', 'gold']
const EXTRA_TYPES = ['starfish-pink', 'starfish-gold', 'shell']

export function pickCreatureType(chord, index = 0) {
  const roll = Math.random()
  if (roll < 0.55) return `jelly-${JELLY_VARIANTS[index % 3]}`
  if (roll < 0.8) return EXTRA_TYPES[Math.floor(Math.random() * EXTRA_TYPES.length)]
  return `jelly-${JELLY_VARIANTS[Math.floor(Math.random() * 3)]}`
}

export function createCreature(origin, chord, intensity = 0) {
  const type = pickCreatureType(chord)
  return {
    id: `${Date.now()}-${Math.random()}`,
    type,
    x: origin.x,
    y: origin.y,
    vx: (Math.random() - 0.5) * 0.00012,
    vy: (Math.random() - 0.5) * 0.0001 - 0.00003,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.0004,
    scale: 0.7 + Math.random() * 0.6 + intensity * 0.3,
    phase: Math.random() * Math.PI * 2,
    wobble: Math.random() * 10,
    born: performance.now(),
    life: 12000 + Math.random() * 8000,
  }
}

function wavyTentacle(ctx, x0, y0, len, phase, now, i, color, alpha) {
  ctx.strokeStyle = color
  ctx.globalAlpha = alpha
  ctx.lineWidth = 1.4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x0, y0)
  const segs = 8
  for (let s = 1; s <= segs; s++) {
    const ty = y0 + (len * s) / segs
    const wave = Math.sin(now * 0.003 + phase + s * 0.7 + i) * (4 + s * 2.5)
    ctx.lineTo(x0 + wave, ty)
  }
  ctx.stroke()
}

function drawJellyfish(ctx, cx, cy, variant, scale, now, phase, alpha) {
  const s = scale
  const palettes = {
    cyan: { bell: ['rgba(160, 235, 230, 0.75)', 'rgba(120, 210, 220, 0.5)'], tent: 'rgba(100, 200, 210, 0.6)' },
    pink: { bell: ['rgba(255, 170, 210, 0.8)', 'rgba(230, 120, 180, 0.55)'], tent: 'rgba(255, 140, 200, 0.65)' },
    gold: { bell: ['rgba(255, 220, 140, 0.8)', 'rgba(255, 180, 90, 0.5)'], tent: 'rgba(255, 200, 120, 0.65)' },
  }
  const p = palettes[variant] || palettes.cyan
  const bellW = 28 * s
  const bellH = 22 * s
  const floatY = Math.sin(now * 0.002 + phase) * 6 * s

  ctx.save()
  ctx.translate(cx, cy + floatY)
  ctx.globalAlpha = alpha

  const g = ctx.createRadialGradient(0, -bellH * 0.2, 0, 0, 0, bellH * 1.2)
  g.addColorStop(0, p.bell[0])
  g.addColorStop(0.6, p.bell[1])
  g.addColorStop(1, 'transparent')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.ellipse(0, 0, bellW, bellH, 0, Math.PI, 0)
  ctx.fill()

  const tentacles = 7 + Math.floor(scale * 3)
  for (let i = 0; i < tentacles; i++) {
    const tx = (i - tentacles / 2) * (bellW / tentacles) * 1.1
    wavyTentacle(ctx, tx, bellH * 0.25, bellH * 2.2, phase, now, i, p.tent, alpha * 0.9)
  }
  ctx.restore()
}

function drawStarfish(ctx, cx, cy, variant, scale, rot, alpha) {
  const s = scale * 22
  const colors =
    variant === 'gold'
      ? ['rgba(255, 200, 100, 0.85)', 'rgba(220, 160, 60, 0.7)']
      : ['rgba(255, 170, 200, 0.85)', 'rgba(255, 220, 235, 0.75)']

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rot)
  ctx.globalAlpha = alpha

  const arms = 5
  for (let a = 0; a < arms; a++) {
    const angle = (a / arms) * Math.PI * 2 - Math.PI / 2
    const g = ctx.createLinearGradient(0, 0, Math.cos(angle) * s, Math.sin(angle) * s)
    g.addColorStop(0, colors[1])
    g.addColorStop(1, colors[0])
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(angle - 0.2) * s * 0.35, Math.sin(angle - 0.2) * s * 0.35)
    ctx.lineTo(Math.cos(angle) * s, Math.sin(angle) * s)
    ctx.lineTo(Math.cos(angle + 0.2) * s * 0.35, Math.sin(angle + 0.2) * s * 0.35)
    ctx.closePath()
    ctx.fill()
  }

  ctx.fillStyle = colors[1]
  ctx.beginPath()
  ctx.arc(0, 0, s * 0.22, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawShell(ctx, cx, cy, scale, rot, alpha) {
  const s = scale * 14
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rot)
  ctx.globalAlpha = alpha

  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 2)
  g.addColorStop(0, 'rgba(255, 230, 200, 0.9)')
  g.addColorStop(0.5, 'rgba(240, 200, 170, 0.75)')
  g.addColorStop(1, 'rgba(220, 180, 150, 0.4)')

  ctx.fillStyle = g
  ctx.beginPath()
  for (let i = 0; i <= 24; i++) {
    const t = (i / 24) * Math.PI
    const r = s * (0.5 + 0.5 * Math.sin(t)) * (1 + 0.15 * Math.cos(t * 3))
    const x = Math.cos(t) * r
    const y = Math.sin(t) * r * 0.85
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = 'rgba(200, 160, 130, 0.5)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.restore()
}

export function drawCreature(ctx, c, w, h, now) {
  const age = now - c.born
  if (age > c.life) return false

  const fadeIn = Math.min(1, age / 600)
  const fadeOut = age > c.life - 2000 ? (c.life - age) / 2000 : 1
  const alpha = fadeIn * fadeOut

  c.x += c.vx + Math.sin(now * 0.0008 + c.phase) * 0.00018
  c.y += c.vy + Math.cos(now * 0.0007 + c.phase) * 0.00014
  c.rot += c.rotSpeed

  c.x = Math.min(0.94, Math.max(0.06, c.x))
  c.y = Math.min(0.9, Math.max(0.08, c.y))

  const cx = (1 - c.x) * w
  const cy = c.y * h
  const bob = Math.sin(now * 0.002 + c.wobble) * 8

  if (c.type.startsWith('jelly-')) {
    const variant = c.type.replace('jelly-', '')
    drawJellyfish(ctx, cx, cy + bob, variant, c.scale, now, c.phase, alpha)
  } else if (c.type.startsWith('starfish-')) {
    const variant = c.type.replace('starfish-', '')
    drawStarfish(ctx, cx, cy + bob, variant, c.scale, c.rot, alpha)
  } else if (c.type === 'shell') {
    drawShell(ctx, cx, cy + bob, c.scale, c.rot, alpha)
  }

  return true
}
