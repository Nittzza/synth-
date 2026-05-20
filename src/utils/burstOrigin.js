/** Normalized [0,1] burst origin — hand palm preferred, then face, then center */
export function getBurstOrigin(handLandmarks, anchors) {
  if (handLandmarks?.length >= 21) {
    const palm = [0, 5, 9, 13, 17].map((i) => handLandmarks[i])
    const x = palm.reduce((s, p) => s + p.x, 0) / palm.length
    const y = palm.reduce((s, p) => s + p.y, 0) / palm.length
    return { x, y }
  }

  if (anchors?.nose) {
    return { x: anchors.nose.x, y: anchors.nose.y }
  }

  if (anchors?.bloomLeft && anchors?.bloomRight) {
    return {
      x: (anchors.bloomLeft.x + anchors.bloomRight.x) / 2,
      y: (anchors.bloomLeft.y + anchors.bloomRight.y) / 2,
    }
  }

  return { x: 0.5, y: 0.45 }
}
