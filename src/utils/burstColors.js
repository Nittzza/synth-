import { KEY_COLORS } from './chordTheory'

/** Spider-Verse palette accents per chord root */
export function getBurstPalette(chord) {
  const root = chord?.root ?? 'C'
  const base = KEY_COLORS[root] ?? '#6600ff'

  return {
    core: '#ff2d9b',
    ripple: '#00e5ff',
    rippleAlt: '#7b5cff',
    star: '#ffe600',
    spark: '#ffffff',
    square: '#00ffcc',
    accent: base,
  }
}
