/**
 * Shared icon detection, color utilities, and social link helpers.
 *
 * Consolidates code that was previously duplicated across:
 *   - sharedProtofile/constants.jsx
 *   - ProtofileCard.jsx
 *   - SharedProtofile.jsx
 *   - createSection/formConstants.js
 *   - LinksEditor.jsx
 */
import {
  FaGlobe, FaLinkedin, FaGithub, FaInstagram, FaYoutube, FaTiktok,
  FaFacebook, FaSnapchat, FaDiscord, FaTwitch, FaPinterest, FaReddit,
  FaTelegram, FaWhatsapp, FaShopify, FaSpotify, FaMedium, FaDev,
  FaCodepen, FaStackOverflow, FaBehance, FaDribbble, FaEtsy, FaPatreon,
  FaPaypal, FaFigma, FaProductHunt, FaTumblr, FaVimeo, FaGoodreads,
  FaBandcamp,
} from 'react-icons/fa'
import { FaThreads, FaBluesky, FaLink, FaXTwitter, FaSoundcloud, FaHashnode, FaMastodon } from 'react-icons/fa6'

// ── Icon component map (render at any size) ─────────────────────

export const ICON_COMPONENTS = {
  website: FaGlobe,
  linkedin: FaLinkedin,
  twitter: FaXTwitter,
  github: FaGithub,
  instagram: FaInstagram,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  facebook: FaFacebook,
  snapchat: FaSnapchat,
  discord: FaDiscord,
  twitch: FaTwitch,
  pinterest: FaPinterest,
  reddit: FaReddit,
  telegram: FaTelegram,
  whatsapp: FaWhatsapp,
  threads: FaThreads,
  bluesky: FaBluesky,
  // 20 additional platform icons (shopify, spotify, medium, etc.)
  shopify: FaShopify,
  spotify: FaSpotify,
  medium: FaMedium,
  devto: FaDev,
  codepen: FaCodepen,
  stackoverflow: FaStackOverflow,
  behance: FaBehance,
  dribbble: FaDribbble,
  etsy: FaEtsy,
  patreon: FaPatreon,
  paypal: FaPaypal,
  figma: FaFigma,
  producthunt: FaProductHunt,
  tumblr: FaTumblr,
  vimeo: FaVimeo,
  soundcloud: FaSoundcloud,
  goodreads: FaGoodreads,
  bandcamp: FaBandcamp,
  hashnode: FaHashnode,
  mastodon: FaMastodon,
}

const PLATFORM_NAMES = Object.keys(ICON_COMPONENTS)

/** Render a platform icon at the given size. Falls back to generic link icon. */
export function renderPlatformIcon(key, size = 18) {
  const Component = ICON_COMPONENTS[key] || FaLink
  return <Component size={size} />
}

/** Pre-rendered generic link icon (18px). */
export const GENERIC_ICON = <FaLink size={18} />

// ── Icon key detection (label-first, then label+URL) ────────────

/**
 * Detect the canonical icon key for a link by checking label (preferred)
 * then falling back to the URL hostname.
 *
 * Rules:
 *   - Label: split by spaces, each word must match the platform exactly.
 *     "github-clone" = one word ≠ github. "my github" = "github" matches.
 *   - URL: only check the domain hostname, not the full path.
 *     "github.com/foo" matches, "github-clone.com" does not.
 */
