/**
 * Extract bloom anchor points from MediaPipe Face Mesh landmarks.
 * Returns normalized [0,1] coordinates (mirrored for selfie view).
 */

// MediaPipe Face Mesh indices
const NOSE_TIP = 1
const LEFT_CHEEK = 234
const RIGHT_CHEEK = 454
const FOREHEAD = 10

function mirror(x) {
  return 1 - x
}

export function extractFaceAnchors(landmarks, { mirror: shouldMirror = true } = {}) {
  if (!landmarks || landmarks.length < 468) {
    return null
  }

  const mx = shouldMirror ? mirror : (x) => x

  const nose = landmarks[NOSE_TIP]
  const leftCheek = landmarks[LEFT_CHEEK]
  const rightCheek = landmarks[RIGHT_CHEEK]
  const forehead = landmarks[FOREHEAD]

  return {
    nose: { x: mx(nose.x), y: nose.y },
    leftCheek: { x: mx(leftCheek.x), y: leftCheek.y },
    rightCheek: { x: mx(rightCheek.x), y: rightCheek.y },
    forehead: { x: mx(forehead.x), y: forehead.y },
    bloomLeft: {
      x: mx(leftCheek.x) - 0.06,
      y: leftCheek.y + 0.02,
    },
    bloomRight: {
      x: mx(rightCheek.x) + 0.06,
      y: rightCheek.y + 0.02,
    },
  }
}

export function lerpAnchor(prev, next, t) {
  if (!next) return prev
  if (!prev) return next

  const blend = (a, b) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  })

  return {
    nose: blend(prev.nose, next.nose),
    leftCheek: blend(prev.leftCheek, next.leftCheek),
    rightCheek: blend(prev.rightCheek, next.rightCheek),
    forehead: blend(prev.forehead, next.forehead),
    bloomLeft: blend(prev.bloomLeft, next.bloomLeft),
    bloomRight: blend(prev.bloomRight, next.bloomRight),
  }
}
