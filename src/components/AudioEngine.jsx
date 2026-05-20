import { useCallback, useEffect, useRef } from 'react'
import {
  getPadChain,
  switchChordHold,
  stopPerformanceAudio,
  forceStopPad,
  restoreOutputLevel,
} from '../utils/padSynth'

export default function AudioEngine({
  activeChord,
  handVisible = false,
  stopAll = false,
  intensity = 0.3,
}) {
  const currentIdRef = useRef(null)
  const holdSynthRef = useRef(null)
  const applyGenRef = useRef(0)

  const ensureSynth = useCallback(async () => {
    const { holdSynth } = await getPadChain()
    holdSynthRef.current = holdSynth
    return holdSynth
  }, [])

  useEffect(() => {
    const gen = ++applyGenRef.current

    const apply = async () => {
      await ensureSynth()
      if (gen !== applyGenRef.current) return

      if (stopAll) {
        currentIdRef.current = null
        await forceStopPad()
        return
      }

      restoreOutputLevel()

      if (!activeChord?.notes?.length) {
        if (currentIdRef.current != null) {
          currentIdRef.current = null
          // Keep sustaining through brief gesture gaps; only stop when the hand leaves
          if (!handVisible) {
            await stopPerformanceAudio(0.45)
          }
        }
        return
      }

      const nextId = activeChord.id
      if (nextId === currentIdRef.current) return

      currentIdRef.current = nextId
      await switchChordHold(activeChord.notes)
    }

    apply()

    return () => {
      applyGenRef.current += 1
    }
  }, [activeChord, handVisible, stopAll, ensureSynth])

  useEffect(() => {
    const synth = holdSynthRef.current
    if (!synth || !activeChord) return
    synth.volume.rampTo(-14 + intensity * 6, 0.4)
  }, [intensity, activeChord])

  return null
}
