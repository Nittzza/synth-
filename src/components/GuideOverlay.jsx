import { GESTURE_SLOTS } from '../utils/chords'
import { KEY_COLORS } from '../utils/chordTheory'

export default function GuideOverlay({ handVisible, gesture, activeChord, gestureMap }) {
  const slots = GESTURE_SLOTS.filter((s) => gestureMap?.[s.gesture])

  return (
    <div className="pointer-events-none absolute inset-0 z-10 p-6">
      <div className="flex flex-wrap gap-2">
        <StatusPill ok={handVisible} label={handVisible ? 'Hand found' : 'No hand'} />
        {gesture != null && (
          <StatusPill
            ok
            label={
              GESTURE_SLOTS.find((s) => s.gesture === gesture)?.label ?? String(gesture)
            }
          />
        )}
      </div>

      <div className="absolute bottom-28 right-6 max-w-[min(280px,calc(100vw-3rem))] rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">
        <p className="mb-2 text-center text-[10px] font-light uppercase tracking-[0.2em] text-white/50">
          Your chord map
        </p>
        <div className="space-y-1.5">
          {slots.map((slot) => {
            const chord = gestureMap[slot.gesture]
            const isActive = gesture === slot.gesture
            return (
              <div
                key={slot.gesture}
                className={`flex justify-between text-xs ${isActive ? 'text-white' : 'text-white/50'}`}
              >
                <span>{slot.label}</span>
                <span style={{ color: isActive ? KEY_COLORS[chord.root] : undefined }}>
                  {chord.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatusPill({ ok, label }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs tracking-wide backdrop-blur-sm ${
        ok ? 'bg-emerald-500/20 text-emerald-200/90' : 'bg-white/10 text-white/50'
      }`}
    >
      {ok ? '●' : '○'} {label}
    </span>
  )
}
