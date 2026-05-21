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
/** Steady perform volume — mic is not required for chords to play (see useVoiceLevel). */
const PERFORM_INTENSITY = 0.35

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
  const [gestureAnalysis, setGestureAnalysis] = useState(null)
  const [trackingStatus, setTrackingStatus] = useState('idle')
  const [audioReady, setAudioReady] = useState(false)

  const performing = phase === 'perform'

  const activeChord = useMemo(() => {
    if (!handVisible || !gesture) return null
    return getChordFromGesture(gestureMap, gesture)
  }, [gestureMap, gesture, handVisible])

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
    <div className="perform-phase relative h-full w-full overflow-hidden bg-[#050508]">
      <CameraFeed onReady={handleVideoReady} />

      {video && (
        <>
          <HandTrackingOverlay
            video={video}
            landmarks={handLandmarks}
            gesture={gesture}
            fingerStates={gestureAnalysis?.fingers}
          />
          <VisionTracker
            video={video}
            onGesture={handleGesture}
            onHandVisible={handleHandVisible}
            onLandmarks={setHandLandmarks}
            onGestureAnalysis={setGestureAnalysis}
            onStatus={handleStatus}
          />
          {audioReady && (
            <AudioEngine
              activeChord={activeChord}
              handVisible={handVisible}
              stopAll={false}
              intensity={PERFORM_INTENSITY}
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

      <div className="perform-phase__hud pointer-events-none absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 text-center">
        <p className="perform-phase__chord-label">{activeChord?.label ?? '—'}</p>
        <p className="perform-phase__preset">{getActivePresetLabel()}</p>
        <p className="perform-phase__hint">
          {!handVisible && 'Raise your hand in front of the camera'}
          {handVisible && !gesture && 'Hold ☝️ · ✌️ · 🤟 · 🖐️ · 👍 steady'}
          {handVisible && gesture && !activeChord && 'Gesture not in your chord map'}
          {activeChord && `Playing ${activeChord.label}`}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setPhase('pick')}
        className="perform-phase__exit absolute right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.75rem,env(safe-area-inset-top))] z-30 min-h-[44px] rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[10px] tracking-widest text-white/40 uppercase backdrop-blur-sm hover:text-white/70"
      >
        Change chords
      </button>
    </div>
  )
}
