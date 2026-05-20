/** CDN roots — Hands and FaceMesh must never share locateFile */
export const HANDS_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands'
export const FACE_MESH_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh'

/** Dedicated locateFile for @mediapipe/hands only */
export function locateHandsFile(file) {
  return `${HANDS_CDN}/${file}`
}

/** Dedicated locateFile for @mediapipe/face_mesh only */
export function locateFaceMeshFile(file) {
  return `${FACE_MESH_CDN}/${file}`
}
