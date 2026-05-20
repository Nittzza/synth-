/**
 * Synth sound types you can try in the Sound Lab.
 * Each preset = voice + effects chain for hold (gestures) and preview (taps).
 */

export const DEFAULT_PRESET_ID = 'dream-pad'

/** @typedef {'pad'|'keys'|'pluck'|'organ'|'strings'|'bell'|'lead'} PresetCategory */

export const SYNTH_PRESET_LIST = [
  {
    id: 'dream-pad',
    label: 'Dream Pad',
    category: 'pad',
    description: 'Atmospheric, emotional, wide — great for hand-gesture performance.',
    bestFor: 'Your main app vibe · slow chords · cinematic',
  },
  {
    id: 'harmonium',
    label: 'Harmonium',
    category: 'harmonium',
    description: 'Real sampled Indian harmonium — warm, nasal, airy, acoustic.',
    bestFor: 'Bhajan · Bollywood unplugged · Coke Studio · devotional chords',
  },
  {
    id: 'string-pad',
    label: 'String Pad',
    category: 'strings',
    description: 'Slow bowed swell — orchestral emotion.',
    bestFor: 'Film cues · sad / hopeful chords',
  },
  {
    id: 'ambient-wash',
    label: 'Ambient Wash',
    category: 'pad',
    description: 'Very slow swell, long tail — pure texture.',
    bestFor: 'Drone-like moods · minimal gestures',
  },
  {
    id: 'organ',
    label: 'Synth Organ',
    category: 'organ',
    description: 'Sustained drawbar organ — steady and full.',
    bestFor: 'Gospel · lounge · holding one chord',
  },
  {
    id: 'bright-pad',
    label: 'Bright Pad',
    category: 'pad',
    description: 'Sharper, more present and vibrant — still a pad.',
    bestFor: 'Indie pop · uplifting progressions',
  },
  {
    id: 'crystal-bell',
    label: 'Crystal Bell',
    category: 'bell',
    description: 'FM bell tones — clear, magical, ringing.',
    bestFor: 'Music-box gestures · light textures',
  },
  {
    id: 'shimmer-lead',
    label: 'Shimmer Lead',
    category: 'lead',
    description: 'Brighter saw layer — more energy, still chord-friendly.',
    bestFor: 'Synth pop · when you want bite',
  },
]

const basePreviewEnv = {
  attack: 0.04,
  decay: 0.35,
  sustain: 0.72,
  release: 0.28,
}

