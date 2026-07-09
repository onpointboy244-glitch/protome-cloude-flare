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
  FaTelegram, FaWhatsapp,
} from 'react-icons/fa'
import { FaThreads, FaBluesky, FaLink, FaXTwitter } from 'react-icons/fa6'

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
 * then falling back to the full text (label + URL).
 */
export function detectIconKey(label = '', url = '') {
  const lbl = label.toLowerCase()
  const full = `${lbl} ${url}`.toLowerCase()

  // Label-only checks — what the user typed beats anything in the URL
  if (/\btiktok\b/.test(lbl)) return 'tiktok'
  if (/\binstagram\b/.test(lbl)) return 'instagram'
  if (/\byoutube\b/.test(lbl)) return 'youtube'
  if (/\blinkedin\b/.test(lbl)) return 'linkedin'
  if (/\btwitter\b/.test(lbl) || /\bx\b/.test(lbl)) return 'twitter'
  if (/\bgithub\b/.test(lbl)) return 'github'
  if (/\bfacebook\b/.test(lbl)) return 'facebook'
  if (/\bsnapchat\b/.test(lbl)) return 'snapchat'
  if (/\bdiscord\b/.test(lbl)) return 'discord'
  if (/\btwitch\b/.test(lbl)) return 'twitch'
  if (/\bpinterest\b/.test(lbl)) return 'pinterest'
  if (/\breddit\b/.test(lbl)) return 'reddit'
  if (/\btelegram\b/.test(lbl)) return 'telegram'
  if (/\bwhatsapp\b/.test(lbl)) return 'whatsapp'
  if (/\bthreads\b/.test(lbl)) return 'threads'
  if (/\bbluesky\b/.test(lbl)) return 'bluesky'

  // Fallback: check full text (label + URL)
  if (/\blinkedin\b/.test(full)) return 'linkedin'
  if (/\btwitter\b/.test(full) || /\bx\.com\b/.test(full) || /\/x\b/.test(full)) return 'twitter'
  if (/\bgithub\b/.test(full)) return 'github'
  if (/\binstagram\b/.test(full)) return 'instagram'
  if (/\byoutube\b/.test(full)) return 'youtube'
  if (/\btiktok\b/.test(full)) return 'tiktok'
  if (/\bfacebook\b/.test(full) || /\bfb\.com\b/.test(full)) return 'facebook'
  if (/\bsnapchat\b/.test(full)) return 'snapchat'
  if (/\bdiscord\b/.test(full)) return 'discord'
  if (/\btwitch\b/.test(full)) return 'twitch'
  if (/\bpinterest\b/.test(full)) return 'pinterest'
  if (/\breddit\b/.test(full)) return 'reddit'
  if (/\btelegram\b/.test(full) || /\bt\.me\b/.test(full)) return 'telegram'
  if (/\bwhatsapp\b/.test(full)) return 'whatsapp'
  if (/\bthreads\b/.test(full)) return 'threads'
  if (/\bbluesky\b/.test(full) || /\bsky\.social\b/.test(full)) return 'bluesky'
  if (/\b(website|web|site|portfolio)\b/.test(full)) return 'website'
  return null
}

/**
 * Detect the platform key for hover-styling.
 * Label is authoritative — if it names a platform, that wins regardless of URL.
 */
export function detectPlatformKey(label = '', url = '') {
  const lbl = label.toLowerCase()
  // Label-only check — user's intent beats anything in the URL
  for (const p of PLATFORM_NAMES) {
    if (lbl.includes(p)) return p
  }
  // Fallback: check full text
  const text = `${lbl} ${url}`.toLowerCase()
  for (const p of PLATFORM_NAMES) {
    if (text.includes(p)) return p
  }
  if (/\b(website|web|site|portfolio)\b/.test(text)) return 'website'
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

export function isSocialLink(label = '', url = '', type) {
  if (type === 'website' || type === 'coding') return false
  if (type === 'social') return true
  const text = `${label} ${url}`.toLowerCase()
  return PLATFORM_NAMES.some(p => new RegExp(`\\b${p}\\b`).test(text))
}
