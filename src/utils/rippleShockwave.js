/** Spider-Verse neon shockwave palettes & burst tuning */

const NEON = [
  '#00e5ff', // electric cyan
  '#3b82f6', // electric blue
  '#a855f7', // purple
  '#c026d3', // magenta
  '#ff4d9e', // pink
  '#22d3ee', // cyan
]

const ROOT_HUE = {
  C: 0,
  'C#': 0.06,
  D: 0.12,
  'D#': 0.18,
  E: 0.24,
  F: 0.32,
  'F#': 0.38,
  G: 0.45,
  'G#': 0.52,
  A: 0.58,
  'A#': 0.65,
  B: 0.72,
}

export const BURST_DURATION_MS = 1200
export const SEGMENTS = 112

export function organicWobble(angle, time, seed) {
  return (
    Math.sin(angle * 3 + time * 2.4 + seed) * 0.045 +
    Math.sin(angle * 7 - time * 1.9 + seed * 1.7) * 0.028 +
    Math.cos(angle * 5 + time * 3.1 + seed * 0.5) * 0.018 +
    Math.sin(angle * 11 + time * 4.2) * 0.012
  )
}

export function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

export function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t)
}

export function resolveBurstOrigin(anchors) {
  if (!anchors) return { x: 0.5, y: 0.58 }
  return {
    x: (anchors.bloomLeft.x + anchors.bloomRight.x) / 2,
    y: (anchors.bloomLeft.y + anchors.bloomRight.y) / 2 + 0.1,
  }
}

/** Map normalized screen coords → orthographic world (mirrored like webcam) */
export function screenToWorld(origin, aspect) {
  return {
    x: aspect * (1 - 2 * origin.x),
    y: 1 - 2 * origin.y,
  }
}

export function getRippleConfig(activeChord, gesture, voiceLevel = 0) {
  let ringCount = 7
  let speed = 1.05
  let glow = 0.75

  if (gesture === 1) {
    ringCount = 6
    speed = 1.0
    glow = 0.7
  } else if (gesture === 2) {
    ringCount = 8
    speed = 1.08
    glow = 0.78
  } else if (gesture === 3) {
    ringCount = 9
    speed = 1.14
    glow = 0.85
  } else if (gesture === 'palm') {
    ringCount = 10
    speed = 1.22
    glow = 0.95
  }

  const hueShift = ROOT_HUE[activeChord?.root] ?? 0
  const colors = NEON.map((_, i) => NEON[(i + Math.round(hueShift * NEON.length)) % NEON.length])

  return {
    ringCount,
    speed: speed * (1 + voiceLevel * 0.12),
    glow: glow + voiceLevel * 0.35,
    maxRadius: 2.65,
    colors,
    lineWidth: 2.2 + (gesture === 'palm' ? 1.2 : typeof gesture === 'number' ? gesture * 0.15 : 0),
  }
}

export function createBurst(origin, config) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return {
    id,
    born: performance.now(),
    origin,
    config,
    seed: Math.random() * 100,
    rings: Array.from({ length: config.ringCount }, (_, i) => ({
      index: i,
      color: config.colors[i % config.colors.length],
      thickness: 1 + (i % 3) * 0.45,
    })),
  }
}