/** @type {Record<string, import('./padSynth').PresetConfig>} */
export const SYNTH_PRESETS = {
  'dream-pad': {
    voice: 'synth',
    hold: {
      maxPolyphony: 8,
      oscillator: { type: 'fattriangle', count: 4, spread: 45 },
      envelope: { attack: 0.85, decay: 1.2, sustain: 0.82, release: 4 },
      filterEnvelope: {
        attack: 0.5,
        decay: 1,
        sustain: 0.7,
        release: 2.5,
        baseFrequency: 320,
        octaves: 2.8,
      },
      volume: -14,
    },
    preview: {
      maxPolyphony: 8,
      oscillator: { type: 'fattriangle', count: 4, spread: 45 },
      envelope: basePreviewEnv,
      filterEnvelope: {
        attack: 0.03,
        decay: 0.25,
        sustain: 0.55,
        release: 0.35,
        baseFrequency: 500,
        octaves: 2.2,
      },
      volume: -12,
    },
    chain: { filterHz: 2400, reverbDecay: 9, reverbWet: 0.5, eqHigh: 5 },
  },

  'bright-pad': {
    voice: 'synth',
    hold: {
      maxPolyphony: 8,
      oscillator: { type: 'fatsawtooth', count: 3, spread: 35 },
      envelope: { attack: 0.6, decay: 1, sustain: 0.78, release: 3.5 },
      filterEnvelope: {
        attack: 0.2,
        decay: 0.8,
        sustain: 0.65,
        release: 2,
        baseFrequency: 600,
        octaves: 2.5,
      },
      volume: -15,
    },
    preview: {
      maxPolyphony: 8,
      oscillator: { type: 'fatsawtooth', count: 3, spread: 35 },
      envelope: basePreviewEnv,
      filterEnvelope: {
        attack: 0.02,
        decay: 0.2,
        sustain: 0.5,
        release: 0.3,
        baseFrequency: 800,
        octaves: 2,
      },
      volume: -11,
    },
    chain: { filterHz: 3200, reverbDecay: 7, reverbWet: 0.42, eqHigh: 7, eqMid: 3 },
  },

  'ambient-wash': {
    voice: 'synth',
    hold: {
      maxPolyphony: 8,
      oscillator: { type: 'fatsine', count: 4, spread: 50 },
      envelope: { attack: 2.8, decay: 2.5, sustain: 0.9, release: 8 },
      volume: -16,
    },
    preview: {
      maxPolyphony: 8,
      oscillator: { type: 'fatsine', count: 4, spread: 50 },
      envelope: { attack: 0.08, decay: 0.5, sustain: 0.8, release: 0.6 },
      volume: -12,
    },
    chain: { filterHz: 1400, reverbDecay: 16, reverbWet: 0.78, chorusWet: 0.5 },
  },

  'string-pad': {
    voice: 'synth',
    hold: {
      maxPolyphony: 8,
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 2.2, decay: 1.8, sustain: 0.75, release: 2.8 },
      filterEnvelope: {
        attack: 1.5,
        decay: 1.2,
        sustain: 0.5,
        release: 3,
        baseFrequency: 200,
        octaves: 3,
      },
      volume: -16,
    },
    preview: {
      maxPolyphony: 8,
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.15, decay: 0.5, sustain: 0.6, release: 0.45 },
      volume: -12,
    },
    chain: { filterHz: 1600, reverbDecay: 10, reverbWet: 0.52, eqHigh: 2 },
  },

  organ: {
    voice: 'synth',
    hold: {
      maxPolyphony: 8,
      oscillator: { type: 'square', spread: 12 },
      envelope: { attack: 0.08, decay: 0.2, sustain: 0.92, release: 0.4 },
      volume: -18,
    },
    preview: {
      maxPolyphony: 8,
      oscillator: { type: 'square' },
      envelope: { attack: 0.02, decay: 0.15, sustain: 0.85, release: 0.2 },
      volume: -14,
    },
    chain: { filterHz: 2000, reverbDecay: 4, reverbWet: 0.28, chorusWet: 0.25, eqHigh: 1 },
  },

  harmonium: {
    engine: 'harmonium',
  },

  'crystal-bell': {
    voice: 'fm',
    hold: {
      harmonicity: 3,
      modulationIndex: 10,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 1.2, sustain: 0.35, release: 3 },
      volume: -14,
    },
    preview: {
      harmonicity: 3,
      modulationIndex: 10,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.8, sustain: 0.2, release: 0.35 },
      volume: -11,
    },
    chain: { filterHz: 5000, reverbDecay: 8, reverbWet: 0.48, eqHigh: 8 },
  },

  'shimmer-lead': {
    voice: 'synth',
    hold: {
      maxPolyphony: 8,
      oscillator: { type: 'fatsawtooth', count: 4, spread: 30 },
      envelope: { attack: 0.35, decay: 0.8, sustain: 0.7, release: 2.5 },
      filterEnvelope: {
        attack: 0.15,
        decay: 0.5,
        sustain: 0.55,
        release: 1.5,
        baseFrequency: 800,
        octaves: 2,
      },
      volume: -15,
    },
    preview: {
      maxPolyphony: 8,
      oscillator: { type: 'fatsawtooth', count: 3, spread: 25 },
      envelope: { attack: 0.02, decay: 0.25, sustain: 0.6, release: 0.25 },
      volume: -11,
    },
    chain: { filterHz: 3600, reverbDecay: 6, reverbWet: 0.4, eqHigh: 6, eqMid: 2 },
  },
}

export function getPresetMeta(id) {
  return SYNTH_PRESET_LIST.find((p) => p.id === id) ?? SYNTH_PRESET_LIST[0]
}

export function getPresetConfig(id) {
  return SYNTH_PRESETS[id] ?? SYNTH_PRESETS[DEFAULT_PRESET_ID]
}
