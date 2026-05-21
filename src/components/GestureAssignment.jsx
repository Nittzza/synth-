import { GESTURE_SLOTS } from '../utils/chords'
import { KEY_COLORS } from '../utils/chordTheory'
import { ChordPickerScene } from './ChordPickerScene'
import { BackgroundSparkles, CornerDecorations } from './ChordPickerDecor'

/**
 * Confirm how each selected chord maps to a hand gesture.
 */
export default function GestureAssignment({ selectedChords, synthLabel, onBegin, onBack }) {
  return (
    <div className="synth-wave-picker gesture-assignment">
      <ChordPickerScene />

      <div className="sw-page-center">
        <div className="sw-outer-card">
          <CornerDecorations />
          <BackgroundSparkles />

          <div className="sw-outer-card__inner">
            <div className="sw-content-column">
              <header className="gesture-assignment__header">
                <h1 className="gesture-assignment__title">your gestures</h1>
                <p className="gesture-assignment__subtitle">
                  sound: {synthLabel ?? 'dream pad'} · ☝️ · ✌️ · 🤟 · 🖐️ · 👍
                </p>
              </header>

              <ul className="gesture-assignment__list">
                {selectedChords.map((chord, i) => {
                  const slot = GESTURE_SLOTS[i]
                  return (
                    <li key={chord.id} className="gesture-assignment__card">
                      <span className="gesture-assignment__emoji" aria-hidden>
                        {slot.emoji}
                      </span>
                      <div className="gesture-assignment__card-body">
                        <p className="gesture-assignment__slot-label">{slot.label}</p>
                        {slot.hint && (
                          <p className="gesture-assignment__hint">{slot.hint}</p>
                        )}
                        <p
                          className="gesture-assignment__chord-label"
                          style={{ color: KEY_COLORS[chord.root] }}
                        >
                          {chord.label}
                        </p>
                      </div>
                      <div
                        className="gesture-assignment__swatch"
                        style={{ backgroundColor: KEY_COLORS[chord.root] }}
                        aria-hidden
                      />
                    </li>
                  )
                })}
              </ul>

              <footer className="gesture-assignment__footer">
                <button
                  type="button"
                  onClick={onBack}
                  className="gesture-assignment__btn gesture-assignment__btn--back"
                >
                  ← sound
                </button>
                <button
                  type="button"
                  onClick={onBegin}
                  className="gesture-assignment__btn gesture-assignment__btn--begin"
                >
                  begin performance
                </button>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