export function detectIconKey(label = '', url = '') {
  const words = label.toLowerCase().split(/\s+/).filter(Boolean)
  const hostname = getHostname(url)

  // ── Helper: check if any label word is an exact match ──
  const wordMatch = (word) => words.some(w => w === word)

  // ── Helper: check if hostname contains a domain (e.g. github.com, www.github.com) ──
  const domainMatch = (domain) => {
    if (!hostname) return false
    return hostname === domain || hostname.endsWith('.' + domain) || hostname.startsWith(domain + '.')
  }

	// URL hostname check first (more reliable than label)
  if (domainMatch('linkedin.com')) return 'linkedin'
  if (domainMatch('twitter.com') || domainMatch('x.com')) return 'twitter'
  if (domainMatch('github.com')) return 'github'
  if (domainMatch('instagram.com')) return 'instagram'
  if (domainMatch('youtube.com')) return 'youtube'
  if (domainMatch('tiktok.com')) return 'tiktok'
  if (domainMatch('facebook.com') || domainMatch('fb.com')) return 'facebook'
  if (domainMatch('snapchat.com')) return 'snapchat'
  if (domainMatch('discord.com') || domainMatch('discord.gg')) return 'discord'
  if (domainMatch('twitch.tv')) return 'twitch'
  if (domainMatch('pinterest.com')) return 'pinterest'
  if (domainMatch('reddit.com')) return 'reddit'
  if (domainMatch('t.me') || domainMatch('telegram.org')) return 'telegram'
  if (domainMatch('whatsapp.com')) return 'whatsapp'
  if (domainMatch('threads.net')) return 'threads'
  if (domainMatch('bsky.app') || domainMatch('sky.social')) return 'bluesky'
  // Extended platform URL detection (shopify, spotify, medium, codepen, etc.)
  if (domainMatch('shopify.com') || domainMatch('myshopify.com')) return 'shopify'
  if (domainMatch('spotify.com')) return 'spotify'
  if (domainMatch('medium.com')) return 'medium'
  if (domainMatch('dev.to')) return 'devto'
  if (domainMatch('codepen.io')) return 'codepen'
  if (domainMatch('stackoverflow.com') || domainMatch('stackexchange.com')) return 'stackoverflow'
  if (domainMatch('behance.net')) return 'behance'
  if (domainMatch('dribbble.com')) return 'dribbble'
  if (domainMatch('etsy.com')) return 'etsy'
  if (domainMatch('patreon.com')) return 'patreon'
  if (domainMatch('paypal.com') || domainMatch('paypal.me')) return 'paypal'
  if (domainMatch('figma.com')) return 'figma'
  if (domainMatch('producthunt.com')) return 'producthunt'
  if (domainMatch('tumblr.com')) return 'tumblr'
  if (domainMatch('vimeo.com')) return 'vimeo'
  if (domainMatch('soundcloud.com')) return 'soundcloud'
  if (domainMatch('goodreads.com')) return 'goodreads'
  if (domainMatch('bandcamp.com')) return 'bandcamp'
  if (domainMatch('hashnode.com')) return 'hashnode'
  if (domainMatch('mastodon.social')) return 'mastodon'

  // Label checks (exact word match only) — fallback if URL didn't match
  if (wordMatch('tiktok')) return 'tiktok'
  if (wordMatch('instagram')) return 'instagram'
  if (wordMatch('youtube')) return 'youtube'
  if (wordMatch('linkedin')) return 'linkedin'
  if (wordMatch('twitter')) return 'twitter'
  if (wordMatch('x')) return 'twitter'
  if (wordMatch('github')) return 'github'
  if (wordMatch('facebook')) return 'facebook'
  if (wordMatch('snapchat')) return 'snapchat'
  if (wordMatch('discord')) return 'discord'
  if (wordMatch('twitch')) return 'twitch'
  if (wordMatch('pinterest')) return 'pinterest'
  if (wordMatch('reddit')) return 'reddit'
  if (wordMatch('telegram')) return 'telegram'
  if (wordMatch('whatsapp')) return 'whatsapp'
  if (wordMatch('threads')) return 'threads'
  if (wordMatch('bluesky')) return 'bluesky'
  if (wordMatch('shopify')) return 'shopify'
  if (wordMatch('spotify')) return 'spotify'
  if (wordMatch('medium')) return 'medium'
  if (wordMatch('dev.to') || wordMatch('devto') || wordMatch('dev')) return 'devto'
  if (wordMatch('codepen')) return 'codepen'
  if (wordMatch('stackoverflow') || wordMatch('stack overflow') || wordMatch('stack')) return 'stackoverflow'
  if (wordMatch('behance')) return 'behance'
  if (wordMatch('dribbble')) return 'dribbble'
  if (wordMatch('etsy')) return 'etsy'
  if (wordMatch('patreon')) return 'patreon'
  if (wordMatch('paypal')) return 'paypal'
  if (wordMatch('figma')) return 'figma'
  if (wordMatch('producthunt') || wordMatch('product hunt')) return 'producthunt'
  if (wordMatch('tumblr')) return 'tumblr'
  if (wordMatch('vimeo')) return 'vimeo'
  if (wordMatch('soundcloud') || wordMatch('sound cloud')) return 'soundcloud'
  if (wordMatch('goodreads')) return 'goodreads'
  if (wordMatch('bandcamp')) return 'bandcamp'
  if (wordMatch('hashnode')) return 'hashnode'
  if (wordMatch('mastodon')) return 'mastodon'

  if (/\b(website|web|site|portfolio)\b/.test(label.toLowerCase())) return 'website'

  return null
}

/** Extract hostname from a URL string, or null if unparseable. */
function getHostname(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : 'https://' + url)
    return u.hostname.toLowerCase()
  } catch {
    return null
  }
}

/**
 * Detect the platform key for hover-styling.
 * Label is authoritative — if it names a platform, that wins regardless of URL.
 * Uses same exact-word-matching rules as detectIconKey.
 */
