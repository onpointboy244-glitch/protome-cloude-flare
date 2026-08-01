import CardFace from './CardFace.jsx'
import { cardStyles } from './cardStyles.jsx'
import { DEMO_PROFILES } from './demoProfiles.js'
import { computeProfileTheme } from '../../lib/useProfileTheme.js'
import GooeyBackground from './GooeyBackground'
import Shuffle3D from './Shuffle3D'
import './ProtofileCard.css'

export default function ProtofileCard({ data, compact, animateIn }) {
  // ---- Hero: 3D Card Shuffle — modern coverflow carousel ----
  // Uses Shuffle3D component with CSS perspective, rotateY transforms,
  // auto-advance timer, and interactive dot navigation.

  const profile = data || DEMO_PROFILES[0]
  const theme = computeProfileTheme(profile)
  const cardStyle = {
    ...cardStyles(profile),
    ...theme.cssVars,
    ...(theme.isGooey ? { position: 'relative' } : {}),
  }
  const rootClass = `protofile-card ${compact ? 'protofile-card--compact' : ''} ${theme.hasWallpaper ? 'protofile__card--wallpaper' : ''} ${theme.isGooey ? 'protofile-card--gooey' : ''} ${theme.isLightBg ? 'protofile--light' : 'protofile--dark'} ${theme.fontClass}`

  if (animateIn) {
    return (
      <Shuffle3D profiles={DEMO_PROFILES} />
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
