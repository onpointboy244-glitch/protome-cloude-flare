import { useState } from 'react'
import { reportProfile } from '../lib/api'
import './SharedProtofile.css'
import { FaGlobe, FaLinkedin, FaTwitter, FaGithub, FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaSnapchat, FaDiscord, FaTwitch, FaPinterest, FaReddit, FaTelegram, FaWhatsapp } from 'react-icons/fa'
import { FaThreads, FaBluesky, FaLink } from 'react-icons/fa6'

const LINK_ICONS = {
  website: <FaGlobe size={18} />,
  linkedin: <FaLinkedin size={18} />,
  twitter: <FaTwitter size={18} />,
  github: <FaGithub size={18} />,
  instagram: <FaInstagram size={18} />,
  youtube: <FaYoutube size={18} />,
  tiktok: <FaTiktok size={18} />,
  facebook: <FaFacebook size={18} />,
  snapchat: <FaSnapchat size={18} />,
  discord: <FaDiscord size={18} />,
  twitch: <FaTwitch size={18} />,
  pinterest: <FaPinterest size={18} />,
  reddit: <FaReddit size={18} />,
  telegram: <FaTelegram size={18} />,
  whatsapp: <FaWhatsapp size={18} />,
  threads: <FaThreads size={18} />,
  bluesky: <FaBluesky size={18} />,
}

const GENERIC_ICON = <FaLink size={18} />

const SOCIAL_PLATFORMS = ['instagram', 'twitter', 'github', 'linkedin', 'youtube', 'tiktok', 'facebook', 'snapchat', 'discord', 'twitch', 'pinterest', 'reddit', 'telegram', 'whatsapp', 'threads', 'bluesky']

function detectIcon(label = '', url = '') {
  const lbl = label.toLowerCase()
  const full = `${lbl} ${url}`.toLowerCase()

  // Label-only checks — these match what the user chose, not the URL
  if (/\btiktok\b/.test(lbl)) return LINK_ICONS.tiktok
  if (/\binstagram\b/.test(lbl)) return LINK_ICONS.instagram
  if (/\byoutube\b/.test(lbl)) return LINK_ICONS.youtube
  if (/\blinkedin\b/.test(lbl)) return LINK_ICONS.linkedin
  if (/\btwitter\b/.test(lbl) || /\bx\b/.test(lbl)) return LINK_ICONS.twitter
  if (/\bgithub\b/.test(lbl)) return LINK_ICONS.github
  if (/\bfacebook\b/.test(lbl)) return LINK_ICONS.facebook
  if (/\bsnapchat\b/.test(lbl)) return LINK_ICONS.snapchat
  if (/\bdiscord\b/.test(lbl)) return LINK_ICONS.discord
  if (/\btwitch\b/.test(lbl)) return LINK_ICONS.twitch
  if (/\bpinterest\b/.test(lbl)) return LINK_ICONS.pinterest
  if (/\breddit\b/.test(lbl)) return LINK_ICONS.reddit
  if (/\btelegram\b/.test(lbl)) return LINK_ICONS.telegram
  if (/\bwhatsapp\b/.test(lbl)) return LINK_ICONS.whatsapp
  if (/\bthreads\b/.test(lbl)) return LINK_ICONS.threads
  if (/\bbluesky\b/.test(lbl)) return LINK_ICONS.bluesky

  // Fallback: check full text (label + URL) for the rest
  if (/\blinkedin\b/.test(full)) return LINK_ICONS.linkedin
  if (/\btwitter\b/.test(full) || /\bx\.com\b/.test(full) || /\/x\b/.test(full)) return LINK_ICONS.twitter
  if (/\bgithub\b/.test(full)) return LINK_ICONS.github
  if (/\binstagram\b/.test(full)) return LINK_ICONS.instagram
  if (/\byoutube\b/.test(full)) return LINK_ICONS.youtube
  if (/\btiktok\b/.test(full)) return LINK_ICONS.tiktok
  if (/\bfacebook\b/.test(full) || /\bfb\.com\b/.test(full)) return LINK_ICONS.facebook
  if (/\bsnapchat\b/.test(full)) return LINK_ICONS.snapchat
  if (/\bdiscord\b/.test(full)) return LINK_ICONS.discord
  if (/\btwitch\b/.test(full)) return LINK_ICONS.twitch
  if (/\bpinterest\b/.test(full)) return LINK_ICONS.pinterest
  if (/\breddit\b/.test(full)) return LINK_ICONS.reddit
  if (/\btelegram\b/.test(full) || /\bt\.me\b/.test(full)) return LINK_ICONS.telegram
  if (/\bwhatsapp\b/.test(full)) return LINK_ICONS.whatsapp
  if (/\bthreads\b/.test(full)) return LINK_ICONS.threads
  if (/\bbluesky\b/.test(full) || /\bsky\.social\b/.test(full)) return LINK_ICONS.bluesky
  if (/\b(website|web|site|portfolio)\b/.test(full)) return LINK_ICONS.website
  return null
}

