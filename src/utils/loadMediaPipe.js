import { HANDS_CDN, FACE_MESH_CDN } from './mediapipe'

const loaded = new Map()

function loadScript(src) {
  if (loaded.has(src)) return loaded.get(src)

  const promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', reject)
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.crossOrigin = 'anonymous'
    script.onload = () => resolve()
    script.onerror = reject
    document.head.appendChild(script)
  })

  loaded.set(src, promise)
  return promise
}

/** Load MediaPipe Hands UMD bundle */
export async function loadHands() {
  await loadScript(`${HANDS_CDN}/hands.js`)
  if (!window.Hands) throw new Error('MediaPipe Hands failed to load')
  return window.Hands
}

/** Load MediaPipe Face Mesh UMD bundle */
export async function loadFaceMesh() {
  await loadScript(`${FACE_MESH_CDN}/face_mesh.js`)
  if (!window.FaceMesh) throw new Error('MediaPipe FaceMesh failed to load')
  return window.FaceMesh
}
