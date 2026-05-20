import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getFlowerForChord } from '../utils/chords'
import { KEY_COLORS } from '../utils/chordTheory'
import { createFlowerTexture } from '../utils/flowerTexture'

function BloomFlower({ position, flowerType, chordColor, bloom, voiceScale, side }) {
  const groupRef = useRef()
  const materialRef = useRef()
  const glowRef = useRef()
  const startRef = useRef(performance.now())
  const colorRef = useRef(new THREE.Color(chordColor))
  const targetRef = useRef(new THREE.Color(chordColor))

  useEffect(() => {
    startRef.current = performance.now()
  }, [flowerType])

  useEffect(() => {
    targetRef.current.set(chordColor)
  }, [chordColor])

  const texture = useMemo(() => createFlowerTexture(flowerType), [flowerType])

  useFrame(() => {
    const group = groupRef.current
    const mat = materialRef.current
    const glow = glowRef.current
    if (!group || !mat) return

    colorRef.current.lerp(targetRef.current, 0.12)
    mat.color.copy(colorRef.current)
    if (glow) glow.color.copy(colorRef.current)

    const t = (performance.now() - startRef.current) / 1000
    const easeBloom = 1 - Math.exp(-bloom * 1.8)
    const scale = (0.55 + easeBloom * 1.1) * (0.9 + voiceScale * 0.5)
    group.scale.setScalar(scale)
    group.rotation.z = Math.sin(t * 0.4 + side) * 0.1
    group.rotation.y = Math.cos(t * 0.25) * 0.15
    group.position.y = position[1] + Math.sin(t * 0.5 + side) * 0.03
    mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.25 + easeBloom * 0.75, 0.08)
    if (glow) {
      glow.opacity = THREE.MathUtils.lerp(glow.opacity, 0.08 + bloom * 0.25, 0.08)
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <sprite scale={[1.4, 1.4, 1]}>
        <spriteMaterial
          ref={materialRef}
          map={texture}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.NormalBlending}
          color={chordColor}
        />
      </sprite>
      <sprite scale={[2.8, 2.8, 1]} position={[0, 0, -0.01]}>
        <spriteMaterial
          ref={glowRef}
          map={texture}
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color={chordColor}
        />
      </sprite>
    </group>
  )
}

/** Flowers beside the face — shape by quality, tint by chord root (omnichord colors). */
export default function FlowerSystem({ anchors, activeChord, bloom, voiceLevel }) {
  const flowerType = getFlowerForChord(activeChord)
  const voiceScale = voiceLevel ?? 0
  const chordColor = KEY_COLORS[activeChord?.root] ?? '#ffffff'

  if (!anchors) return null

  const toWorld = (pt) => [
    (pt.x - 0.5) * 2.4,
    -(pt.y - 0.5) * 2.6,
    0.1,
  ]

  return (
    <group key={activeChord?.id ?? 'idle'}>
      <BloomFlower
        position={toWorld(anchors.bloomLeft)}
        flowerType={flowerType}
        chordColor={chordColor}
        bloom={bloom}
        voiceScale={voiceScale}
        side={0}
      />
      <BloomFlower
        position={toWorld(anchors.bloomRight)}
        flowerType={flowerType}
        chordColor={chordColor}
        bloom={bloom}
        voiceScale={voiceScale}
        side={Math.PI}
      />
    </group>
  )
}
