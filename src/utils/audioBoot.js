import * as Tone from 'tone'

let started = false

/** Resume AudioContext once — must run inside a click/tap handler */
export async function startAudio() {
  if (started) return true
  await Tone.start()
  started = true
  return true
}

export function isAudioStarted() {
  return started
}
