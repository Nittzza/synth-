/** SVG patterns + star paths matching the sticker pack reference */

export function ChordPickerPatternDefs() {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
      <defs>
        {/* Tan/brown leopard (top-right, bottom-right stickers) */}
        <pattern id="sw-leopard" patternUnits="userSpaceOnUse" width="30" height="30">
          <rect width="30" height="30" fill="#c8a882" />
          <ellipse cx="8" cy="8" rx="5" ry="3" fill="#5c3a1e" opacity="0.7" />
          <ellipse cx="22" cy="5" rx="3" ry="4" fill="#5c3a1e" opacity="0.6" />
          <ellipse cx="15" cy="20" rx="6" ry="3" fill="#5c3a1e" opacity="0.7" />
          <ellipse cx="4" cy="22" rx="3" ry="2" fill="#5c3a1e" opacity="0.5" />
          <ellipse cx="26" cy="24" rx="4" ry="3" fill="#5c3a1e" opacity="0.6" />
        </pattern>
        {/* White/black leopard (top-middle sticker interior) */}
        <pattern id="sw-leopard-bw" patternUnits="userSpaceOnUse" width="28" height="28">
          <rect width="28" height="28" fill="#f5f0e8" />
          <ellipse cx="7" cy="7" rx="5" ry="3" fill="#1a1a1a" opacity="0.85" />
          <ellipse cx="20" cy="6" rx="4" ry="3" fill="#333" opacity="0.75" />
          <ellipse cx="14" cy="18" rx="6" ry="3" fill="#1a1a1a" opacity="0.8" />
          <ellipse cx="4" cy="20" rx="3" ry="2" fill="#444" opacity="0.7" />
          <ellipse cx="22" cy="22" rx="4" ry="3" fill="#1a1a1a" opacity="0.75" />
        </pattern>
        <pattern id="sw-zebra" patternUnits="userSpaceOnUse" width="16" height="16" patternTransform="rotate(45)">
          <rect width="16" height="16" fill="white" />
          <rect width="7" height="16" fill="#111" />
        </pattern>
      </defs>
    </svg>
  )
}

export const STAR_5 =
  '50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35'

/** 10-point spiky zebra star (sticker pack top-left) */
export const STAR_10 =
  '50,2 54,22 74,14 62,32 88,42 66,48 80,72 54,58 50,88 46,58 20,72 34,48 12,42 38,32 26,14 46,22'

/** 8-point spiky star (sticker pack bottom-right) */
export const STAR_8 =
  '50,4 58,24 78,18 64,36 90,50 68,54 72,78 50,66 28,78 32,54 10,50 36,36 22,18 42,24'

function star5Inner(scale = 0.42) {
  const c = 50
  const r = 50 * scale
  return `${c},${c - r} ${c + r * 0.31},${c - r * 0.09} ${c + r * 0.95},${c - r * 0.09} ${c + r * 0.38},${c + r * 0.12} ${c + r * 0.62},${c + r * 0.82} ${c},${c + r * 0.4} ${c - r * 0.62},${c + r * 0.82} ${c - r * 0.38},${c + r * 0.12} ${c - r * 0.95},${c - r * 0.09} ${c - r * 0.31},${c - r * 0.09}`
}

export const STAR_5_INNER_PINK = star5Inner(0.38)
export const STAR_5_INNER_LIGHT = star5Inner(0.36)