function isSocialLink(label = '', url = '', type) {
  if (type === 'website' || type === 'coding') return false
  if (type === 'social') return true
  const text = `${label} ${url}`.toLowerCase()
  return [...SOCIAL_PLATFORMS, 'github'].some(p => new RegExp(`\\b${p}\\b`).test(text))
}

function detectPlatformKey(label = '', url = '') {
  const text = `${label} ${url}`.toLowerCase()
  const PLATFORMS = ['instagram', 'twitter', 'facebook', 'linkedin', 'youtube', 'tiktok', 'snapchat', 'discord', 'twitch', 'pinterest', 'reddit', 'telegram', 'whatsapp', 'threads', 'bluesky', 'github']
  for (const p of PLATFORMS) {
    if (text.includes(p)) return p
  }
  if (/\b(website|web|site|portfolio)\b/.test(text)) return 'website'
  return null
}

const REPORT_REASONS = [
  'Spam or scam',
  'Inappropriate content',
  'Fake profile',
  'Harassment or bullying',
  'Impersonation',
  'Other',
]

function ReportModal({ username, onClose }) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) return
    setStatus('sending')
    setErrorMsg('')
    try {
      await reportProfile(username, { reason, details: details.trim() || null })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  return (
    <div className="linktree__modal-overlay" onClick={onClose}>
      <div className="linktree__modal" onClick={e => e.stopPropagation()}>
        {status === 'success' ? (
          <>
            <div className="linktree__modal-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3 className="linktree__modal-title">Report submitted</h3>
            <p className="linktree__modal-text">Thanks for letting us know. We&apos;ll review this profile.</p>
            <button className="btn btn--primary" onClick={onClose} style={{ marginTop: 'var(--space-xl)' }}>Done</button>
          </>
        ) : (
          <>
            <div className="linktree__modal-header">
              <h3 className="linktree__modal-title">Report profile</h3>
              <button className="linktree__modal-close" onClick={onClose} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="linktree__modal-text">Why are you reporting <strong>/{username}</strong>?</p>
            <form onSubmit={handleSubmit}>
              <div className="linktree__modal-options">
                {REPORT_REASONS.map(r => (
                  <label key={r} className={`linktree__modal-option ${reason === r ? 'linktree__modal-option--selected' : ''}`}>
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={e => setReason(e.target.value)}
                      className="linktree__modal-radio"
                    />
                    {r}
                  </label>
                ))}
              </div>
              <textarea
                className="linktree__modal-textarea"
                placeholder="Additional details (optional)"
                value={details}
                onChange={e => setDetails(e.target.value)}
                rows={3}
              />
              {status === 'error' && <p className="linktree__modal-error">{errorMsg}</p>}
              <button
                type="submit"
                className="btn btn--primary"
                disabled={!reason || status === 'sending'}
                style={{ marginTop: 'var(--space-lg)', width: '100%' }}
              >
                {status === 'sending' ? 'Submitting…' : 'Submit report'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function ShareButton({ accentColor, isLightBg }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ url })
        return
      } catch {
        // user cancelled or API unavailable — fall through to copy
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable too — do nothing
    }
  }

  return (
    <button
      className={`linktree__share-btn ${copied ? 'linktree__share-btn--copied' : ''} ${isLightBg ? 'linktree__share-btn--light' : ''}`}
      onClick={handleShare}
      aria-label={copied ? 'Link copied!' : 'Share profile'}
      title={copied ? 'Link copied!' : 'Share profile'}
      style={{ '--share-accent': accentColor }}
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
    </button>
  )
}

export default function SharedProtofile({ data }) {
  const [copiedLink, setCopiedLink] = useState(null)
  const d = {
    ...data,
    bgColor: data.bg_color || data.bgColor || '',
    bgGradient: data.bg_gradient || data.bgGradient || '',
  }
  const { name, role, bio, photo, photo_url, links, accent, bgColor, bgGradient, font } = d
  const accentColor = accent || 'var(--color-primary-l)'
  const isSans = font === 'sans'
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : ''

  const [reportOpen, setReportOpen] = useState(false)
  const linkItems = Array.isArray(links) ? links : []
  const photoSrc = photo_url || photo
  const hasPhoto = !!photoSrc
  const isDarkBg = !!bgGradient && bgGradient.includes('radial')
  const isLightBg = !isDarkBg && (!!bgGradient || (bgColor && bgColor !== '#ffffff'))

  return (
    <div
      className={`linktree ${isSans ? 'linktree--sans' : ''} ${bgGradient ? 'linktree--gradient' : ''} ${isLightBg ? 'linktree--light' : ''} ${isDarkBg ? 'linktree--dark' : ''}`}
      style={{
        '--accent': accentColor,
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
            <img src={photoSrc} alt={name || ''} className="linktree__photo" />
          </div>
        ) : (
          <div className="linktree__avatar" style={{ background: `color-mix(in oklch, ${accentColor}, white 60%)`, color: accentColor }}>
            {initials}
          </div>
        )}

        {/* Name */}
        {name && <h1 className="linktree__name">{name}</h1>}

        {/* Role */}
        {role && <p className="linktree__role">{role}</p>}

        {/* Bio */}
        {bio && <p className="linktree__bio">{bio}</p>}

        {/* Link buttons */}
        {linkItems.length > 0 && (() => {
          const socialLinks = linkItems.filter(l => !l.isSection && isSocialLink(l.label, l.url, l.type))
          return (
            <>
              {/* Social icon row */}
              {socialLinks.length > 0 && (
                <div className="linktree__socials">
                  {socialLinks.map((link, i) => {
                    const icon = detectIcon(link.label, link.url) || GENERIC_ICON
                    const href = link.url.startsWith('http') ? link.url : `https://${link.url}`
                    return (
                      <a
                        key={`social-${i}`}
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

              {/* Non-social links in order: sections + buttons */}
              <div className="linktree__links">
                {linkItems.filter(l => !isSocialLink(l.label, l.url, l.type)).map((item, i) =>
                  item.isSection ? (
                    <div key={`sect-${i}`} className="linktree__section-heading">{item.label}</div>
                  ) : (
                    <a
                      key={`link-${i}`}
                      href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="linktree__link-btn"
                      data-platform={detectPlatformKey(item.label, item.url)}
                    >
                      <span className="linktree__link-body">
                        <span className="linktree__link-label">{item.label}</span>
                      </span>
                      <button
                        className={`linktree__link-share ${copiedLink === item.url ? 'linktree__link-share--shared' : ''}`}
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          const href = item.url.startsWith('http') ? item.url : `https://${item.url}`
                          if (navigator.share) {
                            navigator.share({ url: href }).catch(() => {})
                          } else {
                            navigator.clipboard.writeText(href)
                            setCopiedLink(item.url)
                            setTimeout(() => setCopiedLink(null), 2000)
                          }
                        }}
                        aria-label={copiedLink === item.url ? 'Link shared!' : 'Share link'}
                        title={copiedLink === item.url ? 'Link shared!' : 'Share link'}
                      >
                        {copiedLink === item.url ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                            <polyline points="16 6 12 2 8 6" />
                            <line x1="12" y1="2" x2="12" y2="15" />
                          </svg>
                        )}
                      </button>
                    </a>
                  )
                )}
              </div>
            </>
          )
        })()}

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