export function detectPlatformKey(label = '', url = '') {
  const words = label.toLowerCase().split(/\s+/).filter(Boolean)
  const hostname = getHostname(url)

  const wordMatch = (word) => words.some(w => w === word)
  const domainMatch = (domain) => {
    if (!hostname) return false
    return hostname === domain || hostname.endsWith('.' + domain) || hostname.startsWith(domain + '.')
  }

  // URL hostname check first (more reliable than label)
  for (const p of PLATFORM_NAMES) {
    const domain = p === 'twitter' ? 'twitter.com' : p === 'bluesky' ? 'bsky.app' :
      p === 'website' ? null : p + '.com'
    if (domain && domainMatch(domain)) return p
  }
  if (domainMatch('x.com')) return 'twitter'
  if (domainMatch('t.me')) return 'telegram'
  if (domainMatch('discord.gg')) return 'discord'
  if (domainMatch('bsky.app')) return 'bluesky'
  if (domainMatch('sky.social')) return 'bluesky'
  if (domainMatch('fb.com')) return 'facebook'
  if (domainMatch('threads.net')) return 'threads'
  if (domainMatch('twitch.tv')) return 'twitch'
  if (domainMatch('myshopify.com')) return 'shopify'
  if (domainMatch('dev.to')) return 'devto'
  if (domainMatch('codepen.io')) return 'codepen'
  if (domainMatch('behance.net')) return 'behance'
  if (domainMatch('paypal.me')) return 'paypal'
  if (domainMatch('stackexchange.com')) return 'stackoverflow'
  if (domainMatch('mastodon.social')) return 'mastodon'

  // Label check — fallback if URL didn't match
  for (const p of PLATFORM_NAMES) {
    if (wordMatch(p)) return p
  }
  if (wordMatch('x')) return 'twitter'
  if (wordMatch('dev.to') || wordMatch('dev')) return 'devto'
  if (wordMatch('stack overflow') || wordMatch('stack')) return 'stackoverflow'
  if (wordMatch('product hunt')) return 'producthunt'
  if (wordMatch('sound cloud')) return 'soundcloud'

  if (/\b(website|web|site|portfolio)\b/.test(label.toLowerCase())) return 'website'
  return null
}

/**
 * Convenience: detect + render the icon for a link in one call.
 */
export function detectIcon(label = '', url = '', size = 18) {
  const key = detectIconKey(label, url)
  return key ? renderPlatformIcon(key, size) : GENERIC_ICON
}

// ── Color utilities ─────────────────────────────────────────────

export function isLightColor(color) {
  if (!color || color === '#ffffff') return true

  // Handle oklch() — parse the lightness value (0–1 scale)
  if (color.startsWith('oklch')) {
    const match = color.match(/oklch\(([\d.]+)/)
    if (match) return parseFloat(match[1]) > 0.6
    return false // can't parse — assume dark (safer for contrast)
  }

  // Handle 3-digit hex
  let c = color.replace('#', '')
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2]
  }
  if (c.length < 6) return false // unknown format → assume dark

  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

/**
 * Determine if a gradient string is dark by extracting hex colors
 * and checking their average brightness. Falls back to radial = dark.
 */
export function gradientIsDark(css) {
  const hexColors = css.match(/#[a-f0-9]{3,8}/gi)
  if (hexColors && hexColors.length > 0) {
    const darkCount = hexColors.filter(c => !isLightColor(c)).length
    return darkCount > hexColors.length / 2
  }
  // Fallback: radial presets are all dark, linear presets are all light
  return css.includes('radial')
}

// ── Social link classification ──────────────────────────────────

// Platforms that show as circle icons on the public profile.
// Platforms not in this list show as card-style buttons.
const SOCIAL_PLATFORM_KEYS = [
  'website',
  'linkedin', 'twitter', 'github',
  'instagram', 'youtube', 'tiktok', 'facebook', 'snapchat',
  'discord', 'twitch', 'pinterest', 'reddit', 'telegram', 'whatsapp',
  'threads', 'bluesky',
  'shopify', 'spotify', 'medium', 'devto', 'codepen',
  'behance', 'dribbble', 'patreon', 'producthunt',
  'tumblr', 'vimeo', 'soundcloud', 'goodreads', 'bandcamp',
  'hashnode', 'mastodon',
]

export function isSocialLink(label = '', url = '', type) {
  if (type === 'website' || type === 'coding') return false
  if (type === 'social') return true
  // Same exact-word matching as detectIconKey
  const words = label.toLowerCase().split(/\s+/).filter(Boolean)
  const hostname = getHostname(url)
  const wordMatch = (word) => words.some(w => w === word)
  const domainMatch = (domain) => {
    if (!hostname) return false
    return hostname === domain || hostname.endsWith('.' + domain) || hostname.startsWith(domain + '.')
  }
  // URL hostname check first — only check social platforms
  for (const p of SOCIAL_PLATFORM_KEYS) {
    const domain = p === 'twitter' ? 'twitter.com' : p === 'bluesky' ? 'bsky.app' :
      p === 'website' ? null : p + '.com'
    if (domain && domainMatch(domain)) return true
  }
  if (domainMatch('x.com') || domainMatch('t.me') || domainMatch('discord.gg') ||
      domainMatch('bsky.app') || domainMatch('sky.social') || domainMatch('fb.com') ||
      domainMatch('threads.net') || domainMatch('twitch.tv') ||
      domainMatch('myshopify.com') || domainMatch('dev.to') ||
      domainMatch('codepen.io') || domainMatch('behance.net') ||
      domainMatch('mastodon.social')) return true
  // Label check — fallback, only social platforms
  for (const p of SOCIAL_PLATFORM_KEYS) {
    if (wordMatch(p)) return true
  }
  if (wordMatch('x')) return true
  return false
}
