/**
 * Sampled Indian harmonium (Yale Euterpea Studio, CC0 via Freesound pack 29512).
 * Nine anchor notes ~every minor third — Tone.Sampler repitches between them.
 */
import * as Tone from 'tone'

export const HARMONIUM_PRESET_ID = 'harmonium'

const SAMPLE_BASE = '/samples/harmonium/'

/** @type {Record<string, string>} */
export const HARMONIUM_SAMPLE_URLS = {
  C3: 'C3.mp3',
  Eb3: 'Eb3.mp3',
  Gb3: 'Gb3.mp3',
  A3: 'A3.mp3',
  C4: 'C4.mp3',
  Eb4: 'Eb4.mp3',
  Gb4: 'Gb4.mp3',
  A4: 'A4.mp3',
  C5: 'C5.mp3',
}

export function isHarmoniumPreset(presetId) {
  return presetId === HARMONIUM_PRESET_ID
}

function createHarmoniumSampler({ attack, release, volume }) {
  return new Tone.Sampler({
    urls: HARMONIUM_SAMPLE_URLS,
    baseUrl: SAMPLE_BASE,
    attack,
    release,
    curve: 'exponential',
    volume,
  })
}

/** Warm room chain: filter → EQ → compressor → reverb, plus subtle air bed */
export function buildHarmoniumChain() {
  const outputGain = new Tone.Gain(1).toDestination()

  const reverb = new Tone.Reverb({
    decay: 3.4,
    wet: 0.26,
    preDelay: 0.04,
  }).connect(outputGain)

  const compressor = new Tone.Compressor({
    threshold: -22,
    ratio: 2.4,
    attack: 0.025,
    release: 0.32,
    knee: 10,
  }).connect(reverb)

  const eq = new Tone.EQ3({
    low: 2,
    mid: 3.5,
    high: -3,
    lowFrequency: 180,
    highFrequency: 2600,
  }).connect(compressor)

  const filter = new Tone.Filter({
    frequency: 4000,
    type: 'lowpass',
    Q: 0.65,
  }).connect(eq)

  const air = new Tone.Noise({ type: 'pink', volume: -42 })
  const airFilter = new Tone.Filter({ type: 'highpass', frequency: 700, Q: 0.4 })
  const airGain = new Tone.Gain(0.018)
  air.connect(airFilter).connect(airGain).connect(filter)

  const holdSynth = createHarmoniumSampler({
    attack: 0.42,
    release: 3.6,
    volume: -11,
  }).connect(filter)

  const previewSynth = createHarmoniumSampler({
    attack: 0.22,
    release: 1.4,
    volume: -9,
  }).connect(filter)

  return {
    holdSynth,
    previewSynth,
    filter,
    eq,
    compressor,
    reverb,
    air,
    airFilter,
    airGain,
    outputGain,
    chorus: null,
    vibrato: null,
  }
}

export async function prepareHarmoniumChain(chain) {
  await Promise.all([Tone.loaded(), chain.reverb.ready])
  chain.air.start()
}

export function disposeHarmoniumChain(chain) {
  try {
    chain.air?.stop?.()
    chain.air?.dispose?.()
    chain.airFilter?.dispose?.()
    chain.airGain?.dispose?.()
    chain.holdSynth?.dispose?.()
    chain.previewSynth?.dispose?.()
    chain.filter?.dispose?.()
    chain.eq?.dispose?.()
    chain.compressor?.dispose?.()
    chain.reverb?.dispose?.()
    chain.outputGain?.dispose?.()
  } catch {
    /* ok */
  }
}
