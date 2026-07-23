import './CardFace.css'
import { renderPlatformIcon, detectIconKey, detectPlatformKey, detectIcon, GENERIC_ICON, isLightColor, gradientIsDark, isSocialLink } from '../../lib/icons.jsx'
import { DEFAULT_DATA, LINK_LABELS } from './demoProfiles.js'
import './sharedProtofile/Typography.css'
import './sharedProtofile/PhotoAvatar.css'
import './sharedProtofile/SocialIcons.css'
import './sharedProtofile/Layout.css'
import './sharedProtofile/LinkButtons.css'
import './sharedProtofile/Utilities.css'

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
  const isAccentOverlay = bgGradient?.includes('color-mix')
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
  const { links: rawLinks = {}, accent = '', font = '', button_style = 'solid', button_corner = 'rounded', button_color = '', button_text_color = '', social_style = 'default', detect_icons = true } = d
  const accentColor = accent || 'var(--color-primary-l)'
  const isGooey = d.bgGradient?.startsWith?.('__gooey__')
  const isAccentOverlay = !isGooey && d.bgGradient?.includes?.('color-mix')
  const btnStyleClass = `protofile__link-btn--${button_style}`
  const cornerClass = `protofile__link-btn--${button_corner}`
  const initials = d.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const links = Array.isArray(rawLinks) ? rawLinks : Object.values(rawLinks).filter(v => v)

  // Same logic as SharedProtofile: social links → circles at top,
  // everything else (sections + non-social links) in order below
  const socialLinks = links.filter(l => !l.isSection && l.url?.trim() && isSocialLink(l.label, l.url, l.type))
  const otherItems = links.filter(l => !isSocialLink(l.label, l.url, l.type))

  const btnInlineStyle = {
    ...(button_color && button_style === 'solid' ? { background: button_color, borderColor: button_color } : {}),
    ...(button_text_color ? { color: button_text_color } : {}),
  }

  return (
    <>
      <div className="protofile__accent-bar" style={{ background: accentColor }} />
      <main className={`protofile__main ${isGooey ? 'protofile__main--gooey' : ''} ${isAccentOverlay ? 'protofile__main--accent-overlay' : ''}`.trim()}>
        {d.photo ? (
          <div className="protofile__photo-wrapper" style={{ borderColor: accentColor }}>
            <img src={d.photo} alt="" className="protofile__photo" loading="lazy" />
          </div>
        ) : (
          <div className="protofile__avatar" aria-hidden="true" style={{ color: accentColor }}>
            {initials}
          </div>
        )}

        <h1 className="protofile__name">{d.name}</h1>
        <p className="protofile__role">{d.role}</p>

        {d.bio && (
          <p className="protofile__bio">{d.bio}</p>
        )}

        {socialLinks.length > 0 && (
          <div className={`protofile__socials${social_style !== 'default' ? ` protofile__socials--${social_style}` : ''}`}>
            {socialLinks.map((l, i) => {
              const iconKey = detectIconKey(l.label, l.url)
              return (
                <a
                  key={`social-${i}`}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="protofile__social-btn"
                  onClick={animateIn ? e => e.preventDefault() : null}
                  title={LINK_LABELS[l.label] || l.label}
                  data-platform={detectPlatformKey(l.label, l.url)}
                >
                  {renderPlatformIcon(iconKey, 14)}
                </a>
              )
            })}
          </div>
        )}

        {otherItems.length > 0 && (
          <div className="protofile__links">
            {otherItems.map((item, i) =>
              item.isSection ? (
                <div key={`sect-${i}`} className="protofile__section-heading">{item.label}</div>
              ) : (
                <a
                  key={`link-${i}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`protofile__link-btn ${btnStyleClass} ${cornerClass}`.trim()}
                  style={btnInlineStyle}
                  onClick={animateIn ? e => e.preventDefault() : null}
                >
                  <span className="protofile__link-body">
                    {detect_icons && <span className="protofile__link-icon" aria-hidden="true">{detectIcon(item.label, item.url) || GENERIC_ICON}</span>}
                    <span className="protofile__link-label">{item.label}</span>
                  </span>
                </a>
              )
            )}
          </div>
        )}
      </main>
    </>
  )
}
