import { useState, useRef, useEffect } from 'react'
import {
  FaWhatsapp, FaTelegram, FaFacebook,
  FaSnapchat, FaLinkedin,
  FaEnvelope, FaFacebookMessenger,
} from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import './SharePopup.css'

const isMobileEnv = typeof window !== 'undefined' ? window.innerWidth < 768 : false

const SOCIALS = [
  {
    id: 'twitter',
    name: 'X',
    color: '#000',
    icon: <FaXTwitter />,
    url: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    icon: <FaFacebook />,
    url: (text, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
  },
  {
    id: 'messenger',
    name: 'Messenger',
    color: '#00B2FF',
    icon: <FaFacebookMessenger />,
    url: (text, url) => isMobileEnv
      ? `fb-messenger://share?link=${encodeURIComponent(url)}`
      : `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(url)}`,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    color: '#25D366',
    icon: <FaWhatsapp />,
    url: (text, url) => `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    color: '#0088cc',
    icon: <FaTelegram />,
    url: (text, url) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    color: '#FFFC00',
    icon: <FaSnapchat />,
    url: (text, url) => `https://www.snapchat.com/scan/attachment-url?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'gmail',
    name: 'Gmail',
    color: '#EA4335',
    icon: <FaEnvelope />,
    url: (text, url) => isMobileEnv
      ? `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`
      : `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    icon: <FaLinkedin />,
    url: (text, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
]

export default function SharePopup({ url, title, linkLabel, photo, onClose, hideBrand }) {
  const [copied, setCopied] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [ogData, setOgData] = useState(null)
  const [ogLoading, setOgLoading] = useState(false)
  const modalRef = useRef(null)

  const VISIBLE_COUNT = 4
  const visible = showAll ? SOCIALS : SOCIALS.slice(0, VISIBLE_COUNT)
  const hasMore = SOCIALS.length > VISIBLE_COUNT

  // Fetch OG tags for link shares
  useEffect(() => {
    if (!linkLabel || !url) return
    setOgLoading(true)
    fetch(`/api/og?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then(data => {
        if (data.title) setOgData(data)
        else setOgData(null)
      })
      .catch(() => setOgData(null))
      .finally(() => setOgLoading(false))
  }, [linkLabel, url])

  const VISIBLE_COUNT = 4
  const visible = showAll ? SOCIALS : SOCIALS.slice(0, VISIBLE_COUNT)
  const hasMore = SOCIALS.length > VISIBLE_COUNT

  // Focus trap + Escape key — same as before
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return
    const focusable = modal.querySelectorAll('button, input, textarea, [tabindex]:not([tabindex="-1"])')
    if (focusable.length > 0) focusable[0].focus()
    const handleKey = (e) => {
      if (e.key === 'Escape') { onClose?.(); return }
      if (e.key !== 'Tab') return
      const els = modal.querySelectorAll('button, input, textarea, [tabindex]:not([tabindex="-1"])')
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const shareUrl = url || window.location.href
  const isProfileShare = !linkLabel
  const shareText = title ? `Check out ${title}` : 'Check this out'

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl })
        onClose()
        return
      } catch { /* user cancelled */ }
    }
  }

  const handleSocialShare = (social) => {
    const socialUrl = social.url(shareText, shareUrl)
    // Deep links open the native app directly on mobile
    if (isMobileEnv && (socialUrl.startsWith('mailto:') || socialUrl.startsWith('fb-messenger://'))) {
      const a = document.createElement('a')
      a.href = socialUrl
      a.target = '_blank'
      a.rel = 'noopener,noreferrer'
      a.click()
    } else if (isMobileEnv) {
      window.open(socialUrl, '_blank', 'noopener,noreferrer')
    } else {
      window.open(socialUrl, '_blank', 'noopener,noreferrer,width=600,height=500')
    }
  }

  return (
    <div className="protofile__share-popup-overlay" onClick={onClose}>
      <div ref={modalRef} className="protofile__share-popup" onClick={e => e.stopPropagation()}>
        <div className="protofile__share-popup-header">
          <span className="protofile__share-popup-title">{isProfileShare ? 'Share protome' : 'Share link'}</span>
          <button className="protofile__share-popup-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Preview card */}
        <div className={`protofile__share-popup-preview ${ogData ? 'protofile__share-popup-preview--link' : ''} ${!ogData?.image && !photo ? 'protofile__share-popup-preview--no-img' : ''}`}>
          {ogLoading ? (
            <div className="protofile__share-popup-preview-loading" />
          ) : ogData?.image ? (
            <img
              src={ogData.image}
              alt=""
              className="protofile__share-popup-preview-img"
              loading="lazy"
            />
          ) : photo ? (
            <img
              src={photo}
              alt=""
              className="protofile__share-popup-preview-img"
              loading="lazy"
            />
          ) : null}
          <div className="protofile__share-popup-preview-info">
            {linkLabel && <span className="protofile__share-popup-preview-label">{linkLabel}</span>}
            {ogData?.title && <span className="protofile__share-popup-preview-og-title">{ogData.title}</span>}
            {ogData?.description && <span className="protofile__share-popup-preview-og-desc">{ogData.description}</span>}
            <span className="protofile__share-popup-preview-url">{shareUrl}</span>
          </div>
        </div>

        {/* Social icons + copy link */}
        <div className={`protofile__share-popup-socials ${showAll ? 'protofile__share-popup-socials--expanded' : ''}`}>
          {/* Copy link — first */}
          <button
            className={`protofile__share-popup-social-btn ${copied ? 'protofile__share-popup-social-btn--copied' : 'protofile__share-popup-social-btn--copy'}`}
            onClick={handleCopyLink}
            aria-label={copied ? 'Copied!' : 'Copy link'}
            title={copied ? 'Copied!' : 'Copy link'}
          >
            <span className="protofile__share-icon-wrap">
              {copied ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              )}
            </span>
          </button>

          {visible.map(s => (
            <button
              key={s.id}
              className="protofile__share-popup-social-btn"
              onClick={() => handleSocialShare(s)}
              aria-label={`Share on ${s.name}`}
              title={s.name}
              style={{ '--social-color': s.color }}
            >
              <span className="protofile__share-icon-wrap">{s.icon}</span>
            </button>
          ))}

          {hasMore && !showAll && (
            <button
              className="protofile__share-popup-social-btn protofile__share-popup-social-btn--toggle"
              onClick={() => setShowAll(true)}
              aria-label="Show more"
              title="Show more"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          )}
          {showAll && isMobileEnv && (
            <button
              className="protofile__share-popup-more-btn"
              onClick={handleNativeShare}
              aria-label="More options"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
              </svg>
              More
            </button>
          )}
        </div>

        {!hideBrand && (
          <a
            href="/"
            className="protofile__share-popup-brand"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="protofile__share-popup-brand-mark">
              <span className="protofile__share-popup-brand-diamond" />
              <span className="protofile__share-popup-brand-line" />
            </span>
            <span className="protofile__share-popup-brand-text">
              join <strong>{title || 'them'}</strong> on&nbsp;pro<span className="protofile__share-popup-brand-mid">t</span>ome
            </span>
          </a>
        )}
      </div>
    </div>
  )
}