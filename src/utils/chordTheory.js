export const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function midiToNote(midi) {
  const octave = Math.floor(midi / 12) - 1
  const name = NOTE_NAMES[((midi % 12) + 12) % 12]
  return `${name}${octave}`
}

export const QUALITIES = [
  { id: 'major', rowLabel: 'major', suffix: '' },
  { id: 'minor', rowLabel: 'minor', suffix: 'm' },
  { id: 'M7', rowLabel: 'M7', suffix: 'M7' },
  { id: 'm7', rowLabel: 'm7', suffix: 'm7' },
  { id: '7', rowLabel: '7', suffix: '7' },
  { id: 'aug', rowLabel: 'aug', suffix: '+' },
  { id: 'dim', rowLabel: 'dim', suffix: '°' },
]

const INTERVALS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  M7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  7: [0, 4, 7, 10],
  aug: [0, 4, 8],
  dim: [0, 3, 6],
}

/** Omnichord-style column colors — muted pastels */
export const KEY_COLORS = {
  C: '#c4909c',
  'C#': '#d4a88a',
  D: '#c4bc94',
  'D#': '#94b494',
  E: '#88b8a4',
  F: '#88b4b0',
  'F#': '#94a8c0',
  G: '#a0acc8',
  'G#': '#a098b4',
  A: '#b098c0',
  'A#': '#c090a8',
  B: '#b08898',
}

export function chordId(root, quality) {
  return `${root}_${quality}`
}

export function chordDisplayLabel(root, quality) {
  const q = QUALITIES.find((x) => x.id === quality)
  if (quality === 'major') return root
  return `${root}${q?.suffix ?? ''}`
}

export function buildChordNotes(root, quality, baseOctave = 3) {
  const intervals = INTERVALS[quality] ?? INTERVALS.major
  const rootIndex = ROOTS.indexOf(root)
  const rootMidi = (baseOctave + 1) * 12 + rootIndex
  return intervals.map((semi) => midiToNote(rootMidi + semi))
}

export function createChord(root, quality) {
  const id = chordId(root, quality)
  const octave = ['A', 'A#', 'B'].includes(root) ? 2 : 3
  return {
    id,
    root,
    quality,
    label: chordDisplayLabel(root, quality),
    notes: buildChordNotes(root, quality, octave),
  }
}

/** All 84 chords in the omnichord grid */
export function getAllChords() {
  const chords = []
  for (const root of ROOTS) {
    for (const { id: quality } of QUALITIES) {
      chords.push(createChord(root, quality))
    }
  }
  return chords
}
