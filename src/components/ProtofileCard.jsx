import { useState, useEffect, useRef } from 'react'
import './ProtofileCard.css'
import { detectIconKey, detectPlatformKey } from './createSection/formConstants'
import { FaGlobe, FaLinkedin, FaTwitter, FaGithub, FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaSnapchat, FaDiscord, FaTwitch, FaPinterest, FaReddit, FaTelegram, FaWhatsapp } from 'react-icons/fa'
import { FaThreads, FaBluesky } from 'react-icons/fa6'

const DEMO_PROFILES = [
  {
    name: 'Jordan Mitchell',
    role: 'Product Designer · Independent',
    bio: 'Designing thoughtful digital experiences at the intersection of craft and purpose. Previously at Figma, currently building protome.',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
    links: [
      { label: 'Portfolio', url: '#' },
      { label: 'LinkedIn', url: '#' },
      { label: 'GitHub', url: '#' },
      { label: 'Twitter', url: '#' },
    ],
    accent: '#c45a3c',
    bgColor: '',
    font: '',
  },
  {
    name: 'Alex Chen',
    role: 'Full-Stack Developer · Open Source',
    bio: 'Building tools for the next million developers. Core contributor to Astro and Vite. Love CLI tools, design systems, and good documentation.',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    links: [
      { label: 'Personal site', url: '#' },
      { label: 'GitHub', url: '#' },
      { label: 'Twitter', url: '#' },
    ],
    accent: '#2563eb',
    bgColor: '',
    font: 'sans',
  },
  {
    name: 'Maya Rivera',
    role: 'Writer · Creative Director',
    bio: 'Words for brands that mean it. Previously copy lead at Mailchimp, now running my own studio. Newsletter hits 40k inboxes weekly.',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    links: [
      { label: 'Newsletter', url: '#' },
      { label: 'Twitter', url: '#' },
      { label: 'Instagram', url: '#' },
      { label: 'Website', url: '#' },
    ],
    accent: '#8b5cf6',
    bgColor: '',
    font: '',
  },
  {
    name: 'Sam Okafor',
    role: 'Indie Maker · No-code',
    bio: 'Shipping SaaS products without writing a line of code. Built 3 profitable tools in 12 months. I teach no-code at buildinpublic.co.',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    links: [
      { label: 'My tools', url: '#' },
      { label: 'YouTube', url: '#' },
      { label: 'Twitter', url: '#' },
      { label: 'TikTok', url: '#' },
      { label: 'Website', url: '#' },
    ],
    accent: '#059669',
    bgColor: '',
    font: 'sans',
  },
]

const CYCLE_MS = 5000 // rotate every 5 seconds

const DEFAULT_DATA = DEMO_PROFILES[0]

const LINK_ICONS = {
  website: <FaGlobe size={14} key="website" />,
  linkedin: <FaLinkedin size={14} key="linkedin" />,
  twitter: <FaTwitter size={14} key="twitter" />,
  github: <FaGithub size={14} key="github" />,
  instagram: <FaInstagram size={14} key="instagram" />,
  youtube: <FaYoutube size={14} key="youtube" />,
  tiktok: <FaTiktok size={14} key="tiktok" />,
  facebook: <FaFacebook size={14} key="facebook" />,
  snapchat: <FaSnapchat size={14} key="snapchat" />,
  discord: <FaDiscord size={14} key="discord" />,
  twitch: <FaTwitch size={14} key="twitch" />,
  pinterest: <FaPinterest size={14} key="pinterest" />,
  reddit: <FaReddit size={14} key="reddit" />,
  telegram: <FaTelegram size={14} key="telegram" />,
  whatsapp: <FaWhatsapp size={14} key="whatsapp" />,
  threads: <FaThreads size={14} key="threads" />,
  bluesky: <FaBluesky size={14} key="bluesky" />,
}

