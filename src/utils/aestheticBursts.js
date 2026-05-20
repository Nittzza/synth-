/** Pinterest-style aesthetic explosions — one visual language per gesture */

const TAU = Math.PI * 2

const ROOT_PALETTE = {
  C: ['#ff6b9d', '#ffb3c6', '#a8e6cf', '#ffd93d'],
  'C#': ['#ff8c42', '#ff6b6b', '#feca57', '#ff9ff3'],
  D: ['#c8f560', '#7bed9f', '#70a1ff', '#dfe6e9'],
  'D#': ['#a29bfe', '#6c5ce7', '#fd79a8', '#ffeaa7'],
  E: ['#00cec9', '#81ecec', '#fab1a0', '#fdcb6e'],
  F: ['#74b9ff', '#0984e3', '#a29bfe', '#dfe6e9'],
  'F#': ['#e17055', '#fdcb6e', '#00b894', '#81ecec'],
  G: ['#fd79a8', '#fdcb6e', '#e84393', '#ffeaa7'],
  'G#': ['#a29bfe', '#6c5ce7', '#fd79a8', '#55efc4'],
  A: ['#ff7675', '#fab1a0', '#ffeaa7', '#fd79a8'],
  'A#': ['#e056fd', '#686de0', '#f368e0', '#ffbe76'],
  B: ['#ff4757', '#ff6b81', '#ffa502', '#ff6348'],
}

const STYLE_BY_GESTURE = {
  1: 'bokeh',
  2: 'fluid',
  3: 'cosmic',
  palm: 'retro',
}

export const BURST_DURATION_MS = 1100
export const SUSTAIN_INTERVAL_MS = 700
export const MAX_ACTIVE = 5

export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

export function easeOutQuart(t) {
  return 1 - (1 - t) ** 4
}

/** Random point anywhere on screen (mirrored coords match webcam) */
export function randomScreenOrigin() {
  return {
    x: 0.06 + Math.random() * 0.88,
    y: 0.1 + Math.random() * 0.8,
  }
}

function paletteForChord(chord) {
  return ROOT_PALETTE[chord?.root] ?? ['#ff6b9d', '#a29bfe', '#74b9ff', '#ffeaa7', '#fd79a8']
}

export function createAestheticBurst({
  gesture,
  activeChord,
  origin,
  voiceLevel = 0,
  impact = false,
}) {
  const style = STYLE_BY_GESTURE[gesture] ?? 'cosmic'
  const colors = paletteForChord(activeChord)
  const scale = (impact ? 1.35 : 1) * (1 + voiceLevel * 0.25)
  const gestureBoost = typeof gesture === 'number' ? 0.85 + gesture * 0.12 : 1

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    born: performance.now(),
    duration: BURST_DURATION_MS * (impact ? 1.15 : 1),
    style,
    ox: origin.x,
    oy: origin.y,
    colors,
    seed: Math.random() * 1000,
    scale: scale * gestureBoost,
    rayCount: style === 'cosmic' ? 22 : style === 'retro' ? 18 : 14,
    sparkleCount: Math.floor((style === 'retro' || style === 'bokeh' ? 22 : 14) * scale),
    impact,
  }
}

function toScreen(burst, w, h) {
  return { cx: (1 - burst.ox) * w, cy: burst.oy * h }
}

function drawStar(ctx, x, y, size, rot, color, alpha) {
  const spikes = 4
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.fillStyle = color
  ctx.globalAlpha = alpha
  ctx.beginPath()
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? size : size * 0.35
    const a = (i / (spikes * 2)) * TAU - Math.PI / 2
    const px = Math.cos(a) * r
    const py = Math.sin(a) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawPixelSpark(ctx, x, y, size, color, alpha) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  const h = size * 0.4
  ctx.fillRect(x - size / 2, y - h / 2, size, h)
  ctx.fillRect(x - h / 2, y - size / 2, h, size)
  ctx.restore()
}

