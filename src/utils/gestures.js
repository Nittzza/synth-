/**
 * Five gestures: ☝️ · ✌️ · 🤟 · 🖐️ · 👍
 */

import { GESTURE, gestureDisplayName } from './gestureTypes'

export { GESTURE, gestureDisplayName }

const TIP = { thumb: 4, index: 8, middle: 12, ring: 16, pinky: 20 }
const PIP = { thumb: 3, index: 6, middle: 10, ring: 14, pinky: 18 }
const MCP = { thumb: 2, index: 5, middle: 9, ring: 13, pinky: 17 }

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function isUp(tip, pip, landmarks) {
  return landmarks[tip].y < landmarks[pip].y - 0.008
}

function isDown(tip, pip, landmarks) {
  return landmarks[tip].y >= landmarks[pip].y - 0.004
}

function countLongUp(landmarks) {
  let n = 0
  if (isUp(TIP.index, PIP.index, landmarks)) n++
  if (isUp(TIP.middle, PIP.middle, landmarks)) n++
  if (isUp(TIP.ring, PIP.ring, landmarks)) n++
  if (isUp(TIP.pinky, PIP.pinky, landmarks)) n++
  return n
}

function isThumbUp(landmarks) {
  const tip = landmarks[TIP.thumb]
  const ip = landmarks[PIP.thumb]
  const mcp = landmarks[MCP.thumb]
  return tip.y < ip.y - 0.01 && tip.y < mcp.y - 0.005
}

/** 👍 Thumb up, other fingers closed */
function isThumbsUpPose(landmarks) {
  if (!isThumbUp(landmarks)) return false
  if (countLongUp(landmarks) >= 3) return false
  if (isRockPose(landmarks) || isTwoFingersPose(landmarks)) return false
  return (
    isDown(TIP.index, PIP.index, landmarks) &&
    isDown(TIP.middle, PIP.middle, landmarks) &&
    isDown(TIP.ring, PIP.ring, landmarks) &&
    isDown(TIP.pinky, PIP.pinky, landmarks)
  )
}

export function getFingerStates(landmarks) {
  if (!landmarks?.length) {
    return { thumb: false, index: false, middle: false, ring: false, pinky: false }
  }
  return {
    thumb: isThumbUp(landmarks),
    index: isUp(TIP.index, PIP.index, landmarks),
    middle: isUp(TIP.middle, PIP.middle, landmarks),
    ring: isUp(TIP.ring, PIP.ring, landmarks),
    pinky: isUp(TIP.pinky, PIP.pinky, landmarks),
  }
}

export function countExtendedFingers(fingers) {
  return (fingers.index ? 1 : 0) + (fingers.middle ? 1 : 0) + (fingers.ring ? 1 : 0) + (fingers.pinky ? 1 : 0)
}

/** 🖐️ Four fingers up */
function isOpenPalmPose(landmarks) {
  return countLongUp(landmarks) >= 4
}

/** 🤟 Index + pinky, middle & ring folded */
function isRockPose(landmarks) {
  return (
    isUp(TIP.index, PIP.index, landmarks) &&
    isUp(TIP.pinky, PIP.pinky, landmarks) &&
    isDown(TIP.middle, PIP.middle, landmarks) &&
    isDown(TIP.ring, PIP.ring, landmarks)
  )
}

/** ✌️ Index + middle */
function isTwoFingersPose(landmarks) {
  return (
    isUp(TIP.index, PIP.index, landmarks) &&
    isUp(TIP.middle, PIP.middle, landmarks) &&
    isDown(TIP.ring, PIP.ring, landmarks) &&
    isDown(TIP.pinky, PIP.pinky, landmarks)
  )
}

/** ☝️ Index only */
function isOneFingerPose(landmarks) {
  return (
    isUp(TIP.index, PIP.index, landmarks) &&
    isDown(TIP.middle, PIP.middle, landmarks) &&
    isDown(TIP.ring, PIP.ring, landmarks) &&
    isDown(TIP.pinky, PIP.pinky, landmarks)
  )
}

export function classifyGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) return null

  if (isThumbsUpPose(landmarks)) return GESTURE.THUMBS_UP
  if (isOpenPalmPose(landmarks)) return GESTURE.OPEN_PALM
  if (isRockPose(landmarks)) return GESTURE.ROCK
  if (isTwoFingersPose(landmarks)) return GESTURE.TWO
  if (isOneFingerPose(landmarks)) return GESTURE.ONE

  return null
}

export function analyzeHand(landmarks, handednessLabel = 'Unknown') {
  const fingers = getFingerStates(landmarks)
  const gesture = classifyGesture(landmarks)
  return {
    gesture,
    gestureName: gestureDisplayName(gesture),
    fingers,
    fingerCount: countExtendedFingers(fingers),
    handedness: handednessLabel || 'Unknown',
  }
}

export function detectGesture(landmarks) {
  return classifyGesture(landmarks)
}