const LINK_LABELS = {
  website: 'Website',
  linkedin: 'LinkedIn',
  twitter: 'X / Twitter',
  github: 'GitHub',
  instagram: 'Instagram',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  facebook: 'Facebook',
  snapchat: 'Snapchat',
  discord: 'Discord',
  twitch: 'Twitch',
  pinterest: 'Pinterest',
  reddit: 'Reddit',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  threads: 'Threads',
  bluesky: 'Bluesky',
}

const SOCIAL_PLATFORMS = ['instagram', 'twitter', 'github', 'linkedin', 'youtube', 'tiktok',
  'facebook', 'snapchat', 'discord', 'twitch', 'pinterest', 'reddit', 'telegram', 'whatsapp',
  'threads', 'bluesky']

function isSocialLink(label = '', url = '', type) {
  if (type === 'website' || type === 'coding') return false
  if (type === 'social') return true
  const text = `${label} ${url}`.toLowerCase()
  return SOCIAL_PLATFORMS.some(p => new RegExp(`\\b${p}\\b`).test(text))
}

export default function ProtofileCard({ data, compact, animateIn }) {
  // Cycle through demo profiles when animateIn is active (Hero section)
  const [profileIndex, setProfileIndex] = useState(0)
  const [fading, setFading] = useState(false)
  const fadeTimer = useRef(null)
  const cycleTimer = useRef(null)

  const source = animateIn ? DEMO_PROFILES[profileIndex] : (data || DEFAULT_DATA)

  useEffect(() => {
    if (!animateIn) return
    cycleTimer.current = setInterval(() => {
      setFading(true)
      fadeTimer.current = setTimeout(() => {
        setProfileIndex(prev => (prev + 1) % DEMO_PROFILES.length)
        setFading(false)
      }, 300)
    }, CYCLE_MS)
    return () => {
      clearInterval(cycleTimer.current)
      clearTimeout(fadeTimer.current)
    }
  }, [animateIn])

  const d = {
    ...DEFAULT_DATA,
    ...source,
    photo: source.photo_url || source.photo || '',
    bgColor: source.bg_color || source.bgColor || '',
    bgGradient: source.bg_gradient || source.bgGradient || '',
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
  const links = Array.isArray(rawLinks) ? rawLinks : Object.values(rawLinks).filter(v => v)
  const activeLinks = Array.isArray(links)
    ? links.filter(l => l.url?.trim()).map(l => [l.label, l.url])
    : []

  // Split into social circle icons and card-style links
  const cardLinks = activeLinks.filter(([label, url]) => !isSocialLink(label, url))
  const circleLinks = activeLinks.filter(([label, url]) => isSocialLink(label, url))

  return (
    <div
      className={`protofile-card ${compact ? 'protofile-card--compact' : ''} ${isSans ? 'protofile-card--sans' : ''} ${bgGradient ? 'protofile-card--gradient' : ''} ${fading ? 'protofile-card--fading' : ''}`}
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

        {d.bio && (
          <div className="protofile-card__bio">
            <p>{d.bio}</p>
          </div>
        )}

        {/* Social circle icons */}
        {circleLinks.length > 0 && (
          <div className="protofile-card__links">
            {circleLinks.map(([label, url], i) => {
                const iconKey = detectIconKey(label, url)
                return (
                <a
                  key={`${label}-${i}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="protofile-card__link"
                  title={LINK_LABELS[label] || label}
                  data-platform={detectPlatformKey(label, url)}
                >
                  {LINK_ICONS[iconKey] || LINK_ICONS.website}
                </a>
              )
            })}
          </div>
        )}

        {/* Card-style links (website, portfolio, etc.) */}
        {cardLinks.length > 0 && (
          <div className="protofile-card__card-links">
            {cardLinks.map(([label, url], i) => (
              <a
                key={`card-${label}-${i}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="protofile-card__card-link"
              >
                <span className="protofile-card__card-link-label">{label}</span>
              </a>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export { DEFAULT_DATA, LINK_ICONS, LINK_LABELS }
