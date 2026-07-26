import CardFace from './CardFace.jsx'
import { cardStyles } from './cardStyles.jsx'
import { DEMO_PROFILES } from './demoProfiles.js'
import { computeProfileTheme } from '../../lib/useProfileTheme.js'
import GooeyBackground from './GooeyBackground'
import './ProtofileCard.css'

export default function ProtofileCard({ data, compact, animateIn }) {
  // ---- Hero: pure CSS keyframe animation — no JS cycling state ----
  // Render profiles twice so the animation loops seamlessly:
  // [0,1,2,3,0,1,2,3]. The animation scrolls to position 4 (clone of 0),
  // and when it loops back to 0%, it shows the real profile 0 — identical content.

  const profile = data || DEMO_PROFILES[0]
  const theme = computeProfileTheme(profile)
  const cardStyle = {
    ...cardStyles(profile),
    ...(theme.isGooey ? { position: 'relative' } : {}),
  }
  const rootClass = `protofile-card ${compact ? 'protofile-card--compact' : ''} ${theme.hasWallpaper ? 'protofile__card--wallpaper' : ''} ${theme.isGooey ? 'protofile-card--gooey' : ''} ${theme.isLightBg ? 'protofile--light' : 'protofile--dark'} ${theme.fontClass}`

  if (animateIn) {
    return (
      <div
        className={`protofile-card protofile-card--hero ${theme.isLightBg ? 'protofile--light' : 'protofile--dark'}`}
        style={cardStyles(DEMO_PROFILES[0])}
      >
        <div className="protofile-card__tower protofile-card__tower--animated">
          {[...DEMO_PROFILES, ...DEMO_PROFILES].map((p, i) => {
            const pTheme = computeProfileTheme(p)
            return (
              <div key={i} className="protofile-card__tower-item">
                <div
                  className={`protofile-card__tower-face ${pTheme.isLightBg ? 'protofile--light' : 'protofile--dark'} ${pTheme.fontClass}`}
                  style={{ ...cardStyles(p), ...(pTheme.isGooey ? { position: 'relative' } : {}) }}
                >
                  {pTheme.isGooey && <GooeyBackground accent={pTheme.accentColor} variant={pTheme.gooeyVariant} />}
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
      {theme.isGooey && <GooeyBackground accent={theme.accentColor} variant={theme.gooeyVariant} />}
      <CardFace profile={profile} />
    </div>
  )
}
