import './ProtofileCard.css'
import { FaGlobe, FaLinkedin, FaTwitter, FaGithub, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa'

const DEFAULT_DATA = {
  name: 'Jordan Mitchell',
  role: 'Product Designer · Independent',
  email: 'jordan@protome.io',
  location: 'San Francisco, CA',
  bio: 'Designing thoughtful digital experiences at the intersection of craft and purpose. Previously at Figma, currently building protome.',
  tags: ['Product Design', 'Design Systems', 'Prototyping'],
  photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
  links: [
    { label: 'Website', url: '#' },
    { label: 'LinkedIn', url: '#' },
    { label: 'GitHub', url: '#' },
  ],
  accent: '',
  bgColor: '',
  font: '',
}

const LINK_ICONS = {
  website: <FaGlobe size={14} key="website" />,
  linkedin: <FaLinkedin size={14} key="linkedin" />,
  twitter: <FaTwitter size={14} key="twitter" />,
  github: <FaGithub size={14} key="github" />,
  instagram: <FaInstagram size={14} key="instagram" />,
  youtube: <FaYoutube size={14} key="youtube" />,
  tiktok: <FaTiktok size={14} key="tiktok" />,
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
