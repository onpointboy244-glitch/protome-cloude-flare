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
}

const LINK_LABELS = {
  website: 'Website',
  linkedin: 'LinkedIn',
  twitter: 'X / Twitter',
  github: 'GitHub',
}

export default function ProtofileCard({ data = DEFAULT_DATA, compact }) {
  const d = { ...DEFAULT_DATA, ...data }
  const { links: rawLinks = {}, accent = '', bgColor = '', font = '' } = d
  const accentColor = accent || 'var(--color-primary-l)'
  const isSans = font === 'sans'
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
      className={`protofile-card ${compact ? 'protofile-card--compact' : ''} ${isSans ? 'protofile-card--sans' : ''}`}
      role="article"
      aria-label="Protofile preview"
      style={{ '--card-accent': accentColor, '--card-bg': bgColor || 'var(--color-bg)' }}
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
              const iconKey = Array.isArray(rawLinks)
                ? (Object.keys(LINK_ICONS).find(k => label.toLowerCase().includes(k)) || 'website')
                : label
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
