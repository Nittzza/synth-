import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { isAudioStarted, startAudio } from '../utils/audioBoot'

/**
 * Optional: microphone RMS → [0, 1] for louder/softer chords while performing.
 * Chords do NOT need the mic — preview and gesture playback use the synth only.
 * Not wired in App by default (avoids a mic permission prompt).
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