/** Soft iridescent bokeh + fairy sparkles */
function drawBokehBurst(ctx, burst, w, h, age) {
  const { cx, cy } = toScreen(burst, w, h)
  const expand = easeOutQuart(Math.min(1, age / 0.75))
  const fade = 1 - easeOutCubic(age)
  const maxR = Math.min(w, h) * 0.55 * burst.scale * expand

  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.35)
  core.addColorStop(0, `rgba(255,255,255,${0.7 * fade})`)
  core.addColorStop(0.4, `${burst.colors[0]}88`)
  core.addColorStop(1, 'transparent')
  ctx.globalAlpha = fade * 0.85
  ctx.fillStyle = core
  ctx.beginPath()
  ctx.arc(cx, cy, maxR * 0.35, 0, TAU)
  ctx.fill()

  const count = burst.sparkleCount
  for (let i = 0; i < count; i++) {
    const t = (i / count) * TAU + burst.seed
    const dist = maxR * (0.15 + (i % 7) / 7 * 0.85)
    const px = cx + Math.cos(t + age * 2) * dist
    const py = cy + Math.sin(t + age * 1.5) * dist
    const r = (8 + (i % 5) * 6) * burst.scale * (1 - age * 0.3)
    const c = burst.colors[i % burst.colors.length]

    if (i % 3 === 0) {
      const g = ctx.createRadialGradient(px, py, 0, px, py, r)
      g.addColorStop(0, `${c}cc`)
      g.addColorStop(0.6, `${c}44`)
      g.addColorStop(1, 'transparent')
      ctx.globalAlpha = fade * 0.55
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(px, py, r, 0, TAU)
      ctx.fill()
    } else {
      drawStar(ctx, px, py, r * 0.35, t + age * 4, c, fade * 0.8)
    }
  }
}

/** Swirling marble fluid + tiny stars */
function drawFluidBurst(ctx, burst, w, h, age) {
  const { cx, cy } = toScreen(burst, w, h)
  const expand = easeOutCubic(Math.min(1, age / 0.8))
  const fade = 1 - easeOutCubic(age)
  const maxR = Math.min(w, h) * 0.5 * burst.scale * expand
  const time = age * 8 + burst.seed

  ctx.save()
  ctx.translate(cx, cy)
  ctx.globalAlpha = fade * 0.75

  for (let layer = 0; layer < 4; layer++) {
    ctx.beginPath()
    const segs = 36
    for (let i = 0; i <= segs; i++) {
      const t = (i / segs) * TAU
      const wave =
        Math.sin(t * 3 + time + layer) * 0.12 +
        Math.sin(t * 5 - time * 1.3 + layer * 2) * 0.08
      const r = maxR * (0.35 + layer * 0.12) * (1 + wave)
      const x = Math.cos(t + layer * 0.4) * r
      const y = Math.sin(t + layer * 0.4) * r
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = burst.colors[layer % burst.colors.length]
    ctx.lineWidth = 10 - layer * 1.2
    ctx.globalAlpha = fade * (0.35 - layer * 0.04)
    ctx.stroke()
  }
  ctx.restore()

  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * TAU + burst.seed
    const dist = maxR * (0.2 + (i % 6) / 6 * 0.7)
    drawStar(
      ctx,
      cx + Math.cos(t + time * 0.5) * dist,
      cy + Math.sin(t + time * 0.5) * dist,
      4 + (i % 3) * 3,
      t,
      burst.colors[i % burst.colors.length],
      fade * 0.9,
    )
  }
}

