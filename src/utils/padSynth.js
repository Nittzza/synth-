import * as Tone from 'tone'
import { startAudio } from './audioBoot'
import {
  buildHarmoniumChain,
  disposeHarmoniumChain,
  isHarmoniumPreset,
  prepareHarmoniumChain,
} from './harmoniumSampler'
import {
  DEFAULT_PRESET_ID,
  SYNTH_PRESETS,
  getPresetConfig,
  getPresetMeta,
} from './synthPresets'

/** @typedef {import('./synthPresets').SYNTH_PRESETS[string]} PresetConfig */

let chainPromise = null
let activePresetId = DEFAULT_PRESET_ID
let activeChain = null
const heldNotes = new Set()

const VOICE_MAP = {
  synth: Tone.Synth,
  am: Tone.AMSynth,
  fm: Tone.FMSynth,
}

export function getActivePresetId() {
  return activePresetId
}

export function getActivePresetLabel() {
  return getPresetMeta(activePresetId).label
}

/** Switch sound type — rebuilds audio chain on next play */
export function setSynthPreset(presetId) {
  const next = SYNTH_PRESETS[presetId] ? presetId : DEFAULT_PRESET_ID
  if (next === activePresetId && chainPromise) return
  activePresetId = next
  disposeChain()
}

function disposeChain() {
  if (activeChain) {
    try {
      if (activeChain.isHarmonium) {
        disposeHarmoniumChain(activeChain)
      } else {
        activeChain.chorus?.stop?.()
        activeChain.holdSynth?.dispose?.()
        activeChain.previewSynth?.dispose?.()
        activeChain.vibrato?.dispose?.()
        activeChain.filter?.dispose?.()
        activeChain.eq?.dispose?.()
        activeChain.chorus?.dispose?.()
        activeChain.reverb?.dispose?.()
        activeChain.outputGain?.dispose?.()
      }
    } catch {
      /* ok */
    }
    activeChain = null
  }
  chainPromise = null
  heldNotes.clear()
}

function buildChain(preset) {
  const c = preset.chain
  const outputGain = new Tone.Gain(1).toDestination()

  const reverb = new Tone.Reverb({
    decay: c.reverbDecay ?? 9,
    wet: c.reverbWet ?? 0.5,
    preDelay: 0.08,
  }).connect(outputGain)

  const chorus = new Tone.Chorus({
    frequency: 0.28,
    delayTime: 4.8,
    depth: c.chorusDepth ?? 0.55,
    wet: c.chorusWet ?? 0.42,
  }).connect(reverb)

  const eq = new Tone.EQ3({
    low: c.eqLow ?? -1,
    mid: c.eqMid ?? 2,
    high: c.eqHigh ?? 5,
    lowFrequency: 260,
    highFrequency: 3400,
  }).connect(chorus)

  const filter = new Tone.Filter({
    frequency: c.filterHz ?? 2400,
    type: c.filterType ?? 'lowpass',
    Q: c.filterQ ?? 0.55,
  })

  let vibrato = null
  if (c.vibrato) {
    vibrato = new Tone.Vibrato(c.vibratoFrequency ?? 5, c.vibratoDepth ?? 0.1)
    filter.connect(vibrato)
    vibrato.connect(eq)
  } else {
    filter.connect(eq)
  }

  const Voice = VOICE_MAP[preset.voice] ?? Tone.Synth
  const holdSynth = new Tone.PolySynth(Voice, preset.hold).connect(filter)
  const previewSynth = new Tone.PolySynth(Voice, preset.preview).connect(filter)

  return { holdSynth, previewSynth, filter, vibrato, eq, chorus, reverb, outputGain }
}

function getHoldTimings() {
  if (isHarmoniumPreset(activePresetId)) {
    return { attackStagger: 0.04, releaseDelay: 0.08, releaseTime: 1.35 }
  }
  return { attackStagger: 0.035, releaseDelay: 0.06, releaseTime: 1.0 }
}

export async function getPadChain() {
  await startAudio()
  if (chainPromise) return chainPromise

  chainPromise = (async () => {
    let chain
    if (isHarmoniumPreset(activePresetId)) {
      chain = buildHarmoniumChain()
      chain.isHarmonium = true
      await prepareHarmoniumChain(chain)
    } else {
      const preset = getPresetConfig(activePresetId)
      chain = buildChain(preset)
      await chain.reverb.ready
      chain.chorus.start()
    }
    activeChain = chain
    return chain
  })()

  return chainPromise
}

export async function playChordPreview(notes) {
  if (!notes?.length) return
  const { previewSynth } = await getPadChain()
  const dur = isHarmoniumPreset(activePresetId) ? '2.4' : '1.8'
  const stagger = isHarmoniumPreset(activePresetId) ? 0.05 : 0.03
  previewSynth.releaseAll(0.02)
  notes.forEach((note, i) => {
    previewSynth.triggerAttackRelease(note, dur, `+${i * stagger}`)
  })
}

/** Preview a specific preset without selecting it permanently */
export async function auditionPreset(presetId, notes) {
  const prev = activePresetId
  setSynthPreset(presetId)
  await playChordPreview(notes)
  return prev
}

export async function stopChordPreview() {
  const chain = await chainPromise
  if (!chain?.previewSynth) return
  chain.previewSynth.releaseAll(0.02)
}

export async function switchChordHold(notes) {
  if (!notes?.length) return
  const { holdSynth } = await getPadChain()
  restoreOutputLevel()
  const next = new Set(notes)
  const prev = [...heldNotes]
  const t = getHoldTimings()

  const releasing = prev.filter((note) => !next.has(note))
  const adding = notes.filter((note) => !heldNotes.has(note))

  // Overlap-first: fade in new chord, then release departing notes so level never drops
  adding.forEach((note, i) => {
    holdSynth.triggerAttack(note, `+${i * t.attackStagger}`)
  })

  if (releasing.length > 0) {
    const releaseStart =
      t.releaseDelay + t.attackStagger * Math.max(0, adding.length - 1)
    releasing.forEach((note) => {
      holdSynth.triggerRelease(note, `+${releaseStart}`)
    })
  }

  heldNotes.clear()
  notes.forEach((n) => heldNotes.add(n))
}

export async function playChordHold(notes) {
  return switchChordHold(notes)
}

export async function releaseHeldChord(fadeSec = 0.45) {
  return stopPerformanceAudio(fadeSec)
}

/** Stop performance notes when the hand leaves — gentle note release, no hard output mute */
export async function stopPerformanceAudio(noteFadeSec = 0.45) {
  const chain = await chainPromise
  if (!chain?.holdSynth) return

  if (heldNotes.size > 0) {
    for (const note of heldNotes) {
      chain.holdSynth.triggerRelease(note, noteFadeSec)
    }
  } else {
    chain.holdSynth.releaseAll(noteFadeSec)
  }
  heldNotes.clear()
}

export function restoreOutputLevel() {
  if (!activeChain?.outputGain) return
  const now = Tone.now()
  activeChain.outputGain.gain.cancelScheduledValues(now)
  activeChain.outputGain.gain.rampTo(1, 0.15)
}

/** Call when hand returns so audio is not stuck muted after a stop */
export function wakeAudioOutput() {
  restoreOutputLevel()
}

export async function forceStopPad() {
  const chain = await chainPromise
  if (!chain?.holdSynth) return
  chain.holdSynth.releaseAll(0.02)
  chain.previewSynth?.releaseAll(0.02)
  heldNotes.clear()
  const now = Tone.now()
  chain.outputGain?.gain.cancelScheduledValues(now)
  chain.outputGain?.gain.setValueAtTime(0, now)
}
