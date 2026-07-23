import { detectPlatformKey, detectIcon, GENERIC_ICON } from '../../../lib/icons.jsx'
import './LinkButtons.css'

export default function LinkItem({ item, onShareLink, showIcon = true, buttonStyle = 'solid', buttonCorner = 'rounded', buttonColor = '', buttonTextColor = '' }) {
  const href = item.url.startsWith('http') ? item.url : `https://${item.url}`
  const icon = showIcon ? (detectIcon(item.label, item.url) || GENERIC_ICON) : null
  const styleClass = buttonStyle !== 'glass' ? `protofile__link-btn--${buttonStyle}` : ''
  const cornerClass = `protofile__link-btn--${buttonCorner}`
  const btnInlineStyle = {
    ...(buttonColor && buttonStyle === 'solid' ? { background: buttonColor, borderColor: buttonColor } : {}),
    ...(buttonTextColor ? { color: buttonTextColor, '--c-text': buttonTextColor } : {}),
  }
  return (
    <div className="protofile__link-row">
      <a
        key={`link-${item.id || item.url}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`protofile__link-btn ${styleClass} ${cornerClass}`.trim()}
        style={btnInlineStyle}
        data-platform={detectPlatformKey(item.label, item.url)}
        data-custom-text={buttonTextColor || undefined}
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>
    </div>
  )
}