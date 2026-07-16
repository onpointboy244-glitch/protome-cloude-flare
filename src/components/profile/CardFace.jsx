import './CardFace.css'
import { renderPlatformIcon, detectIconKey, detectPlatformKey, isLightColor, gradientIsDark, isSocialLink } from '../../lib/icons.jsx'
import { DEFAULT_DATA, LINK_LABELS } from './demoProfiles.js'

/* ---------- Styles factory ---------- */

export function cardStyles(profile) {
  const d = {
    ...DEFAULT_DATA,
    ...profile,
    photo: profile.photo_url || profile.photo || '',
    bgColor: profile.bg_color || profile.bgColor || '',
    bgGradient: profile.bg_gradient || profile.bgGradient || '',
    bgType: profile.bg_type || profile.bgType || 'none',
    bgSize: profile.bg_size || profile.bgSize || 'cover',
  }
  const { accent = '', bgColor = '', bgGradient = '', bgType, bgSize } = d
  const accentColor = accent || 'var(--color-primary-l)'
  // Backward compat: if bgGradient is set but bgType is 'none' (no db column yet), treat as gradient
  const wallpaperType = bgType === 'none' && bgGradient ? 'gradient' : bgType
  const isGooey = bgGradient?.startsWith?.('__gooey__')
  const hasGradientOrPattern = wallpaperType !== 'none' && bgGradient && !isGooey
  // Semi-transparent overlays should use bgColor for contrast, not gradientIsDark
  const isPattern = wallpaperType === 'pattern' && !isGooey
  const isOverlay = bgGradient && (bgGradient.includes('rgba') || bgGradient.includes('transparent'))
  const isDarkBg = hasGradientOrPattern && !isOverlay
    ? gradientIsDark(bgGradient)
    : !isLightColor(bgColor)
  return {
    '--accent': accentColor,
    '--card-accent': accentColor,
    '--card-bg': bgColor || 'var(--color-bg)',
    ...(hasGradientOrPattern ? { '--card-gradient': bgGradient.replace(/ACCENTCLR/g, encodeURIComponent(accent || '#C5A059')) } : { '--card-gradient': 'none' }),
    '--card-bg-size': isPattern ? bgSize : 'cover',
    '--card-bg-repeat': isPattern ? 'repeat' : 'no-repeat',
    ...(isDarkBg ? {
      '--card-text': '#fff',
      '--card-text-muted': 'rgba(255, 255, 255, 0.7)',
      '--card-text-soft': 'rgba(255, 255, 255, 0.85)',
      '--card-border': 'rgba(255, 255, 255, 0.15)',
      '--card-bio': 'rgba(255, 255, 255, 0.8)',
      '--card-link-bg': 'rgba(255, 255, 255, 0.12)',
      '--card-social-bg': 'oklch(0 0 0 / 0.15)',
      '--card-social-color': 'rgba(255, 255, 255, 0.75)',
      '--card-social-border': 'rgba(255, 255, 255, 0.12)',
      '--card-avatar-bg': '#e8ddd4',
    } : {
      '--card-text': '#111',
      '--card-text-muted': '#555',
      '--card-text-soft': '#333',
      '--card-border': 'rgba(0, 0, 0, 0.1)',
      '--card-bio': '#333',
      '--card-link-bg': bgGradient ? 'rgba(0, 0, 0, 0.04)' : 'oklch(1 0 0 / 0.7)',
      '--card-social-bg': 'oklch(1 0 0 / 0.5)',
      '--card-social-color': 'oklch(0.35 0.008 35 / 0.8)',
      '--card-social-border': 'oklch(0 0 0 / 0.08)',
      '--card-avatar-bg': '#2a2520',
    }),
  }
}

/* ---------- CardFace: renders the visual content for one profile ---------- */

export default function CardFace({ profile, animateIn }) {
  const d = {
    ...DEFAULT_DATA,
    ...profile,
    photo: profile.photo_url || profile.photo || '',
    bgColor: profile.bg_color || profile.bgColor || '',
    bgGradient: profile.bg_gradient || profile.bgGradient || '',
  }
  const { links: rawLinks = {}, accent = '', font = '' } = d
  const accentColor = accent || 'var(--color-primary-l)'
  const fontClass = font && font !== 'serif' ? `protofile-card--${font}` : ''
  const initials = d.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const links = Array.isArray(rawLinks) ? rawLinks : Object.values(rawLinks).filter(v => v)
  const activeLinks = links.filter(l => l.url?.trim()).map(l => [l.label, l.url, l.type])
  const cardLinks = activeLinks.filter(([label, url, type]) => !isSocialLink(label, url, type))
  const circleLinks = activeLinks.filter(([label, url, type]) => isSocialLink(label, url, type))

  return (
    <>
      <div className="protofile-card__bar" style={{ background: accentColor }} />
      <div className={`protofile-card__body ${fontClass}`}>
        {d.photo ? (
          <div className="protofile-card__photo-wrapper" style={{ borderColor: accentColor }}>
            <img src={d.photo} alt="" className="protofile-card__photo" loading="lazy" />
          </div>
        ) : (
          <div className="protofile-card__avatar" aria-hidden="true" style={{ color: accentColor }}>
            <span>{initials}</span>
          </div>
        )}

        <div className="protofile-card__header">
          <h2 className="protofile-card__name">{d.name}</h2>
          <p className="protofile-card__role">{d.role}</p>
        </div>

        {d.bio && (
          <div className="protofile-card__bio">
            <p>{d.bio}</p>
          </div>
        )}

        {circleLinks.length > 0 && (
          <div className="protofile-card__links">
            {circleLinks.map(([label, url], i) => {
              const iconKey = detectIconKey(label, url)
              return (
                <a
                  key={`${label}-${i}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="protofile-card__link"
                  onClick={animateIn ? e => e.preventDefault() : null}
                  title={LINK_LABELS[label] || label}
                  data-platform={detectPlatformKey(label, url)}
                >
                  {renderPlatformIcon(iconKey, 14)}
                </a>
              )
            })}
          </div>
        )}

        {cardLinks.length > 0 && (
          <div className="protofile-card__card-links">
            {cardLinks.map(([label, url], i) => (
              <a
                key={`card-${label}-${i}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="protofile-card__card-link"
                onClick={animateIn ? e => e.preventDefault() : null}
              >
                <span className="protofile-card__card-link-label">{label}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
