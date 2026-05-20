import { gestureDisplayName } from '../utils/gestures'

function DebugRow({ label, value, on }) {
  return (
    <div className="flex justify-between gap-3 text-[10px] font-mono">
      <span className="text-white/45">{label}</span>
      <span className={on ? 'text-emerald-300' : 'text-white/25'}>{value}</span>
    </div>
  )
}

/**
 * Live gesture debug — raw + stabilized names, per-finger booleans, handedness.
 */
export default function GestureDebugOverlay({ analysis, stableGesture, handVisible }) {
  if (!handVisible) return null

  const fingers = analysis?.fingers
  const stableName = gestureDisplayName(stableGesture)
  const rawName = analysis?.gestureName ?? '—'

  return (
    <div className="pointer-events-none absolute left-4 top-4 z-20 max-w-[220px] rounded-xl border border-white/15 bg-black/55 px-3 py-2.5 font-mono backdrop-blur-md">
      <p className="mb-2 text-[9px] uppercase tracking-[0.2em] text-white/40">Gesture debug</p>
      <p className="mb-1 text-xs text-white/90">
        Stable: <span className="text-amber-200">{stableName}</span>
      </p>
      <p className="mb-2 text-[10px] text-white/50">
        Raw: <span className="text-white/70">{rawName}</span>
      </p>
      {fingers && (
        <div className="mb-2 space-y-0.5 border-t border-white/10 pt-2">
          <DebugRow
            label="thumbExtended"
            value={fingers.thumb ? '1' : '0'}
            on={fingers.thumb}
          />
          <DebugRow
            label="indexExtended"
            value={fingers.index ? '1' : '0'}
            on={fingers.index}
          />
          <DebugRow
            label="middleExtended"
            value={fingers.middle ? '1' : '0'}
            on={fingers.middle}
          />
          <DebugRow
            label="ringExtended"
            value={fingers.ring ? '1' : '0'}
            on={fingers.ring}
          />
          <DebugRow
            label="pinkyExtended"
            value={fingers.pinky ? '1' : '0'}
            on={fingers.pinky}
          />
        </div>
      )}
      <div className="space-y-0.5 border-t border-white/10 pt-2">
        <DebugRow
          label="count"
          value={String(analysis?.fingerCount ?? 0)}
          on={(analysis?.fingerCount ?? 0) > 0}
        />
        <DebugRow
          label="hand"
          value={analysis?.handedness ?? '—'}
          on={analysis?.handedness !== 'Unknown'}
        />
      </div>
      <div className="mt-2 space-y-0.5 border-t border-white/10 pt-2">
        <DebugRow label="splay" value={analysis?.thumbSplay ? '1' : '0'} on={analysis?.thumbSplay} />
        <DebugRow label="fold" value={analysis?.thumbFolded ? '1' : '0'} on={analysis?.thumbFolded} />
      </div>
      <div className="mt-2 space-y-0.5 border-t border-white/10 pt-2">
        <DebugRow
          label="fourLongUp"
          value={analysis?.fourLongUp ? '1' : '0'}
          on={analysis?.fourLongUp}
        />
        <DebugRow
          label="openPalm"
          value={analysis?.openPalmMatch ? '1' : '0'}
          on={analysis?.openPalmMatch}
        />
      </div>
      <p className="mt-2 text-[8px] text-white/30">
        ☝️ point · ✌️ peace · 🤟 rock · 🖐️ all out · 👌 OK · 👍 up
      </p>
    </div>
  )
}
