/**
 * Corner stars from user sheet — reference mockup placement.
 */

const DECO = {
  glitterLg: '/images/deco/star-glitter-lg.png',
  glitterSm: '/images/deco/star-glitter-sm.png',
  leopard: '/images/deco/star-leopard.png',
  zebra: '/images/deco/star-zebra.png',
  zebraSm: '/images/deco/star-zebra-sm.png',
}

function DecoStar({ src, className, style }) {
  return (
    <img src={src} className={className} style={style} alt="" draggable={false} />
  )
}

const SPARKLES = [
  { top: '4%', right: '14%', g: '✦' },
  { top: '7%', right: '10%', g: '✧' },
  { top: '10%', right: '18%', g: '✦' },
  { bottom: '12%', left: '8%', g: '✧' },
  { bottom: '8%', right: '12%', g: '✦' },
]

export function BackgroundSparkles() {
  return (
    <div className="sw-deco__sparkles" aria-hidden>
      {SPARKLES.map((p, i) => (
        <span
          key={i}
          className="sw-deco__sparkle-glyph"
          style={{
            top: p.top,
            right: p.right,
            left: p.left,
            bottom: p.bottom,
          }}
        >
          {p.g}
        </span>
      ))}
    </div>
  )
}

export function CornerDecorations() {
  return (
    <div className="sw-deco" aria-hidden>
      {/* TL: large glitter + small zebra */}
      <div className="sw-deco__corner sw-deco__corner--tl">
        <DecoStar
          src={DECO.glitterLg}
          className="sw-deco__img sw-deco__img--lg"
          style={{ top: '0', left: '0', transform: 'rotate(-10deg)' }}
        />
        <DecoStar
          src={DECO.zebraSm}
          className="sw-deco__img sw-deco__img--sm"
          style={{ top: '2.5rem', left: '2.75rem', transform: 'rotate(14deg)' }}
        />
      </div>

      {/* TR: leopard + small glitter */}
      <div className="sw-deco__corner sw-deco__corner--tr">
        <DecoStar
          src={DECO.leopard}
          className="sw-deco__img sw-deco__img--lg"
          style={{ top: '0', right: '2.1rem', transform: 'rotate(7deg)' }}
        />
        <DecoStar
          src={DECO.glitterSm}
          className="sw-deco__img sw-deco__img--sm"
          style={{ top: '2.15rem', right: '0', transform: 'rotate(-11deg)' }}
        />
      </div>

      {/* BL: leopard + small glitter */}
      <div className="sw-deco__corner sw-deco__corner--bl">
        <DecoStar
          src={DECO.leopard}
          className="sw-deco__img sw-deco__img--lg"
          style={{ bottom: '1.85rem', left: '0', transform: 'rotate(5deg) scaleX(-1)' }}
        />
        <DecoStar
          src={DECO.glitterSm}
          className="sw-deco__img sw-deco__img--sm"
          style={{ bottom: '0', left: '3.5rem', transform: 'rotate(-15deg)' }}
        />
      </div>

      {/* BR: small glitter + zebra */}
      <div className="sw-deco__corner sw-deco__corner--br">
        <DecoStar
          src={DECO.glitterSm}
          className="sw-deco__img sw-deco__img--sm"
          style={{ bottom: '1.9rem', right: '0', transform: 'rotate(-6deg)' }}
        />
        <DecoStar
          src={DECO.zebra}
          className="sw-deco__img sw-deco__img--sm"
          style={{ bottom: '0', right: '2.9rem', transform: 'rotate(12deg)' }}
        />
      </div>
    </div>
  )
}
