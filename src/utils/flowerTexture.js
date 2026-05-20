import * as THREE from 'three'

/** Procedural soft flower textures (reliable in WebGL). */
export function createFlowerTexture(type = 'daisy') {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const cx = size / 2
  const cy = size / 2

  const palettes = {
    daisy: { petal: 'rgba(255, 248, 230, 0.85)', core: 'rgba(245, 220, 160, 0.9)' },
    sakura: { petal: 'rgba(255, 190, 210, 0.8)', core: 'rgba(255, 150, 180, 0.85)' },
    orchid: { petal: 'rgba(170, 190, 255, 0.75)', core: 'rgba(120, 140, 220, 0.85)' },
    lily: { petal: 'rgba(255, 255, 255, 0.8)', core: 'rgba(240, 230, 220, 0.8)' },
  }

  const { petal, core } = palettes[type] || palettes.daisy
  const petals = type === 'lily' ? 5 : type === 'sakura' ? 5 : 8

  for (let i = 0; i < petals; i++) {
    const angle = (i / petals) * Math.PI * 2
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    const g = ctx.createRadialGradient(0, -28, 0, 0, -28, 55)
    g.addColorStop(0, petal)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    if (type === 'sakura') {
      ctx.moveTo(0, 0)
      ctx.bezierCurveTo(18, -20, 28, -55, 0, -70)
      ctx.bezierCurveTo(-28, -55, -18, -20, 0, 0)
    } else {
      ctx.ellipse(0, -38, 16, 42, 0, 0, Math.PI * 2)
    }
    ctx.fill()
    ctx.restore()
  }

  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22)
  coreGrad.addColorStop(0, core)
  coreGrad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = coreGrad
  ctx.beginPath()
  ctx.arc(cx, cy, 22, 0, Math.PI * 2)
  ctx.fill()

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

export function createSoftParticleTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255, 240, 220, 1)')
  g.addColorStop(0.4, 'rgba(255, 220, 200, 0.5)')
  g.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}
