import { useCallback } from 'react'
import { playChordPreview, stopChordPreview } from '../utils/padSynth'

export function useChordPreview() {
  const preview = useCallback((notes) => {
    playChordPreview(notes)
  }, [])

  const stop = useCallback(() => {
    stopChordPreview()
  }, [])

  return { preview, stop }
}
