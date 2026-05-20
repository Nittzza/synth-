import { useEffect, useRef } from 'react'
import { detectGesture } from '../utils/gestures'
import { locateHandsFile } from '../utils/mediapipe'
import { loadHands } from '../utils/loadMediaPipe'

const DETECT_W = 480
const DETECT_H = 270

const FRAMES_TO_COMMIT = 2
/** Longer clear avoids a null gesture between chord switches (which caused audible breaks) */
const FRAMES_TO_CLEAR = 8
const FRAMES_NO_HAND = 3

function handBounds(landmarks) {
  let minX = 1
  let maxX = 0
  let minY = 1
  let maxY = 0
  for (const p of landmarks) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  return { w: maxX - minX, h: maxY - minY }
}

function isPlausibleHand(landmarks) {
  if (!landmarks || landmarks.length < 21) return false
  const { w, h } = handBounds(landmarks)
  return w > 0.04 && h > 0.04
}

export default function VisionTracker({
  video,
  enabled = true,
  onGesture,
  onHandVisible,
  onLandmarks,
  onStatus,
}) {
  const committedRef = useRef(null)
  const candidateRef = useRef(null)
  const candidateCountRef = useRef(0)
  const lastHandRef = useRef(false)
  const noHandCountRef = useRef(0)
  const callbacksRef = useRef({})

  callbacksRef.current = { onGesture, onHandVisible, onLandmarks, onStatus }

  useEffect(() => {
    if (!video || !enabled) return undefined

    let active = true
    let hands = null
    let rafId = null
    let processing = false

    const detectCanvas = document.createElement('canvas')
    detectCanvas.width = DETECT_W
    detectCanvas.height = DETECT_H
    const detectCtx = detectCanvas.getContext('2d', { alpha: false })

    const commit = (gesture) => {
      if (gesture === committedRef.current) return
      committedRef.current = gesture
      callbacksRef.current.onGesture?.(gesture)
    }

    const resetStability = () => {
      candidateRef.current = null
      candidateCountRef.current = 0
    }

    const processRaw = (raw) => {
      if (raw === candidateRef.current) {
        candidateCountRef.current += 1
      } else {
        candidateRef.current = raw
        candidateCountRef.current = 1
      }

      const count = candidateCountRef.current
      const stable = candidateRef.current

      if (stable === null) {
        if (count >= FRAMES_TO_CLEAR) commit(null)
        return
      }

      if (count >= FRAMES_TO_COMMIT) commit(stable)
    }

    const setHandVisible = (visible) => {
      if (visible === lastHandRef.current) return
      lastHandRef.current = visible
      callbacksRef.current.onHandVisible?.(visible)
      if (!visible) {
        resetStability()
        commit(null)
        callbacksRef.current.onLandmarks?.(null)
      }
    }

    const init = async () => {
      try {
        callbacksRef.current.onStatus?.('loading')

        const Hands = await loadHands()
        if (!active) return

        hands = new Hands({ locateFile: locateHandsFile })
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          selfieMode: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })

        hands.onResults((results) => {
          if (!active) return

          const rawHand = results.multiHandLandmarks?.[0] ?? null
          const hasHand = rawHand != null && isPlausibleHand(rawHand)

          if (!hasHand) {
            noHandCountRef.current += 1
            if (noHandCountRef.current >= FRAMES_NO_HAND) {
              setHandVisible(false)
              callbacksRef.current.onLandmarks?.(null)
            }
            return
          }

          noHandCountRef.current = 0
          setHandVisible(true)
          callbacksRef.current.onLandmarks?.(rawHand)

          processRaw(detectGesture(rawHand))
        })

        await hands.initialize()
        if (!active) return
        callbacksRef.current.onStatus?.('ready')

        const tick = async () => {
          if (!active) return
          rafId = requestAnimationFrame(tick)
          if (processing || video.readyState < 2 || !video.videoWidth) return

          detectCtx.drawImage(video, 0, 0, DETECT_W, DETECT_H)
          processing = true
          try {
            await hands.send({ image: detectCanvas })
          } catch (err) {
            console.error('[VisionTracker]', err)
            callbacksRef.current.onStatus?.('error')
          } finally {
            processing = false
          }
        }

        rafId = requestAnimationFrame(tick)
      } catch (err) {
        console.error('[VisionTracker] init failed', err)
        callbacksRef.current.onStatus?.('error')
      }
    }

    init()

    return () => {
      active = false
      if (rafId) cancelAnimationFrame(rafId)
      hands?.close?.()
    }
  }, [video, enabled])

  return null
}
