/** Five chord gestures: 1, 2, 3 (rock), palm, thumbs up */
export const GESTURE = {
  ONE: 1,
  TWO: 2,
  ROCK: 3,
  OPEN_PALM: 'palm',
  THUMBS_UP: 'thumbs_up',
}

export const GESTURE_NAMES = {
  [GESTURE.ONE]: 'ONE',
  [GESTURE.TWO]: 'TWO',
  [GESTURE.ROCK]: 'ROCK',
  [GESTURE.OPEN_PALM]: 'OPEN_PALM',
  [GESTURE.THUMBS_UP]: 'THUMBS_UP',
  null: '—',
}

export function gestureDisplayName(gesture) {
  return GESTURE_NAMES[gesture] ?? '—'
}
