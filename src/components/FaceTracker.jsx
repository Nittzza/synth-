import { useEffect, useRef } from 'react'
import { extractFaceAnchors, lerpAnchor } from '../utils/faceLandmarks'
import { locateFaceMeshFile } from '../utils/mediapipe'
import { loadFaceMesh } from '../utils/loadMediaPipe'

/**
 * MediaPipe Face Mesh — tracks nose, cheeks, forehead for flower placement.
 */
export default function FaceTracker({ video, enabled = true, onAnchors, onFaceVisible }) {
  const rafRef = useRef(null)
  const smoothRef = useRef(null)

  useEffect(() => {
    if (!video || !enabled) return undefined

    let active = true
    let faceMesh = null

    const init = async () => {
      const FaceMesh = await loadFaceMesh()
      if (!active) return

      faceMesh = new FaceMesh({
        locateFile: (file) => locateFaceMeshFile(file),
      })

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      })

      faceMesh.onResults((results) => {
        if (!active) return

        const hasFace = (results.multiFaceLandmarks?.length ?? 0) > 0
        onFaceVisible?.(hasFace)

        const raw = hasFace
          ? extractFaceAnchors(results.multiFaceLandmarks[0])
          : null

        if (raw) {
          smoothRef.current = lerpAnchor(smoothRef.current, raw, 0.35)
          onAnchors?.(smoothRef.current)
        } else {
          onAnchors?.(null)
        }
      })

      const processFrame = async () => {
        if (!active || !faceMesh || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(processFrame)
          return
        }
        await faceMesh.send({ image: video })
        rafRef.current = requestAnimationFrame(processFrame)
      }

      rafRef.current = requestAnimationFrame(processFrame)
    }

    init()

    return () => {
      active = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      faceMesh?.close?.()
    }
  }, [video, enabled, onAnchors, onFaceVisible])

  return null
}
