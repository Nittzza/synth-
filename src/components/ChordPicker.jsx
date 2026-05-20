import { useMemo, useState } from 'react'
import {
  ROOTS,
  QUALITIES,
  KEY_COLORS,
  createChord,
  chordId,
} from '../utils/chordTheory'
import { MAX_CHORDS } from '../utils/chords'
import { useChordPreview } from '../hooks/useChordPreview'

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
 * Omnichord-style chord grid over a dreamy underwater backdrop.
 */
export default function ChordPicker({ onContinue }) {
  const [selected, setSelected] = useState([])
  const { preview, stop } = useChordPreview()

  const selectedIds = useMemo(() => new Set(selected.map((c) => c.id)), [selected])

  const toggleChord = (root, quality) => {
    const id = chordId(root, quality)
    if (selectedIds.has(id)) {
      setSelected((prev) => prev.filter((c) => c.id !== id))
      stop()
      return
    }
    if (selected.length >= MAX_CHORDS) return

    const chord = createChord(root, quality)
    setSelected((prev) => [...prev, chord])
    preview(chord.notes)
  }

  const canContinue = selected.length >= 1

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
          Synth Bloom
        </h1>
        <p className="mt-0.5 text-xs text-white/70 drop-shadow-sm">
          Choose up to {MAX_CHORDS} chords · major · minor · M7 · m7 · 7 · aug · dim
        </p>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden px-2 py-2">
        <div className="chord-picker-scene__panel flex min-h-0 flex-1 flex-col p-1.5">
          <div className="mb-0.5 grid shrink-0 grid-cols-12 gap-px">
            {ROOTS.map((root) => (
              <div
                key={root}
                className="text-center text-[8px] font-medium tracking-wide text-white/75 drop-shadow-sm"
              >
                {root}
              </div>
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-rows-7 gap-px">
            {QUALITIES.map(({ id: quality }) => (
              <div key={quality} className="grid min-h-0 grid-cols-12 gap-px">
                {ROOTS.map((root) => {
                  const id = chordId(root, quality)
                  const isSelected = selectedIds.has(id)
                  const isDisabled = !isSelected && selected.length >= MAX_CHORDS
                  const chord = createChord(root, quality)

                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => toggleChord(root, quality)}
                      className={[
                        'chord-picker-scene__cell flex min-h-0 min-w-0 items-center justify-center rounded-[3px] text-xs font-black leading-tight transition-all duration-150',
                        'text-black',
                        isSelected && 'chord-picker-scene__cell--selected z-10 scale-[1.04]',
                        isDisabled
                          ? 'cursor-not-allowed opacity-25'
                          : 'hover:brightness-110',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{
                        backgroundColor: `color-mix(in srgb, ${KEY_COLORS[root]} ${isSelected ? '58%' : '48%'}, transparent)`,
                      }}
                      title={chord.label}
                    >
                      {chord.label}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="chord-picker-scene__bar relative z-10 shrink-0 border-t px-4 py-2.5">
        <div className="mb-2 flex min-h-[1.25rem] flex-wrap gap-1.5">
          {selected.length === 0 ? (
            <span className="text-xs text-white/60 drop-shadow-sm">Tap chords to add them…</span>
          ) : (
            selected.map((c, i) => (
              <span
                key={c.id}
                className="chord-picker-scene__cell rounded-full px-2 py-0.5 text-xs font-black text-black"
                style={{
                  backgroundColor: `color-mix(in srgb, ${KEY_COLORS[c.root]} 55%, transparent)`,
                }}
              >
                {i + 1}. {c.label}
              </span>
            ))
          )}
        </div>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => onContinue(selected)}
          className="w-full rounded-lg border border-white/20 bg-white/15 py-2 text-xs tracking-[0.2em] text-white/90 uppercase backdrop-blur-sm transition-all
            hover:bg-white/25 hover:text-white
            disabled:cursor-not-allowed disabled:opacity-30"
        >
          Assign gestures →
        </button>
      </footer>
    </div>
  )
}