/** Cosmic starburst — rays, nebula core, grain */
function drawCosmicBurst(ctx, burst, w, h, age) {
  const { cx, cy } = toScreen(burst, w, h)
  const expand = easeOutQuart(Math.min(1, age / 0.65))
  const fade = 1 - easeOutCubic(age)
  const maxR = Math.min(w, h) * 0.62 * burst.scale * expand

  const nebula = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.5)
  nebula.addColorStop(0, `rgba(255,255,255,${0.95 * fade})`)
  nebula.addColorStop(0.15, `${burst.colors[0]}dd`)
  nebula.addColorStop(0.45, `${burst.colors[1]}88`)
  nebula.addColorStop(0.75, `${burst.colors[2]}33`)
  nebula.addColorStop(1, 'transparent')
  ctx.globalAlpha = fade
  ctx.fillStyle = nebula
  ctx.beginPath()
  ctx.arc(cx, cy, maxR * 0.5, 0, TAU)
  ctx.fill()

  const rays = burst.rayCount
  for (let i = 0; i < rays; i++) {
    const t = (i / rays) * TAU + burst.seed * 0.01
    const len = maxR * (0.5 + (i % 5) / 5 * 0.5)
    const wobble = Math.sin(t * 7 + age * 12) * maxR * 0.04
    const x2 = cx + Math.cos(t) * (len + wobble)
    const y2 = cy + Math.sin(t) * (len + wobble)
    const c = burst.colors[i % burst.colors.length]

    const grad = ctx.createLinearGradient(cx, cy, x2, y2)
    grad.addColorStop(0, `rgba(255,255,255,${0.9 * fade})`)
    grad.addColorStop(0.25, `${c}cc`)
    grad.addColorStop(1, 'transparent')

    ctx.globalAlpha = fade * (0.5 + (i % 3) * 0.15)
    ctx.strokeStyle = grad
    ctx.lineWidth = 1.5 + (i % 4) * 1.2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  for (let i = 0; i < burst.sparkleCount; i++) {
    const t = (i / burst.sparkleCount) * TAU + burst.seed
    const distFrac = 0.2 + (Math.sin(i * 12.9898 + burst.seed) * 0.5 + 0.5) * 0.75
    const dist = maxR * distFrac
    const px = cx + Math.cos(t + i) * dist * expand
    const py = cy + Math.sin(t + i * 1.3) * dist * expand
    drawStar(ctx, px, py, 2 + (i % 4) * 2, t, '#fff', fade * 0.7)
  }
}

/** Retro graphic rays + dense pixel sparkles */
function drawRetroBurst(ctx, burst, w, h, age) {
  const { cx, cy } = toScreen(burst, w, h)
  const expand = easeOutQuart(Math.min(1, age / 0.7))
  const fade = 1 - easeOutCubic(age)
  const maxR = Math.min(w, h) * 0.65 * burst.scale * expand

  const sun = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.2)
  sun.addColorStop(0, `rgba(255,255,200,${fade})`)
  sun.addColorStop(0.5, `${burst.colors[0]}cc`)
  sun.addColorStop(1, 'transparent')
  ctx.fillStyle = sun
  ctx.globalAlpha = fade
  ctx.beginPath()
  ctx.arc(cx, cy, maxR * 0.22, 0, TAU)
  ctx.fill()

  const rays = burst.rayCount
  for (let i = 0; i < rays; i++) {
    const t = (i / rays) * TAU
    const len = maxR * (0.4 + ((i * 3) % 7) / 7 * 0.6)
    const thick = 6 + (i % 5) * 4
    const c = burst.colors[i % burst.colors.length]

    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(t)
    ctx.globalAlpha = fade * 0.75
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.moveTo(0, -thick * 0.5)
    ctx.lineTo(len, 0)
    ctx.lineTo(0, thick * 0.5)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  for (let i = 0; i < burst.sparkleCount; i++) {
    const t = (i / burst.sparkleCount) * TAU + burst.seed
    const dist = maxR * (0.1 + ((i * 5) % 11) / 11 * 0.9) * expand
    const px = cx + Math.cos(t + age * 3) * dist
    const py = cy + Math.sin(t + age * 2.5) * dist
    const size = 4 + (i % 6) * 3
    drawPixelSpark(
      ctx,
      px,
      py,
      size,
      burst.colors[i % burst.colors.length],
      fade * (0.6 + (i % 3) * 0.15),
    )
  }
}

export function drawAestheticBurst(ctx, burst, w, h) {
  const age = (performance.now() - burst.born) / burst.duration
  if (age >= 1) return false

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'

  switch (burst.style) {
    case 'bokeh':
      drawBokehBurst(ctx, burst, w, h, age)
      break
    case 'fluid':
      drawFluidBurst(ctx, burst, w, h, age)
      break
    case 'cosmic':
      drawCosmicBurst(ctx, burst, w, h, age)
      break
    case 'retro':
      drawRetroBurst(ctx, burst, w, h, age)
      break
    default:
      drawCosmicBurst(ctx, burst, w, h, age)
  }

  ctx.restore()
  return true
}
