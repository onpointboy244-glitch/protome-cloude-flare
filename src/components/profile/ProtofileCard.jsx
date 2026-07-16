import CardFace, { cardStyles } from './CardFace.jsx'
import { DEMO_PROFILES } from './demoProfiles.js'
import GooeyBackground from './GooeyBackground'
import './ProtofileCard.css'

export default function ProtofileCard({ data, compact, animateIn }) {
  // ---- Hero: pure CSS keyframe animation — no JS cycling state ----
  // Render profiles twice so the animation loops seamlessly:
  // [0,1,2,3,0,1,2,3]. The animation scrolls to position 4 (clone of 0),
  // and when it loops back to 0%, it shows the real profile 0 — identical content.

  if (animateIn) {
    return (
      <div
        className="protofile-card protofile-card--hero"
        style={cardStyles(DEMO_PROFILES[0])}
      >
        <div className="protofile-card__tower protofile-card__tower--animated">
          {[...DEMO_PROFILES, ...DEMO_PROFILES].map((p, i) => (
            <div key={i} className="protofile-card__tower-item">
              <div
                className="protofile-card__tower-face"
                style={cardStyles(p)}
              >
                <CardFace profile={p} animateIn />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Regular single-profile card
  const profile = data || DEMO_PROFILES[0]
  const bgGradient = profile.bg_gradient || profile.bgGradient || ''
  const isGooey = bgGradient?.startsWith?.('__gooey__')
  const gooeyVariant = isGooey
    ? bgGradient === '__gooey__' ? 'groovy' : (bgGradient.split('__').filter(Boolean)[1] || 'groovy')
    : undefined
  const accent = profile.accent || '#C5A059'
  const cardStyle = {
    ...cardStyles(profile),
    ...(isGooey ? { position: 'relative' } : {}),
  }
  return (
    <div
      className={`protofile-card ${compact ? 'protofile-card--compact' : ''} ${isGooey ? 'protofile-card--gooey' : ''}`}
      role="article"
      aria-label="Protofile preview"
      style={cardStyle}
    >
      {isGooey && <GooeyBackground accent={accent} variant={gooeyVariant} />}
      <CardFace profile={profile} />
    </div>
  )
}
