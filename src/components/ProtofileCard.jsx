import './ProtofileCard.css'

const DEFAULT_DATA = {
  name: 'Jordan Mitchell',
  role: 'Product Designer · Independent',
  email: 'jordan@protome.io',
  location: 'San Francisco, CA',
  bio: 'Designing thoughtful digital experiences at the intersection of craft and purpose. Previously at Figma, currently building protome.',
  tags: ['Product Design', 'Design Systems', 'Prototyping'],
  photo: '',
  links: { website: '', linkedin: '', twitter: '', github: '' },
  accent: '',
  bgColor: '',
  font: '',
}

const LINK_ICONS = {
  website: <svg key="website" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  linkedin: <svg key="linkedin" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  twitter: <svg key="twitter" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  github: <svg key="github" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>,
  instagram: <svg key="instagram" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  youtube: <svg key="youtube" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  tiktok: <svg key="tiktok" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
}

const LINK_LABELS = {
  website: 'Website',
  linkedin: 'LinkedIn',
  twitter: 'X / Twitter',
  github: 'GitHub',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
}

function detectIconKey(label = '', url = '') {
  const lbl = label.toLowerCase()
  const full = `${lbl} ${url}`.toLowerCase()

  // Label-only checks — what the user chose beats anything in the URL
  if (/\btiktok\b/.test(lbl)) return 'tiktok'
  if (/\binstagram\b/.test(lbl)) return 'instagram'
  if (/\byoutube\b/.test(lbl)) return 'youtube'
  if (/\blinkedin\b/.test(lbl)) return 'linkedin'
  if (/\btwitter\b/.test(lbl) || /\bx\b/.test(lbl)) return 'twitter'
  if (/\bgithub\b/.test(lbl)) return 'github'

  // Fallback: check full text (label + URL)
  if (/\blinkedin\b/.test(full)) return 'linkedin'
  if (/\btwitter\b/.test(full) || /\bx\.com\b/.test(full) || /\/x\b/.test(full)) return 'twitter'
  if (/\bgithub\b/.test(full)) return 'github'
  if (/\binstagram\b/.test(full)) return 'instagram'
  if (/\byoutube\b/.test(full)) return 'youtube'
  if (/\btiktok\b/.test(full)) return 'tiktok'
  if (/\b(website|web|site|portfolio)\b/.test(full)) return 'website'
  return 'website'
}

export default function ProtofileCard({ data = DEFAULT_DATA, compact }) {
  const d = {
    ...DEFAULT_DATA,
    ...data,
    photo: data.photo_url || data.photo || '',
    bgColor: data.bg_color || data.bgColor || '',
    bgGradient: data.bg_gradient || data.bgGradient || '',
  }
  const { links: rawLinks = {}, accent = '', bgColor = '', bgGradient = '', font = '' } = d
  const accentColor = accent || 'var(--color-primary-l)'
  const isSans = font === 'sans'
  // Detect dark gradient for text contrast
  const isDarkBg = !!bgGradient && bgGradient.includes('radial')
  const initials = d.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Support both array format (Linktree) and object format (legacy)
  const links = Array.isArray(rawLinks) ? rawLinks : rawLinks
  const activeLinks = Array.isArray(links)
    ? links.filter(l => l.url?.trim()).map(l => [l.label, l.url])
    : Object.entries(links).filter(([, v]) => v?.trim())

  return (
    <div
      className={`protofile-card ${compact ? 'protofile-card--compact' : ''} ${isSans ? 'protofile-card--sans' : ''} ${bgGradient ? 'protofile-card--gradient' : ''}`}
      role="article"
      aria-label="Protofile preview"
      style={{
        '--card-accent': accentColor,
        '--card-bg': bgColor || 'var(--color-bg)',
        ...(bgGradient ? {
          '--card-gradient': bgGradient,
          ...(isDarkBg ? {
            '--card-text': '#fff',
            '--card-text-muted': 'rgba(255, 255, 255, 0.7)',
            '--card-text-soft': 'rgba(255, 255, 255, 0.85)',
            '--card-border': 'rgba(255, 255, 255, 0.15)',
            '--card-bio': 'rgba(255, 255, 255, 0.8)',
          } : {}),
        } : {}),
      }}
    >
      <div className="protofile-card__bar" style={{ background: accentColor }} />
      <div className="protofile-card__body">
        {/* Avatar or Photo */}
        {d.photo ? (
          <div className="protofile-card__photo-wrapper" style={{ borderColor: accentColor }}>
            <img src={d.photo} alt="" className="protofile-card__photo" />
          </div>
        ) : (
          <div className="protofile-card__avatar" aria-hidden="true" style={{ background: `color-mix(in oklch, ${accentColor}, white 60%)`, color: accentColor }}>
            <span>{initials}</span>
          </div>
        )}

        <div className="protofile-card__header">
          <h2 className="protofile-card__name">{d.name}</h2>
          <p className="protofile-card__role">{d.role}</p>
        </div>

        <div className="protofile-card__contact">
          {d.email && (
            <span className="protofile-card__contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {d.email}
            </span>
          )}
          {d.location && (
            <span className="protofile-card__contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {d.location}
            </span>
          )}
        </div>

        {d.bio && (
          <div className="protofile-card__bio">
            <p>{d.bio}</p>
          </div>
        )}

        {/* Social Links */}
        {activeLinks.length > 0 && (
          <div className="protofile-card__links">
            {activeLinks.map(([label, url]) => {
                const iconKey = detectIconKey(label, url)
                return (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="protofile-card__link"
                  title={LINK_LABELS[label] || label}
                >
                  {LINK_ICONS[iconKey] || LINK_ICONS.website}
                </a>
              )
            })}
          </div>
        )}

        {/* Tags */}
        {d.tags?.length > 0 && (
          <div className="protofile-card__tags">
            {d.tags.map(tag => (
              <span key={tag} className="protofile-card__tag" style={{ color: accentColor, background: `color-mix(in oklch, ${accentColor}, white 80%)` }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { DEFAULT_DATA, LINK_ICONS, LINK_LABELS }
