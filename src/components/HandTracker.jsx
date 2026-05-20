import { useEffect, useRef } from 'react'
import { detectGesture } from '../utils/gestures'
import { locateHandsFile } from '../utils/mediapipe'
import { loadHands } from '../utils/loadMediaPipe'

/**
 * MediaPipe Hands — detects finger gestures and reports chord key.
 */
export default function HandTracker({ video, enabled = true, onGesture, onHandVisible }) {
  const rafRef = useRef(null)
  const lastGestureRef = useRef(null)

  useEffect(() => {
    if (!video || !enabled) return undefined

    let active = true
    let hands = null

    const init = async () => {
      const Hands = await loadHands()
      if (!active) return

      hands = new Hands({
        locateFile: (file) => locateHandsFile(file),
      })

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.55,
        minTrackingConfidence: 0.5,
      })

      hands.onResults((results) => {
        if (!active) return

        const hasHand = (results.multiHandLandmarks?.length ?? 0) > 0
        onHandVisible?.(hasHand)

        let gesture = null
        if (hasHand) {
          gesture = detectGesture(results.multiHandLandmarks[0])
        }

        if (gesture !== lastGestureRef.current) {
          lastGestureRef.current = gesture
          onGesture?.(gesture)
        }
      })

      const processFrame = async () => {
        if (!active || !hands || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(processFrame)
          return
        }
        await hands.send({ image: video })
        rafRef.current = requestAnimationFrame(processFrame)
      }

      rafRef.current = requestAnimationFrame(processFrame)
    }

    init()

    return () => {
      active = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      hands?.close?.()
    }
  }, [video, enabled, onGesture, onHandVisible])

  return null
}
