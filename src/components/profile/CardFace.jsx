import './CardFace.css'
import { renderPlatformIcon, detectIconKey, detectPlatformKey, detectIcon, GENERIC_ICON, isSocialLink } from '../../lib/icons.jsx'
import { computeProfileTheme } from '../../lib/useProfileTheme.js'
import { LINK_LABELS, DEFAULT_DATA } from './demoProfiles.js'
import './sharedProtofile/Typography.css'
import './sharedProtofile/PhotoAvatar.css'
import './sharedProtofile/SocialIcons.css'
import './sharedProtofile/Layout.css'
import './sharedProtofile/LinkButtons.css'
import './sharedProtofile/Utilities.css'

/* ---------- CardFace: renders the visual content for one profile ---------- */

export default function CardFace({ profile, animateIn }) {
  const d = {
    ...DEFAULT_DATA,
    ...profile,
    photo: profile.photo_url || profile.photo || '',
    bgColor: profile.bg_color || profile.bgColor || '',
    bgGradient: profile.bg_gradient || profile.bgGradient || '',
  }
  const theme = computeProfileTheme(d)
  const { accentColor, btnStyleClass, cornerClass, socialClass, mainClass, detectIcons, socialPosition, buttonTextColor } = theme

  const { links: rawLinks = {} } = d
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

  return (
    <>
      <div className="protofile__accent-bar" style={{ background: accentColor }} />
      <main className={mainClass}>
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

        {/* Social icon row — top (default) */}
        {socialPosition !== 'bottom' && socialLinks.length > 0 && (
          <div className={socialClass}>
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
                  onClick={animateIn ? e => e.preventDefault() : null}
                  data-custom-text={buttonTextColor || undefined}
                >
                  <span className="protofile__link-body">
                    {detectIcons && <span className="protofile__link-icon" aria-hidden="true">{detectIcon(item.label, item.url) || GENERIC_ICON}</span>}
                    <span className="protofile__link-label">{item.label}</span>
                  </span>
                </a>
              )
            )}
          </div>
        )}

        {/* Social icon row — bottom */}
        {socialPosition === 'bottom' && socialLinks.length > 0 && (
          <div className={socialClass}>
            {socialLinks.map((l, i) => {
              const iconKey = detectIconKey(l.label, l.url)
              return (
                <a
                  key={`social-b-${i}`}
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
      </main>
    </>
  )
}
