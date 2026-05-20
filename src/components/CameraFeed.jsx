import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

/**
 * Fullscreen mirrored webcam — stream starts once and is not restarted on parent re-renders.
 */
const CameraFeed = forwardRef(function CameraFeed({ onReady, onError }, ref) {
  const videoRef = useRef(null)
  const [status, setStatus] = useState('loading')
  const onReadyRef = useRef(onReady)
  const onErrorRef = useRef(onError)

  onReadyRef.current = onReady
  onErrorRef.current = onError

  useImperativeHandle(ref, () => videoRef.current)

  useEffect(() => {
    let stream = null
    let cancelled = false

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640, max: 1280 },
            height: { ideal: 480, max: 720 },
            frameRate: { ideal: 30, max: 30 },
          },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }

        const video = videoRef.current
        if (!video) return

        video.srcObject = stream
        await video.play()
        setStatus('ready')
        onReadyRef.current?.(video)
      } catch (err) {
        setStatus('error')
        onErrorRef.current?.(err)
      }
    }

    start()

    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <video
        ref={videoRef}
        className="h-full w-full object-cover scale-x-[-1]"
        playsInline
        muted
        autoPlay
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,5,8,0.45)_100%)]"
        aria-hidden
      />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <p className="text-xl font-light italic tracking-wide text-white/70" style={{ fontFamily: 'var(--font-display)' }}>
            awakening camera…
          </p>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 px-8 text-center">
          <p className="text-lg font-light text-white/70" style={{ fontFamily: 'var(--font-display)' }}>
            Camera access is required for this experience.
          </p>
        </div>
      )}
    </div>
  )
})

export default CameraFeed
