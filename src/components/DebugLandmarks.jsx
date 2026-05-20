import { useEffect, useRef } from 'react'

const FINGER_TIP_INDICES = [4, 8, 12, 16, 20]

// Subsample face mesh for debug (every Nth landmark)
const FACE_STEP = 12

/**
 * Draw hand fingertips, face mesh points, and cheek bloom anchors on a 2D overlay.
 * Coords are normalized; x is flipped to match mirrored webcam display.
 */
export default function DebugLandmarks({ handLandmarks, faceLandmarks, anchors, videoWidth, videoHeight }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (videoWidth && videoHeight) {
      canvas.width = videoWidth
      canvas.height = videoHeight
    }

    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height

    ctx.clearRect(0, 0, w, h)

    const toScreen = (x, y) => ({
      x: (1 - x) * w,
      y: y * h,
    })

    // Face mesh (cyan, subsampled)
    if (faceLandmarks?.length) {
      ctx.fillStyle = 'rgba(100, 220, 255, 0.45)'
      for (let i = 0; i < faceLandmarks.length; i += FACE_STEP) {
        const lm = faceLandmarks[i]
        const p = toScreen(lm.x, lm.y)
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Hand skeleton + fingertips (magenta)
    if (handLandmarks?.length >= 21) {
      ctx.strokeStyle = 'rgba(255, 120, 200, 0.5)'
      ctx.lineWidth = 1
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [0, 9], [9, 10], [10, 11], [11, 12],
        [0, 13], [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        [5, 9], [9, 13], [13, 17],
      ]
      ctx.beginPath()
      edges.forEach(([a, b]) => {
        const pa = toScreen(handLandmarks[a].x, handLandmarks[a].y)
        const pb = toScreen(handLandmarks[b].x, handLandmarks[b].y)
        ctx.moveTo(pa.x, pa.y)
        ctx.lineTo(pb.x, pb.y)
      })
      ctx.stroke()

      FINGER_TIP_INDICES.forEach((idx) => {
        const lm = handLandmarks[idx]
        const p = toScreen(lm.x, lm.y)
        ctx.fillStyle = 'rgba(255, 80, 180, 1)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      })
    }

    // Cheek bloom anchors (gold)
    if (anchors) {
      const points = [
        { pt: anchors.bloomLeft, label: 'L' },
        { pt: anchors.bloomRight, label: 'R' },
        { pt: anchors.leftCheek, label: '' },
        { pt: anchors.rightCheek, label: '' },
        { pt: anchors.nose, label: 'n' },
      ]
      points.forEach(({ pt, label }) => {
        if (!pt) return
        const p = toScreen(pt.x, pt.y)
        ctx.fillStyle = 'rgba(255, 220, 120, 0.9)'
        ctx.beginPath()
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.lineWidth = 2
        ctx.stroke()
        if (label) {
          ctx.fillStyle = 'rgba(0,0,0,0.7)'
          ctx.font = '10px sans-serif'
          ctx.fillText(label, p.x - 4, p.y + 4)
        }
      })
    }
  }, [handLandmarks, faceLandmarks, anchors, videoWidth, videoHeight])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-[15] h-full w-full"
      width={videoWidth || 1280}
      height={videoHeight || 720}
    />
  )
}
