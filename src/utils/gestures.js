/**
 * ✊ fist → stop all sound
 * 1 / 2 / 🤟 (ILY) / open palm → four chords
 * Returns 'fist' | 1 | 2 | 3 | 'palm' | null
 *
 * Gesture 3 = 🤟 “I love you” (thumb + index + pinky up, middle & ring down).
 * Checked before open palm so 🤟 isn't misread as 🖐️.
 */

export const STOP_GESTURE = 'fist'

export function isStopGesture(gesture) {
  return gesture === STOP_GESTURE
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function isExtended(tip, pip, wrist, landmarks) {
  const tipLm = landmarks[tip]
  const pipLm = landmarks[pip]
  const wristLm = landmarks[wrist]
  const tipToWrist = dist(tipLm, wristLm)
  const pipToWrist = dist(pipLm, wristLm)
  if (tipToWrist > pipToWrist * 1.04) return true
  return tipLm.y < pipLm.y - 0.012
}

/** Thumb extended outward (🤟 / hang-loose family) */
function isThumbExtended(landmarks) {
  const tip = landmarks[4]
  const ip = landmarks[3]
  const mcp = landmarks[2]
  const wrist = landmarks[0]
  const indexMcp = landmarks[5]

  if (dist(tip, wrist) > dist(ip, wrist) * 1.06) return true
  if (dist(tip, indexMcp) > dist(mcp, indexMcp) * 1.15) return true
  return dist(tip, ip) > dist(ip, mcp) * 0.95
}

/** Middle or ring clearly curled — not extended */
function isFingerFolded(tip, pip, wrist, landmarks) {
  return !isExtended(tip, pip, wrist, landmarks)
}

/** 🤟 I love you: thumb + index + pinky extended, middle & ring folded */
function isLoveYouSign(landmarks) {
  const index = isExtended(8, 6, 0, landmarks)
  const middle = isExtended(12, 10, 0, landmarks)
  const ring = isExtended(16, 14, 0, landmarks)
  const pinky = isExtended(20, 18, 0, landmarks)
  const thumb = isThumbExtended(landmarks)

  if (!thumb || !index || !pinky) return false
  if (middle || ring) return false

  return isFingerFolded(12, 10, 0, landmarks) && isFingerFolded(16, 14, 0, landmarks)
}

/** All four fingertips spread wide — stricter than 🤟 */
function isFullHandSpread(landmarks) {
  const indexTip = landmarks[8]
  const pinkyTip = landmarks[20]
  const indexMcp = landmarks[5]
  const pinkyMcp = landmarks[17]
  const tipSpread = dist(indexTip, pinkyTip)
  const palmWidth = dist(indexMcp, pinkyMcp)
  return tipSpread > palmWidth * 0.78
}

/** ✊ All fingers curled toward the palm */
function isFist(landmarks) {
  const index = isExtended(8, 6, 0, landmarks)
  const middle = isExtended(12, 10, 0, landmarks)
  const ring = isExtended(16, 14, 0, landmarks)
  const pinky = isExtended(20, 18, 0, landmarks)

  if (index || middle || ring || pinky) return false

  const palm = landmarks[9]
  const wrist = landmarks[0]
  const palmSize = dist(wrist, palm)
  const tips = [8, 12, 16, 20]
  const avgTipDist =
    tips.reduce((sum, i) => sum + dist(landmarks[i], palm), 0) / tips.length

  return avgTipDist < palmSize * 0.92
}

/** Open palm: every finger extended and hand clearly wide */
function isOpenPalm(landmarks) {
  const index = isExtended(8, 6, 0, landmarks)
  const middle = isExtended(12, 10, 0, landmarks)
  const ring = isExtended(16, 14, 0, landmarks)
  const pinky = isExtended(20, 18, 0, landmarks)

  if (!index || !middle || !ring || !pinky) return false
  return isFullHandSpread(landmarks)
}

export function detectGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) return null

  if (isFist(landmarks)) return STOP_GESTURE

  const index = isExtended(8, 6, 0, landmarks)
  const middle = isExtended(12, 10, 0, landmarks)
  const ring = isExtended(16, 14, 0, landmarks)
  const pinky = isExtended(20, 18, 0, landmarks)

  if (index && !middle && !ring && !pinky) return 1
  if (index && middle && !ring && !pinky) return 2

  if (isLoveYouSign(landmarks)) return 3

  if (isOpenPalm(landmarks)) return 'palm'

  return null
}
