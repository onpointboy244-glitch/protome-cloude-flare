import './ShareButton.css'

function luminance(hex) {
  const h = hex.replace('#', '')
  if (h.length < 6) return 255
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function darken(hex, factor) {
  const h = hex.replace('#', '')
  const r = Math.round(parseInt(h.slice(0, 2), 16) * (1 - factor))
  const g = Math.round(parseInt(h.slice(2, 4), 16) * (1 - factor))
  const b = Math.round(parseInt(h.slice(4, 6), 16) * (1 - factor))
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export default function ShareButton({ accentColor, isLightBg, onShare }) {
  // If accent is too light (white/near-white), darken it for hover bg so it's always visible
  const lum = luminance(accentColor)
  const hoverBg = lum > 200 ? darken(accentColor, 0.15) : accentColor
  // Icon color on hover: always contrast against the background
  // Light bg → dark icon, dark bg → light icon
  const hoverIcon = isLightBg ? (lum > 200 ? '#000' : accentColor) : (lum > 200 ? '#000' : '#fff')

  return (
    <button
      className={`protofile__share-btn ${isLightBg ? 'protofile__share-btn--light' : ''}`}
      onClick={onShare}
      aria-label="Share profile"
      title="Share profile"
      style={{ '--share-accent': accentColor, '--share-hover-bg': hoverBg, '--share-hover-icon': hoverIcon }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" y1="2" x2="12" y2="15" />
      </svg>
    </button>
  )
}