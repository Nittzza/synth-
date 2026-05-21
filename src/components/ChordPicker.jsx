import { Fragment, useMemo, useState } from 'react'
import {
  ROOTS,
  QUALITIES,
  createChord,
  chordId,
} from '../utils/chordTheory'
import { MAX_CHORDS } from '../utils/chords'
import { useChordPreview } from '../hooks/useChordPreview'
import { ChordPickerScene } from './ChordPickerScene'
import { BackgroundSparkles, CornerDecorations } from './ChordPickerDecor'

const TITLE_SRC = '/images/title-synth-wave.png?v=6'

function formatRootHeader(root) {
  return root.toLowerCase()
}

/**
 * Synth Wave chord picker — reference mockup layout.
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
    <div className="synth-wave-picker">
      <ChordPickerScene />

      <div className="sw-page-center">
        <div className="sw-outer-card">
          <CornerDecorations />
          <BackgroundSparkles />
          <div className="sw-outer-card__inner">
            <div className="sw-content-column">
            <header className="synth-wave-picker__header">
              <div className="selected-badge">
                ☆ {selected.length} / {MAX_CHORDS} selected
              </div>

              <div className="synth-wave-picker__header-main">
                <h1 className="synth-wave-picker__title-wrap">
                  <img
                    src={TITLE_SRC}
                    className="synth-wave-picker__title-img"
                    alt="synth wave"
                    draggable={false}
                  />
                </h1>

                <div className="synth-wave-picker__dropdowns">
                  <button type="button" className="synth-wave-picker__dropdown">
                    choose up to {MAX_CHORDS} chords{' '}
                    <span className="synth-wave-picker__caret">▼</span>
                  </button>
                </div>
              </div>
            </header>

            <section className="synth-wave-picker__matrix-section">
              <p className="synth-wave-picker__scroll-hint" aria-hidden>
                swipe notes →
              </p>
              <div className="synth-wave-picker__matrix-panel">
                <div className="chord-grid">
                  <div className="chord-grid__corner" />
                  {ROOTS.map((root) => (
                    <div key={root} className="col-header">
                      {formatRootHeader(root)}
                    </div>
                  ))}

                  {QUALITIES.map(({ id: quality, rowLabel }) => (
                    <Fragment key={quality}>
                      <div className="row-header">{rowLabel}</div>
                      {ROOTS.map((root) => {
                        const id = chordId(root, quality)
                        const isSelected = selectedIds.has(id)
                        const isDisabled =
                          !isSelected && selected.length >= MAX_CHORDS
                        const chord = createChord(root, quality)

                        return (
                          <button
                            key={id}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => toggleChord(root, quality)}
                            className={[
                              'chord-cell',
                              isSelected && 'selected',
                              isDisabled && 'chord-cell--disabled',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            title={chord.label}
                          >
                            {chord.label}
                          </button>
                        )
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
            </section>

            <footer className="synth-wave-picker__footer">
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => onContinue(selected)}
                className="assign-btn"
              >
                assign gestures
              </button>
            </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
