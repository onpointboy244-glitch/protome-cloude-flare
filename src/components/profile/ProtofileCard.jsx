import CardFace from './CardFace.jsx'
import { cardStyles } from './cardStyles.jsx'
import { DEMO_PROFILES } from './demoProfiles.js'
import { isLightColor } from '../../lib/icons.jsx'
import GooeyBackground from './GooeyBackground'
import './ProtofileCard.css'

export default function ProtofileCard({ data, compact, animateIn }) {
  // ---- Hero: pure CSS keyframe animation — no JS cycling state ----
  // Render profiles twice so the animation loops seamlessly:
  // [0,1,2,3,0,1,2,3]. The animation scrolls to position 4 (clone of 0),
  // and when it loops back to 0%, it shows the real profile 0 — identical content.

  const profile = data || DEMO_PROFILES[0]
  const fontClass = profile.font && profile.font !== 'serif' ? `protofile--${profile.font}` : ''
  const bgGradient = profile.bg_gradient || profile.bgGradient || ''
  const bgColor = profile.bg_color || profile.bgColor || ''
  const isGooey = bgGradient?.startsWith?.('__gooey__')
  const gooeyVariant = isGooey
    ? bgGradient === '__gooey__' ? 'groovy1' : (bgGradient.split('__').filter(Boolean)[1] || 'groovy1')
    : undefined
  const accent = profile.accent || '#C5A059'
  const isLightBg = isLightColor(bgColor)
  const isAccentLight = isLightColor(accent)
  const accentHoverText = isAccentLight ? '#000' : '#fff'
  const cardStyle = {
    ...cardStyles(profile),
    '--accent-hover-text': accentHoverText,
    '--bg-color': bgColor || 'var(--color-bg)',
    ...(isGooey ? { position: 'relative' } : {}),
  }
  const rootClass = `protofile-card ${compact ? 'protofile-card--compact' : ''} ${isGooey ? 'protofile-card--gooey' : ''} ${isLightBg ? 'protofile--light' : 'protofile--dark'} ${fontClass}`

  if (animateIn) {
    return (
      <div
        className={`protofile-card protofile-card--hero ${isLightBg ? 'protofile--light' : 'protofile--dark'}`}
        style={cardStyles(DEMO_PROFILES[0])}
      >
        <div className="protofile-card__tower protofile-card__tower--animated">
          {[...DEMO_PROFILES, ...DEMO_PROFILES].map((p, i) => {
            const pBgColor = p.bg_color || p.bgColor || ''
            const pLight = isLightColor(pBgColor)
            const pFontClass = p.font && p.font !== 'serif' ? `protofile--${p.font}` : ''
            const pBgGradient = p.bg_gradient || p.bgGradient || ''
            const pIsGooey = pBgGradient?.startsWith?.('__gooey__')
            const pGooeyVariant = pIsGooey
              ? pBgGradient === '__gooey__' ? 'groovy1' : (pBgGradient.split('__').filter(Boolean)[1] || 'groovy1')
              : undefined
            return (
              <div key={i} className="protofile-card__tower-item">
                <div
                  className={`protofile-card__tower-face ${pLight ? 'protofile--light' : 'protofile--dark'} ${pFontClass}`}
                  style={{ ...cardStyles(p), ...(pIsGooey ? { position: 'relative' } : {}) }}
                >
                  {pIsGooey && <GooeyBackground accent={p.accent || '#C5A059'} variant={pGooeyVariant} />}
                  <CardFace profile={p} animateIn />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Regular single-profile card
  return (
    <div
      className={rootClass}
      role="article"
      aria-label="Protofile preview"
      style={cardStyle}
    >
      {isGooey && <GooeyBackground accent={accent} variant={gooeyVariant} />}
      <CardFace profile={profile} />
    </div>
  )
}
