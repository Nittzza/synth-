import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { KEY_COLORS } from '../utils/chordTheory'
import { createSoftParticleTexture } from '../utils/flowerTexture'

const COUNT = 80

/** Soft particles around the face — tint follows active chord. */
export default function ParticleSystem({
  anchors,
  activeChord,
  intensity = 0.3,
  glow = 0.5,
  active = true,
}) {
  const pointsRef = useRef()
  const particleTex = useMemo(() => createSoftParticleTexture(), [])
  const colorRef = useRef(new THREE.Color('#ffe8d0'))
  const targetRef = useRef(new THREE.Color('#ffe8d0'))

  const chordColor = KEY_COLORS[activeChord?.root] ?? '#ffe8d0'

  useEffect(() => {
    targetRef.current.set(chordColor)
  }, [chordColor])

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const vel = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3
      pos[i3] = (Math.random() - 0.5) * 0.4
      pos[i3 + 1] = (Math.random() - 0.5) * 0.4
      pos[i3 + 2] = (Math.random() - 0.5) * 0.2
      vel[i3] = (Math.random() - 0.5) * 0.0015
      vel[i3 + 1] = Math.random() * 0.002 + 0.0008
      vel[i3 + 2] = (Math.random() - 0.5) * 0.0008
    }

    return { positions: pos, velocities: vel }
  }, [])

  const anchorCenter = useMemo(() => {
    if (!anchors) return null
    return [
      ((anchors.bloomLeft.x + anchors.bloomRight.x) / 2 - 0.5) * 2.4,
      -((anchors.bloomLeft.y + anchors.bloomRight.y) / 2 - 0.5) * 2.6,
      0,
    ]
  }, [anchors])

  useFrame(() => {
    const pts = pointsRef.current
    if (!pts || !anchorCenter) return

    colorRef.current.lerp(targetRef.current, 0.1)
    if (pts.material) pts.material.color.copy(colorRef.current)

    const posAttr = pts.geometry.attributes.position
    const arr = posAttr.array
    const pull = 0.001 + intensity * 0.002
    const spread = 0.28 + intensity * 0.35 + glow * 0.15

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3
      arr[i3] += velocities[i3] + (anchorCenter[0] - arr[i3]) * pull
      arr[i3 + 1] += velocities[i3 + 1] + (anchorCenter[1] - arr[i3 + 1]) * pull
      arr[i3 + 2] += velocities[i3 + 2]

      if (arr[i3 + 1] > anchorCenter[1] + spread) arr[i3 + 1] = anchorCenter[1] - spread * 0.5
      if (arr[i3 + 1] < anchorCenter[1] - spread) arr[i3 + 1] = anchorCenter[1] + spread * 0.5
      if (arr[i3] > anchorCenter[0] + spread) arr[i3] = anchorCenter[0] - spread * 0.5
      if (arr[i3] < anchorCenter[0] - spread) arr[i3] = anchorCenter[0] + spread * 0.5
    }
    posAttr.needsUpdate = true

    if (pts.material) {
      pts.material.opacity = active ? 0.2 + glow * 0.5 + intensity * 0.3 : 0.05
      pts.material.size = 0.06 + intensity * 0.04 + glow * 0.03
    }
  })

  if (!anchors) return null

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={particleTex}
        color="#ffe8d0"
        size={0.08}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
