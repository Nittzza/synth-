/**
 * Decorative stars — each maps 1:1 to the sticker pack grid:
 * TL: zebra spiky | TM: pink outline + bw leopard | TR: solid leopard
 * BL: leopard + pink center | BM: bw leopard ring + pink fill | BR: pink outline 8pt leopard
 */
import {
  STAR_5,
  STAR_8,
  STAR_10,
  STAR_5_INNER_LIGHT,
  STAR_5_INNER_PINK,
} from './ChordPickerPatterns'

/** Sticker 1 — top-left: 10-point zebra stripes */
export function StickerZebraSpiky({ className, size = 64 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      shapeRendering="crispEdges"
      aria-hidden
    >
      <polygon points={STAR_10} fill="url(#sw-zebra)" stroke="#222" strokeWidth="1.5" />
    </svg>
  )
}

/** Sticker 3 — top-right: solid brown leopard 5-point */
export function StickerLeopardSolid({ className, size = 58 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      shapeRendering="crispEdges"
      aria-hidden
    >
      <polygon points={STAR_5} fill="url(#sw-leopard)" />
    </svg>
  )
}

/** Sticker 2 — top-middle: hot pink border + bw leopard interior */
export function StickerPinkOutlineBwLeopard({ className, size = 56 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      shapeRendering="crispEdges"
      aria-hidden
    >
      <polygon
        points={STAR_5}
        fill="url(#sw-leopard-bw)"
        stroke="#ff69b4"
        strokeWidth="5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Sticker 4 — bottom-left: tan leopard + small hot pink center */
export function StickerLeopardPinkCenter({ className, size = 54 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      shapeRendering="crispEdges"
      aria-hidden
    >
      <polygon points={STAR_5} fill="url(#sw-leopard)" />
      <polygon points={STAR_5_INNER_PINK} fill="#ff69b4" />
    </svg>
  )
}

/** Sticker 5 — bottom-middle: bw leopard ring + light pink fill (sparkly / dotted look on UI) */
export function StickerLeopardRingPinkFill({ className, size = 48 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      shapeRendering="crispEdges"
      aria-hidden
    >
      <polygon points={STAR_5} fill="#ffb6d9" stroke="url(#sw-leopard-bw)" strokeWidth="6" />
      <circle cx="38" cy="42" r="2" fill="#fff" opacity="0.9" />
      <circle cx="58" cy="38" r="1.5" fill="#fff" opacity="0.85" />
      <circle cx="52" cy="58" r="2" fill="#fff" opacity="0.9" />
      <circle cx="44" cy="52" r="1.2" fill="#fff" opacity="0.8" />
    </svg>
  )
}

/** Plain solid pink 5-point (reference UI plain / glitter stars) */
export function StickerPinkSolid({ className, size = 44, light = false }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      shapeRendering="crispEdges"
      aria-hidden
    >
      <polygon points={STAR_5} fill={light ? '#ffb6d9' : '#ff69b4'} />
      {!light && (
        <>
          <circle cx="35" cy="40" r="2" fill="#fff" opacity="0.75" />
          <circle cx="62" cy="45" r="1.5" fill="#fff" opacity="0.7" />
          <circle cx="55" cy="62" r="1.8" fill="#fff" opacity="0.8" />
        </>
      )}
    </svg>
  )
}

/** Sticker 6 — bottom-right: 8-point pink outline + leopard interior */
export function StickerLeopardOutline8({ className, size = 52 }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      shapeRendering="crispEdges"
      aria-hidden
    >
      <polygon
        points={STAR_8}
        fill="url(#sw-leopard)"
        stroke="#ff69b4"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
