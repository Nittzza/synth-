import { QUALITY_TO_FLOWER } from './flowers'

/** Five chords */
export const GESTURE_SLOTS = [
  { gesture: 1, label: 'One finger', emoji: '☝️', hint: 'Index only' },
  { gesture: 2, label: 'Two fingers', emoji: '✌️', hint: 'Index + middle' },
  { gesture: 3, label: 'Rock', emoji: '🤟', hint: 'Index + pinky · middle & ring down' },
  { gesture: 'palm', label: 'Open palm', emoji: '🖐️', hint: 'All four fingers spread open' },
  { gesture: 'thumbs_up', label: 'Thumbs up', emoji: '👍', hint: 'Thumb up · other fingers closed' },
]

export const MAX_CHORDS = 5

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
  if (!gesture || !gestureMap) return null
  return gestureMap[gesture] ?? null
}

export function getFlowerForChord(chord) {
  if (!chord) return 'daisy'
  return QUALITY_TO_FLOWER[chord.quality] ?? 'daisy'
}
