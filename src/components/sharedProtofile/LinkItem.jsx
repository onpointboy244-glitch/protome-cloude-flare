import { detectPlatformKey, detectIcon, GENERIC_ICON } from '../../lib/icons.jsx'
import './LinkButtons.css'

export default function LinkItem({ item, onShareLink, showIcon = true }) {
  const href = item.url.startsWith('http') ? item.url : `https://${item.url}`
  const icon = showIcon ? (detectIcon(item.label, item.url) || GENERIC_ICON) : null
  return (
    <div className="protofile__link-row">
      <a
        key={`link-${item.id || item.url}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="protofile__link-btn"
        data-platform={detectPlatformKey(item.label, item.url)}
      >
        <span className="protofile__link-body">
          {icon && <span className="protofile__link-icon" aria-hidden="true">{icon}</span>}
          <span className="protofile__link-label">{item.label}</span>
        </span>
      </a>
      <button
        className="protofile__link-share"
        onClick={onShareLink}
        aria-label="Share link"
        title="Share link"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>
    </div>
  )
}