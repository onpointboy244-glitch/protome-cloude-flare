export const EMPTY_FORM = {
  name: '',
  role: '',
  email: '',
  location: '',
  bio: '',
  tagInput: '',
  username: '',
}

export function freshLink(label = '', url = '') {
  return { id: Math.random().toString(36).slice(2, 9), label, url }
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
  'instagram', 'twitter', 'github', 'linkedin', 'youtube', 'tiktok',
  'facebook', 'snapchat', 'discord', 'twitch', 'pinterest', 'reddit',
  'telegram', 'whatsapp', 'threads', 'bluesky',
]

export function isSocial(label = '') {
  const lbl = label.toLowerCase()
  return SOCIAL_PLATFORMS.some(p => new RegExp(`\\b${p}\\b`).test(lbl))
}

export const SOCIAL_QUICK_LINKS = [
  { label: 'Instagram' },
  { label: 'Twitter / X' },
  { label: 'Facebook' },
  { label: 'LinkedIn' },
  { label: 'GitHub' },
  { label: 'YouTube' },
  { label: 'TikTok' },
  { label: 'Snapchat' },
  { label: 'Discord' },
  { label: 'Twitch' },
  { label: 'Pinterest' },
  { label: 'Reddit' },
  { label: 'Telegram' },
  { label: 'WhatsApp' },
  { label: 'Threads' },
  { label: 'Bluesky' },
]

export const WEBSITE_QUICK_LINKS = [
  { label: 'Website' },
  { label: 'Portfolio' },
]
