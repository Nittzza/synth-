import { useCallback, useMemo, useState } from 'react'
import CameraFeed from './components/CameraFeed'
import VisionTracker from './components/VisionTracker'
import HandTrackingOverlay from './components/HandTrackingOverlay'
import AudioEngine from './components/AudioEngine'
import { startAudio } from './utils/audioBoot'
import { DEFAULT_PRESET_ID } from './utils/synthPresets'
import { setSynthPreset, getActivePresetLabel, wakeAudioOutput } from './utils/padSynth'
import GuideOverlay from './components/GuideOverlay'
import ChordPicker from './components/ChordPicker'
import SoundPicker from './components/SoundPicker'
import GestureAssignment from './components/GestureAssignment'
import { buildGestureMap, getChordFromGesture } from './utils/chords'
import { isStopGesture } from './utils/gestures'
import { useSmoothValue } from './hooks/useSmoothValue'
import { useVoiceLevel } from './hooks/useVoiceLevel'

/** pick → sound → assign → perform */
export default function App() {
  const [phase, setPhase] = useState('pick')
  const [selectedChords, setSelectedChords] = useState([])
  const [synthPresetId, setSynthPresetId] = useState(DEFAULT_PRESET_ID)
  const [gestureMap, setGestureMap] = useState({})

  const [video, setVideo] = useState(null)
  const [gesture, setGesture] = useState(null)
  const [handVisible, setHandVisible] = useState(false)
  const [handLandmarks, setHandLandmarks] = useState(null)
  const [trackingStatus, setTrackingStatus] = useState('idle')
  const [audioReady, setAudioReady] = useState(false)

  const performing = phase === 'perform'

  const stopAll = handVisible && isStopGesture(gesture)

  const activeChord = useMemo(() => {
    if (!handVisible || !gesture || stopAll) return null
    return getChordFromGesture(gestureMap, gesture)
  }, [gestureMap, gesture, handVisible, stopAll])

  const voiceRaw = useVoiceLevel(performing && !!activeChord)
  const voiceLevel = useSmoothValue(voiceRaw, 0.1)

  const handleVideoReady = useCallback((el) => {
    setVideo(el)
  }, [])

  const handleGesture = useCallback((g) => setGesture(g), [])

  const handleHandVisible = useCallback((v) => {
    setHandVisible(v)
    if (!v) {
      setGesture(null)
    } else if (performing) {
      wakeAudioOutput()
    }
  }, [performing])

  const handleStatus = useCallback((s) => setTrackingStatus(s), [])

  const handleChordsContinue = (chords) => {
    setSelectedChords(chords)
    setPhase('sound')
  }

  const handleSoundContinue = (presetId) => {
    setSynthPresetId(presetId)
    setSynthPreset(presetId)
    setPhase('assign')
  }

  const handleBeginPerformance = async () => {
    try {
      await startAudio()
      setAudioReady(true)
    } catch {
      /* ok */
    }
    setSynthPreset(synthPresetId)
    const { map } = buildGestureMap(selectedChords)
    setGestureMap(map)
    setGesture(null)
    setPhase('perform')
  }

  if (phase === 'pick') {
    return <ChordPicker onContinue={handleChordsContinue} />
  }

  if (phase === 'sound') {
    return (
      <SoundPicker
        selectedChords={selectedChords}
        initialPresetId={synthPresetId}
        onBack={() => setPhase('pick')}
        onContinue={handleSoundContinue}
      />
    )
  }

  if (phase === 'assign') {
    return (
      <GestureAssignment
        selectedChords={selectedChords}
        synthLabel={getActivePresetLabel()}
        onBack={() => setPhase('sound')}
        onBegin={handleBeginPerformance}
      />
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050508]">
      <CameraFeed onReady={handleVideoReady} />

      {video && (
        <>
          <HandTrackingOverlay
            video={video}
            landmarks={handLandmarks}
            gesture={gesture}
          />
          <VisionTracker
            video={video}
            onGesture={handleGesture}
            onHandVisible={handleHandVisible}
            onLandmarks={setHandLandmarks}
            onStatus={handleStatus}
          />
          {audioReady && (
            <AudioEngine
              activeChord={activeChord}
              handVisible={handVisible}
              stopAll={stopAll}
              intensity={voiceLevel}
            />
          )}
        </>
      )}

      {trackingStatus === 'loading' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
          <p className="text-sm tracking-widest text-white/60 uppercase">
            Loading hand tracking…
          </p>
        </div>
      )}

      {trackingStatus === 'error' && (
        <div className="absolute bottom-24 left-0 right-0 z-30 px-6 text-center pointer-events-none">
          <p className="text-sm text-red-300/80">
            Tracking failed to load. Check your internet connection and refresh.
          </p>
        </div>
      )}

      <GuideOverlay
        handVisible={handVisible}
        gesture={gesture}
        activeChord={activeChord}
        gestureMap={gestureMap}
      />

      <div className="pointer-events-none absolute bottom-8 left-0 right-0 z-20 text-center">
        <p
          className="text-5xl font-light italic tracking-[0.15em] text-white/60"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {activeChord?.label ?? '—'}
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-widest text-white/30">
          {getActivePresetLabel()}
        </p>
        <p className="mt-3 text-sm text-white/45">
          {!handVisible && 'Raise your hand in front of the camera'}
          {handVisible && !gesture && 'Hold ☝️ ✌️ 🤟 or 🖐️ steady for a moment'}
          {stopAll && '✊ Stopped — show a chord gesture to play again'}
          {handVisible && gesture && !stopAll && !activeChord && 'Gesture not in your chord map'}
          {activeChord && `Playing ${activeChord.label}`}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setPhase('pick')}
        className="absolute right-4 top-4 z-30 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[10px] tracking-widest text-white/40 uppercase backdrop-blur-sm hover:text-white/70"
      >
        Change chords
      </button>
    </div>
  )
}
