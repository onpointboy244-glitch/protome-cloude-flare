export const MAX_FREE_PROFILES = 3

export const EMPTY_FORM = {
  name: '',
  role: '',
  bio: '',
  username: '',
}

export function freshLink(label = '', url = '', type) {
  const link = { id: Math.random().toString(36).slice(2, 9), label, url }
  if (type) link.type = type
  return link
}

export function freshSection(label = '') {
  return { id: Math.random().toString(36).slice(2, 9), label, url: '', isSection: true }
}

export const GRADIENT_PRESETS = [
  { id: 'none', name: 'White', css: null,
    bg: '#ffffff' },
  { id: 'cloud', name: 'Cloud', css: 'linear-gradient(145deg, #f0f5fa 0%, #e0e8f2 50%, #f0f5fa 100%)',
    bg: '#e8eff5' },
  { id: 'ivory', name: 'Ivory', css: 'linear-gradient(145deg, #fefaf5 0%, #f5ede3 50%, #fefaf5 100%)',
    bg: '#f7efe5' },
  { id: 'blush', name: 'Blush', css: 'linear-gradient(145deg, #fef2f2 0%, #fce8e8 50%, #fef2f2 100%)',
    bg: '#faebeb' },
  { id: 'lavender', name: 'Lavender', css: 'linear-gradient(145deg, #f5f3ff 0%, #e8e4f7 50%, #f5f3ff 100%)',
    bg: '#edebf7' },
  { id: 'sage', name: 'Sage', css: 'linear-gradient(145deg, #f0f7f0 0%, #e2efe2 50%, #f0f7f0 100%)',
    bg: '#e7f1e7' },
  { id: 'peach', name: 'Peach', css: 'linear-gradient(145deg, #fef7f0 0%, #fdede0 50%, #fef7f0 100%)',
    bg: '#fbf0e5' },
  { id: 'mint', name: 'Mint', css: 'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 50%, #ecfdf5 100%)',
    bg: '#ddf7eb' },
  { id: 'charcoal', name: 'Charcoal', css: 'radial-gradient(ellipse at 50% 0%, #2d2a27 0%, #1a1817 100%)',
    bg: '#1c1a19' },
  { id: 'slate', name: 'Slate', css: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)',
    bg: '#121b2e' },
  { id: 'wine', name: 'Wine', css: 'radial-gradient(ellipse at 50% 0%, #3d2323 0%, #1f1212 100%)',
    bg: '#221515' },
  { id: 'forest', name: 'Forest', css: 'radial-gradient(ellipse at 50% 0%, #1a2e1a 0%, #0d1a0d 100%)',
    bg: '#101f10' },
]

const SOCIAL_PLATFORMS = [
  'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok',
  'facebook', 'snapchat', 'discord', 'twitch', 'pinterest',
  'reddit', 'telegram', 'whatsapp', 'threads', 'bluesky',
]

const CODING_PLATFORMS = ['github']

export function isSocial(label = '') {
  const lbl = label.toLowerCase()
  return SOCIAL_PLATFORMS.some(p => {
    const alias = PLATFORM_ALIASES[p] || p
    return new RegExp(`\\b${alias}\\b`).test(lbl)
  })
}

export function isCoding(label = '') {
  const lbl = label.toLowerCase()
  return CODING_PLATFORMS.some(p => {
    const alias = PLATFORM_ALIASES[p] || p
    return new RegExp(`\\b${alias}\\b`).test(lbl)
  })
}

// Map display labels to their canonical keys for icon lookup
const PLATFORM_ALIASES = {
  twitter: 'x',
}

export const SOCIAL_QUICK_LINKS = [
  { label: 'Instagram', key: 'instagram' },
  { label: 'Twitter / X', key: 'twitter' },
  { label: 'Facebook', key: 'facebook' },
  { label: 'LinkedIn', key: 'linkedin' },
  { label: 'YouTube', key: 'youtube' },
  { label: 'TikTok', key: 'tiktok' },
  { label: 'Snapchat', key: 'snapchat' },
  { label: 'Discord', key: 'discord' },
  { label: 'Twitch', key: 'twitch' },
  { label: 'Pinterest', key: 'pinterest' },
  { label: 'Reddit', key: 'reddit' },
  { label: 'Telegram', key: 'telegram' },
  { label: 'WhatsApp', key: 'whatsapp' },
  { label: 'Threads', key: 'threads' },
  { label: 'Bluesky', key: 'bluesky' },
]

export const CODING_QUICK_LINKS = [
  { label: 'GitHub', key: 'github' },
]

export const WEBSITE_QUICK_LINKS = [
  { label: 'Website', key: 'website' },
  { label: 'Portfolio', key: 'portfolio' },
]
