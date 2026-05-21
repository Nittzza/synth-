import { useState } from 'react'
import { buildChordNotes } from '../utils/chordTheory'
import { SYNTH_PRESET_LIST } from '../utils/synthPresets'
import { setSynthPreset, playChordPreview, stopChordPreview } from '../utils/padSynth'
import { startAudio } from '../utils/audioBoot'
import { ChordPickerScene } from './ChordPickerScene'
import { BackgroundSparkles, CornerDecorations } from './ChordPickerDecor'

/**
 * Try each synth type — tap to hear, then pick one for your performance.
 */
export default function SoundPicker({ selectedChords, initialPresetId, onContinue, onBack }) {
  const [selectedId, setSelectedId] = useState(initialPresetId ?? 'dream-pad')
  const [auditioning, setAuditioning] = useState(null)

  const demoNotes =
    selectedChords[0]?.notes?.length
      ? selectedChords[0].notes
      : buildChordNotes('C', 'major', 3)

  const handleAudition = async (id) => {
    setAuditioning(id)
    try {
      await startAudio()
      setSynthPreset(id)
      await playChordPreview(demoNotes)
    } finally {
      setTimeout(() => setAuditioning(null), 400)
    }
  }

  const handleSelect = (id) => {
    stopChordPreview()
    setSelectedId(id)
    setSynthPreset(id)
    handleAudition(id)
  }

  const handleContinue = () => {
    stopChordPreview()
    setSynthPreset(selectedId)
    onContinue(selectedId)
  }

  return (
    <div className="synth-wave-picker sound-picker">
      <ChordPickerScene />

      <div className="sw-page-center">
        <div className="sw-outer-card">
          <CornerDecorations />
          <BackgroundSparkles />

          <div className="sw-outer-card__inner">
            <div className="sw-content-column">
              <header className="sound-picker__header">
                <h1 className="sound-picker__title">choose your sound</h1>
                <p className="sound-picker__subtitle">tap to preview · pick one for gestures</p>
              </header>

              <div className="sound-picker__panel">
                <div className="sound-picker__grid">
                  {SYNTH_PRESET_LIST.map((p) => {
                    const isSelected = selectedId === p.id
                    const isPlaying = auditioning === p.id

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelect(p.id)}
                        className={[
                          'sound-picker__card',
                          isSelected && 'sound-picker__card--selected',
                          isPlaying && 'sound-picker__card--playing',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        title={`${p.description} — ${p.bestFor}`}
                      >
                        <span className="sound-picker__card-label">{p.label}</span>
                        {(isPlaying || isSelected) && (
                          <span className="sound-picker__card-hint">
                            {isPlaying ? '▶' : '✓'}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <footer className="sound-picker__footer">
                <button type="button" onClick={onBack} className="sound-picker__btn sound-picker__btn--back">
                  ← chords
                </button>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="sound-picker__btn sound-picker__btn--continue"
                >
                  use this sound
                </button>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
