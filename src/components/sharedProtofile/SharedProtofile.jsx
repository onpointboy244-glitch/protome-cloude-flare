import { useState, useRef, useEffect, useCallback } from 'react'
import { detectPlatformKey } from '../createSection/formConstants'
import { detectIcon, GENERIC_ICON, isLightColor, isSocialLink } from './constants.jsx'
import ShareButton from './ShareButton'
import LinkItem from './LinkItem'
import ReportModal from './ReportModal'
import './SharedProtofile.css'

/**
 * Determine if a gradient is dark by extracting hex colors from the CSS string
 * and checking their average brightness. Falls back to radial = dark for presets.
 */
function gradientIsDark(css) {
  const hexColors = css.match(/#[a-f0-9]{3,8}/gi)
  if (hexColors && hexColors.length > 0) {
    const darkCount = hexColors.filter(c => !isLightColor(c)).length
    return darkCount > hexColors.length / 2
  }
  // Fallback: radial presets are all dark, linear presets are all light
  return css.includes('radial')
}

export default function SharedProtofile({ data }) {
  const [copiedLink, setCopiedLink] = useState(null)
  const copiedTimeoutRef = useRef(null)
  const d = {
    ...data,
    bgColor: data.bg_color || data.bgColor || '',
    bgGradient: data.bg_gradient || data.bgGradient || '',
  }
  const { name, role, bio, photo, photo_url, links, accent, bgColor, bgGradient, font } = d
  const accentColor = accent || 'var(--color-primary-l)'
  // Only check raw hex accent — skip the CSS variable fallback
  const isAccentLight = accent ? isLightColor(accent) : false
  const accentHoverText = isAccentLight ? '#000' : '#fff'
  const isSans = font === 'sans'
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : ''

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
    }
  }, [])

  const handleCopyLink = useCallback((url) => {
    const href = url.startsWith('http') ? url : `https://${url}`
    if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current)
    if (navigator.share) {
      navigator.share({ url: href }).catch(() => {})
    } else {
      navigator.clipboard.writeText(href).catch(() => {})
      setCopiedLink(url)
      copiedTimeoutRef.current = setTimeout(() => setCopiedLink(null), 2000)
    }
  }, [])

  const [reportOpen, setReportOpen] = useState(false)
  const linkItems = Array.isArray(links) ? links : []
  const socialLinks = linkItems.filter(l => !l.isSection && isSocialLink(l.label, l.url, l.type))
  const otherLinks = linkItems.filter(l => !isSocialLink(l.label, l.url, l.type))
  const photoSrc = photo_url || photo
  const hasPhoto = !!photoSrc
  const isDarkBg = bgGradient
    ? gradientIsDark(bgGradient)
    : !isLightColor(bgColor)
  const isLightBg = isLightColor(bgColor)

  return (
    <div
      className={`linktree ${isSans ? 'linktree--sans' : ''} ${bgGradient ? 'linktree--gradient' : ''} ${isLightBg ? 'linktree--light' : ''} ${isDarkBg ? 'linktree--dark' : ''}`}
      style={{
        '--accent': accentColor,
        '--accent-hover-text': accentHoverText,
        '--bg-color': bgColor || 'var(--color-bg)',
        ...(bgGradient ? { '--bg-gradient': bgGradient } : {}),
      }}
    >
      <div className="linktree__card">
        <div className="linktree__accent-bar" style={{ background: accentColor }} />
        <main className="linktree__main">
        {/* Share — top left */}
        <div className="linktree__share-wrapper">
          <ShareButton accentColor={accentColor} isLightBg={isLightBg} />
        </div>

        {/* Photo / Avatar */}
        {hasPhoto ? (
          <div className="linktree__photo-wrapper">
            <img src={photoSrc} alt={name || ''} className="linktree__photo" loading="lazy" />
          </div>
        ) : (
          <div className="linktree__avatar" style={{ color: accentColor }}>
            {initials}
          </div>
        )}

        {/* Name */}
        {name && <h1 className="linktree__name">{name}</h1>}

        {/* Role */}
        {role && <p className="linktree__role">{role}</p>}

        {/* Bio */}
        {bio && <p className="linktree__bio">{bio}</p>}

        {/* Social icon row */}
        {socialLinks.length > 0 && (
          <div className="linktree__socials">
            {socialLinks.map((link, i) => {
              const icon = detectIcon(link.label, link.url) || GENERIC_ICON
              const href = link.url.startsWith('http') ? link.url : `https://${link.url}`
              return (
                <a
                  key={`social-${link.id || i}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="linktree__social-btn"
                  title={link.label}
                  aria-label={link.label}
                  data-platform={detectPlatformKey(link.label, link.url)}
                >
                  {icon}
                </a>
              )
            })}
          </div>
        )}

        {/* Non-social links: sections + buttons */}
        <div className="linktree__links">
          {otherLinks.map((item, i) =>
            item.isSection ? (
              <div key={`sect-${item.id || i}`} className="linktree__section-heading">{item.label}</div>
            ) : (
              <LinkItem key={`link-${item.id || i}`} item={item} copiedLink={copiedLink} onCopy={handleCopyLink} />
            )
          )}
        </div>

        {/* Footer */}
        <div className="linktree__footer">
          <a href="/" className="linktree__brand">
            <span className="linktree__brand-mark">
              <span className="linktree__brand-diamond" style={{ background: accentColor }} />
              <span className="linktree__brand-line" />
            </span>
            protome
          </a>
          <div className="linktree__footer-links">
            <a href="/privacy" className="linktree__footer-link">Privacy</a>
            <a href="/terms" className="linktree__footer-link">Terms</a>
            <button onClick={() => setReportOpen(true)} className="linktree__footer-link linktree__footer-link--report">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 10 10h0A10 10 0 0 0 12 2z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Report
            </button>
          </div>
        </div>
      </main>
      </div>
      {reportOpen && <ReportModal username={data.username} onClose={() => setReportOpen(false)} />}
    </div>
  )
}
