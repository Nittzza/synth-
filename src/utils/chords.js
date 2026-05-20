import { QUALITY_TO_FLOWER } from './flowers'

/** Up to 4 gestures — same order as omnichord performance mapping */
export const GESTURE_SLOTS = [
  { gesture: 1, label: '1 finger', emoji: '☝️' },
  { gesture: 2, label: '2 fingers', emoji: '✌️' },
  { gesture: 3, label: '3 fingers', emoji: '🤟' },
  { gesture: 'palm', label: 'open palm', emoji: '🖐️' },
]

export const MAX_CHORDS = 4

/**
 * Map selected chords (in order) → hand gestures.
 * @param {import('./chordTheory').createChord extends Function ? ReturnType<typeof createChord>[] : object[]} selectedChords
 */
export function buildGestureMap(selectedChords) {
  const map = {}
  const byGesture = {}

  selectedChords.slice(0, MAX_CHORDS).forEach((chord, i) => {
    const slot = GESTURE_SLOTS[i]
    if (!slot) return
    map[slot.gesture] = chord
    byGesture[slot.gesture] = chord.id
  })

  return { map, byGesture }
}

export function getChordFromGesture(gestureMap, gesture) {
  if (!gesture || !gestureMap || gesture === 'fist') return null
  return gestureMap[gesture] ?? null
}

export function getFlowerForChord(chord) {
  if (!chord) return 'daisy'
  return QUALITY_TO_FLOWER[chord.quality] ?? 'daisy'
}
