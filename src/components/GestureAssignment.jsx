import { GESTURE_SLOTS } from '../utils/chords'
import { KEY_COLORS } from '../utils/chordTheory'

/**
 * Confirm how each selected chord maps to a hand gesture.
 */
export default function GestureAssignment({ selectedChords, synthLabel, onBegin, onBack }) {
  return (
    <div className="flex h-full w-full flex-col bg-[#0d0d10] text-white">
      <header className="shrink-0 border-b border-white/10 px-6 py-5">
        <h1
          className="text-3xl font-light italic text-white/90"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Your gestures
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Sound: <span className="text-white/70">{synthLabel ?? 'Dream Pad'}</span> · ☝️1 · ✌️2 · 🤟3 · 🖐️ palm · ✊ stop
        </p>
      </header>

      <div className="flex flex-1 flex-col justify-center gap-4 px-6 py-8">
        {selectedChords.map((chord, i) => {
          const slot = GESTURE_SLOTS[i]
          return (
            <div
              key={chord.id}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
            >
              <span className="text-3xl">{slot.emoji}</span>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-white/40">{slot.label}</p>
                <p
                  className="text-2xl font-light"
                  style={{ fontFamily: 'var(--font-display)', color: KEY_COLORS[chord.root] }}
                >
                  {chord.label}
                </p>
                <p className="text-xs text-white/35">{synthLabel ?? 'pad'}</p>
              </div>
              <div
                className="h-12 w-12 shrink-0 rounded-lg ring-2 ring-cyan-400/40"
                style={{ backgroundColor: KEY_COLORS[chord.root], opacity: 0.85 }}
                aria-hidden
              />
            </div>
          )
        })}
      </div>

      <footer className="flex shrink-0 gap-3 border-t border-white/10 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-xl border border-white/15 py-3 text-sm tracking-wider text-white/50 hover:bg-white/5"
        >
          ← Sound
        </button>
        <button
          type="button"
          onClick={onBegin}
          className="flex-[2] rounded-xl bg-white/12 py-3 text-sm tracking-[0.2em] uppercase text-white/85 hover:bg-white/18"
        >
          Begin performance
        </button>
      </footer>
    </div>
  )
}
