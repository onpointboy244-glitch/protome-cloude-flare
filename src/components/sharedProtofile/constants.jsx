import { FaGlobe, FaLinkedin, FaTwitter, FaGithub, FaInstagram, FaYoutube, FaTiktok, FaFacebook, FaSnapchat, FaDiscord, FaTwitch, FaPinterest, FaReddit, FaTelegram, FaWhatsapp } from 'react-icons/fa'
import { FaThreads, FaBluesky, FaLink } from 'react-icons/fa6'
import { detectIconKey } from '../createSection/formConstants'

export const LINK_ICONS = {
  website: <FaGlobe size={18} />,
  linkedin: <FaLinkedin size={18} />,
  twitter: <FaTwitter size={18} />,
  github: <FaGithub size={18} />,
  instagram: <FaInstagram size={18} />,
  youtube: <FaYoutube size={18} />,
  tiktok: <FaTiktok size={18} />,
  facebook: <FaFacebook size={18} />,
  snapchat: <FaSnapchat size={18} />,
  discord: <FaDiscord size={18} />,
  twitch: <FaTwitch size={18} />,
  pinterest: <FaPinterest size={18} />,
  reddit: <FaReddit size={18} />,
  telegram: <FaTelegram size={18} />,
  whatsapp: <FaWhatsapp size={18} />,
  threads: <FaThreads size={18} />,
  bluesky: <FaBluesky size={18} />,
}

export const GENERIC_ICON = <FaLink size={18} />

export function detectIcon(label = '', url = '') {
  const key = detectIconKey(label, url)
  return key ? LINK_ICONS[key] || null : null
}

export function isLightColor(hex) {
  if (!hex || hex === '#ffffff') return true
  const c = hex.replace('#', '')
  if (c.length < 6) return true
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

export function isSocialLink(label = '', url = '', type) {
  if (type === 'website' || type === 'coding') return false
  if (type === 'social') return true
  const text = `${label} ${url}`.toLowerCase()
  return ['instagram', 'twitter', 'github', 'linkedin', 'youtube', 'tiktok', 'facebook', 'snapchat', 'discord', 'twitch', 'pinterest', 'reddit', 'telegram', 'whatsapp', 'threads', 'bluesky'].some(p => new RegExp(`\\b${p}\\b`).test(text))
}
