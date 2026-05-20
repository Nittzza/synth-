import { useState } from 'react'
import { buildChordNotes } from '../utils/chordTheory'
import { SYNTH_PRESET_LIST } from '../utils/synthPresets'
import { setSynthPreset, playChordPreview, stopChordPreview } from '../utils/padSynth'
import { startAudio } from '../utils/audioBoot'

const BUBBLES = [
  { left: '6%', size: 10, duration: 16, delay: 0 },
  { left: '18%', size: 6, duration: 22, delay: 4 },
  { left: '32%', size: 14, duration: 19, delay: 1 },
  { left: '48%', size: 8, duration: 24, delay: 7 },
  { left: '62%', size: 11, duration: 17, delay: 2 },
  { left: '75%', size: 7, duration: 21, delay: 9 },
  { left: '88%', size: 9, duration: 18, delay: 5 },
  { left: '42%', size: 5, duration: 26, delay: 11 },
  { left: '55%', size: 12, duration: 20, delay: 3 },
  { left: '94%', size: 6, duration: 23, delay: 8 },
]

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
    <div className="chord-picker-scene flex h-full w-full flex-col overflow-hidden">
      <div className="chord-picker-scene__bg" aria-hidden />
      <div className="chord-picker-scene__veil" aria-hidden />
      <div className="chord-picker-scene__shimmer" aria-hidden />
      <div className="chord-picker-scene__sparkles" aria-hidden />
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="chord-picker-scene__bubble"
          aria-hidden
          style={{
            left: b.left,
            width: b.size,
            height: b.size,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      <header className="chord-picker-scene__bar relative z-10 shrink-0 border-b px-4 py-3">
        <h1
          className="text-2xl font-light italic text-white drop-shadow-[0_1px_12px_rgba(80,100,160,0.5)]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Choose your sound
        </h1>
        <p className="mt-0.5 text-xs text-white/70 drop-shadow-sm">
          Tap to preview · pick one for gestures
        </p>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-2 py-2">
        <div className="sound-picker-scene__grid">
          {SYNTH_PRESET_LIST.map((p) => {
            const isSelected = selectedId === p.id
            const isPlaying = auditioning === p.id

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelect(p.id)}
                className={[
                  'sound-picker-scene__card flex flex-col items-center justify-center rounded-lg px-2 py-2 text-center transition-all duration-150',
                  isSelected && 'sound-picker-scene__card--selected z-10 scale-[1.04]',
                  !isSelected && 'hover:brightness-110',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  backgroundColor: isSelected
                    ? 'color-mix(in srgb, white 42%, transparent)'
                    : 'color-mix(in srgb, white 32%, transparent)',
                }}
                title={`${p.description} — ${p.bestFor}`}
              >
                <span className="text-xs font-black leading-tight text-black sm:text-sm">
                  {p.label}
                </span>
                {(isPlaying || isSelected) && (
                  <span className="mt-1 text-[8px] font-bold uppercase tracking-wide text-black/55 sm:text-[9px]">
                    {isPlaying ? '▶' : '✓'}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <footer className="chord-picker-scene__bar relative z-10 flex shrink-0 gap-2 border-t px-4 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="sound-picker-scene__card flex-1 rounded-lg py-2 text-xs font-bold tracking-wider text-white/80 transition-all hover:brightness-110"
          style={{ backgroundColor: 'color-mix(in srgb, white 30%, transparent)' }}
        >
          ← Chords
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="sound-picker-scene__card sound-picker-scene__card--selected flex-[2] rounded-lg py-2 text-xs font-black tracking-[0.15em] text-white uppercase transition-all hover:brightness-110"
          style={{ backgroundColor: 'color-mix(in srgb, white 40%, transparent)' }}
        >
          Use this sound →
        </button>
      </footer>
    </div>
  )
}
