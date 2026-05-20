import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { isAudioStarted, startAudio } from '../utils/audioBoot'

/**
 * Microphone RMS mapped to [0, 1] for bloom / particle intensity.
 * Only opens the mic after audio has been unlocked by a user gesture.
 */
export function useVoiceLevel(enabled = true) {
  const [level, setLevel] = useState(0)
  const meterRef = useRef(null)
  const micRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!enabled || !isAudioStarted()) return undefined

    let disposed = false

    const setup = async () => {
      try {
        await startAudio()
        const meter = new Tone.Meter({ smoothing: 0.85, normalRange: true })
        const mic = new Tone.UserMedia()
        await mic.open()
        mic.connect(meter)
        meterRef.current = meter
        micRef.current = mic

        const tick = () => {
          if (disposed) return
          const raw = meter.getValue()
          const v = typeof raw === 'number' ? Math.min(1, Math.max(0, raw * 2.2)) : 0
          setLevel(v)
          rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
      } catch {
        setLevel(0)
      }
    }

    setup()

    return () => {
      disposed = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      micRef.current?.close?.()
      micRef.current?.dispose?.()
      meterRef.current?.dispose?.()
      micRef.current = null
      meterRef.current = null
    }
  }, [enabled])

  return level
}
