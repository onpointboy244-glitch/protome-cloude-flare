import { detectPlatformKey, detectIcon, GENERIC_ICON } from '../../lib/icons.jsx'
import './LinkButtons.css'

export default function LinkItem({ item, copiedLink, onCopy, showIcon = true }) {
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
        className={`protofile__link-share ${copiedLink === item.url ? 'protofile__link-share--shared' : ''}`}
        onClick={() => onCopy(item.url)}
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
    </div>
  )
}
