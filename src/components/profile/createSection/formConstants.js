export const MAX_FREE_PROFILES = 3

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
  { id: 'frost', name: 'Frost', css: 'linear-gradient(145deg, #f0faff 0%, #e0f0fa 50%, #f0faff 100%)',
    bg: '#e8f4fc' },
  { id: 'almond', name: 'Almond', css: 'linear-gradient(145deg, #fcf6f0 0%, #f5ebe0 50%, #fcf6f0 100%)',
    bg: '#f8efe5' },
  { id: 'plum', name: 'Plum', css: 'radial-gradient(ellipse at 50% 0%, #3b1f3b 0%, #1f0f1f 100%)',
    bg: '#231723' },
  { id: 'crimson', name: 'Crimson', css: 'radial-gradient(ellipse at 50% 0%, #4a1a1a 0%, #260d0d 100%)',
    bg: '#2b1010' },
  { id: 'cobalt', name: 'Cobalt', css: 'radial-gradient(ellipse at 50% 0%, #1a2744 0%, #0d1526 100%)',
    bg: '#121d34' },
  { id: 'charcoal', name: 'Charcoal', css: 'radial-gradient(ellipse at 50% 0%, #2d2a27 0%, #1a1817 100%)',
    bg: '#1c1a19' },
  { id: 'slate', name: 'Slate', css: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)',
    bg: '#121b2e' },
  { id: 'wine', name: 'Wine', css: 'radial-gradient(ellipse at 50% 0%, #3d2323 0%, #1f1212 100%)',
    bg: '#221515' },
  { id: 'forest', name: 'Forest', css: 'radial-gradient(ellipse at 50% 0%, #1a2e1a 0%, #0d1a0d 100%)',
    bg: '#101f10' },
]

/* ---- Wallpaper / overlay backgrounds (Linktree-style) ---- */

export const WALLPAPER_TYPES = [
  { key: 'none', label: 'None' },
  { key: 'gradient', label: 'Gradient' },
  { key: 'glow', label: 'Glow' },
  { key: 'pattern', label: 'Pattern' },
]

export const WALLPAPER_STYLES = {
  none: [
    { id: 'solid', name: 'Solid' },
  ],
  gradient: [
    { id: 'top', name: 'Top', css: 'linear-gradient(180deg, color-mix(in oklch, var(--accent) 25%, transparent) 0%, transparent 60%)' },
    { id: 'bottom', name: 'Bottom', css: 'linear-gradient(0deg, color-mix(in oklch, var(--accent) 25%, transparent) 0%, transparent 60%)' },
  ],
  glow: [
    { id: 'center', name: 'Center', css: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.2) 0%, transparent 70%)' },
    { id: 'lavender', name: 'Lavender', css: 'radial-gradient(ellipse at 50% 30%, rgba(200,180,255,0.25) 0%, transparent 70%)' },
    { id: 'ocean', name: 'Ocean', css: 'radial-gradient(ellipse at 50% 30%, rgba(180,220,255,0.25) 0%, transparent 70%)' },
    { id: 'peach', name: 'Peach', css: 'radial-gradient(ellipse at 50% 30%, rgba(255,210,180,0.25) 0%, transparent 70%)' },
    { id: 'mint', name: 'Mint', css: 'radial-gradient(ellipse at 50% 30%, rgba(180,240,210,0.25) 0%, transparent 70%)' },
  ],
  pattern: [
    { id: 'stripes', name: 'Stripes', css: 'repeating-linear-gradient(45deg, transparent, transparent 8px, var(--accent) 8px, var(--accent) 9px)', bgSize: '12.7px 12.7px' },
    { id: 'girih', name: 'Girih', css: "url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Cg%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%220.9%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M50%2C0%20L65%2C25%20L50%2C50%20L35%2C25%20Z%22%2F%3E%3Cpath%20d%3D%22M50%2C50%20L65%2C75%20L50%2C100%20L35%2C75%20Z%22%2F%3E%3Cpath%20d%3D%22M0%2C50%20L25%2C35%20L50%2C50%20L25%2C65%20Z%22%2F%3E%3Cpath%20d%3D%22M100%2C50%20L75%2C35%20L50%2C50%20L75%2C65%20Z%22%2F%3E%3Cpath%20d%3D%22M0%2C0%20L35%2C25%20M100%2C0%20L65%2C25%22%2F%3E%3Cpath%20d%3D%22M0%2C100%20L35%2C75%20M100%2C100%20L65%2C75%22%2F%3E%3Cpath%20d%3D%22M25%2C35%20L0%2C25%20M75%2C35%20L100%2C25%22%2F%3E%3Cpath%20d%3D%22M25%2C65%20L0%2C75%20M75%2C65%20L100%2C75%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')", bgSize: '100px 100px' },
    { id: 'swirl', name: 'Swirl', css: "url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22300%22%20height%3D%22300%22%20viewBox%3D%220%200%20300%20300%22%3E%0A%20%20%3Cg%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%0A%20%20%20%20%3Cpath%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%222.8%22%20opacity%3D%220.55%22%20d%3D%22M%200%2C75%20C%2085%2C240%20215%2C-90%20300%2C75%22%20%2F%3E%0A%20%20%20%20%3Cpath%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%222.2%22%20opacity%3D%220.45%22%20d%3D%22M%200%2C155%20C%2045%2C20%20255%2C290%20300%2C155%22%20%2F%3E%0A%20%20%20%20%3Cpath%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%221.6%22%20opacity%3D%220.35%22%20d%3D%22M%200%2C245%20C%20110%2C170%20190%2C320%20300%2C245%22%20%2F%3E%0A%20%20%20%20%3Cpath%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%222.5%22%20opacity%3D%220.5%22%20d%3D%22M%2075%2C0%20C%2025%2C80%20125%2C220%2075%2C300%22%20%2F%3E%0A%20%20%20%20%3Cpath%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%222%22%20opacity%3D%220.4%22%20d%3D%22M%20220%2C0%20C%20270%2C60%20170%2C240%20220%2C300%22%20%2F%3E%0A%20%20%20%20%3Cpath%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%222.5%22%20opacity%3D%220.5%22%20d%3D%22M%20110%2C80%20C%2060%2C40%2030%2C120%2080%2C160%20C%20130%2C200%20180%2C150%20150%2C100%20C%20120%2C50%2070%2C70%20110%2C110%22%20%2F%3E%0A%20%20%20%20%3Cpath%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%222%22%20opacity%3D%220.4%22%20d%3D%22M%20200%2C20%20C%20250%2C10%20280%2C50%20260%2C90%20C%20240%2C130%20180%2C100%20200%2C60%20C%20220%2C20%20250%2C30%20240%2C50%22%20%2F%3E%0A%20%20%20%20%3Cpath%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%221.8%22%20opacity%3D%220.35%22%20d%3D%22M%2040%2C280%20C%2020%2C260%2030%2C230%2055%2C240%20C%2080%2C250%2070%2C275%2050%2C270%20C%2035%2C265%2040%2C250%2050%2C255%22%20%2F%3E%0A%20%20%20%20%3Cpath%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%221.5%22%20opacity%3D%220.3%22%20d%3D%22M%20160%2C220%20C%20145%2C205%20125%2C220%20140%2C235%20C%20155%2C250%20175%2C235%20160%2C220%22%20%2F%3E%0A%20%20%20%20%3Cpath%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%221.3%22%20opacity%3D%220.25%22%20d%3D%22M%20270%2C160%20C%20285%2C145%20295%2C165%20280%2C180%20C%20265%2C195%20255%2C175%20270%2C160%22%20%2F%3E%0A%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E')", bgSize: '300px 300px' },
    { id: 'groovy', name: 'Groovy', css: '__gooey__', previewCss: "url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22400%22%20viewBox%3D%220%200%20400%20400%22%3E%0A%20%20%3Cg%20fill%3D%22ACCENTCLR%22%3E%0A%20%20%20%20%3Cpath%20d%3D%22M-80%2C40%20C50%2C-60%20180%2C20%20260%2C100%20C340%2C180%20370%2C270%20480%2C320%20L480%2C370%20C380%2C400%20280%2C300%20180%2C220%20C80%2C140%20-40%2C100%20-80%2C160%20Z%22%20opacity%3D%220.3%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M120%2C120%20C180%2C60%20300%2C80%20340%2C160%20C380%2C240%20320%2C320%20240%2C340%20C150%2C360%2060%2C280%2060%2C200%20C60%2C160%2080%2C150%20120%2C120%20Z%22%20opacity%3D%220.4%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M260%2C-80%20C300%2C20%20380%2C80%20340%2C180%20C300%2C280%20340%2C350%20320%2C480%20L280%2C480%20C260%2C400%20220%2C300%20260%2C200%20C300%2C100%20220%2C20%20180%2C-80%20Z%22%20opacity%3D%220.35%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M-80%2C-40%20C60%2C-100%20160%2C20%20260%2C-20%20C340%2C-60%20420%2C10%20500%2C-10%20L500%2C20%20C420%2C50%20340%2C0%20260%2C40%20C160%2C80%2060%2C-40%20-80%2C20%20Z%22%20opacity%3D%220.25%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M-80%2C380%20C60%2C320%20180%2C440%20320%2C380%20C420%2C340%20460%2C420%20500%2C400%20L500%2C430%20C460%2C470%20420%2C400%20320%2C440%20C180%2C500%2060%2C380%20-80%2C440%20Z%22%20opacity%3D%220.25%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M40%2C260%20C70%2C230%20110%2C250%20100%2C290%20C90%2C330%2060%2C310%2040%2C260%20Z%22%20opacity%3D%220.3%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M310%2C100%20C340%2C80%20370%2C100%20360%2C130%20C350%2C160%20320%2C140%20310%2C100%20Z%22%20opacity%3D%220.3%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22120%22%20cy%3D%2260%22%20r%3D%226%22%20opacity%3D%220.25%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22300%22%20cy%3D%22280%22%20r%3D%227%22%20opacity%3D%220.25%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2280%22%20cy%3D%22360%22%20r%3D%225%22%20opacity%3D%220.25%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22360%22%20cy%3D%22220%22%20r%3D%225%22%20opacity%3D%220.25%22%2F%3E%0A%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E')", bgSize: '400px 400px' },
    { id: 'fold', name: 'Fold', css: '__gooey__fold__', previewCss: "url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22400%22%20viewBox%3D%220%200%20400%20400%22%3E%0A%20%20%3Cg%20fill%3D%22ACCENTCLR%22%20opacity%3D%220.3%22%3E%0A%20%20%20%20%3Cpath%20d%3D%22M-60%2C20%20L460%2C100%22%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%22100%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M-60%2C120%20L460%2C40%22%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%22100%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M-60%2C190%20L460%2C270%22%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%22100%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M-60%2C290%20L460%2C210%22%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%22100%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M-60%2C360%20L460%2C440%22%20stroke%3D%22ACCENTCLR%22%20stroke-width%3D%22100%22%2F%3E%0A%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E')", bgSize: '400px 400px' },
    { id: 'groovy2', name: 'Groovy 2', css: '__gooey__groovy2__', previewCss: "url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22400%22%20viewBox%3D%220%200%20400%20400%22%3E%0A%20%20%3Cg%20fill%3D%22ACCENTCLR%22%3E%0A%20%20%20%20%3Cpath%20d%3D%22M-80%2C40%20C50%2C-60%20180%2C20%20260%2C100%20C340%2C180%20370%2C270%20480%2C320%20L480%2C370%20C380%2C400%20280%2C300%20180%2C220%20C80%2C140%20-40%2C100%20-80%2C160%20Z%22%20opacity%3D%220.3%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M120%2C120%20C180%2C60%20300%2C80%20340%2C160%20C380%2C240%20320%2C320%20240%2C340%20C150%2C360%2060%2C280%2060%2C200%20C60%2C160%2080%2C150%20120%2C120%20Z%22%20opacity%3D%220.4%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M260%2C-80%20C300%2C20%20380%2C80%20340%2C180%20C300%2C280%20340%2C350%20320%2C480%20L280%2C480%20C260%2C400%20220%2C300%20260%2C200%20C300%2C100%20220%2C20%20180%2C-80%20Z%22%20opacity%3D%220.35%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M-80%2C-40%20C60%2C-100%20160%2C20%20260%2C-20%20C340%2C-60%20420%2C10%20500%2C-10%20L500%2C20%20C420%2C50%20340%2C0%20260%2C40%20C160%2C80%2060%2C-40%20-80%2C20%20Z%22%20opacity%3D%220.25%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M-80%2C380%20C60%2C320%20180%2C440%20320%2C380%20C420%2C340%20460%2C420%20500%2C400%20L500%2C430%20C460%2C470%20420%2C400%20320%2C440%20C180%2C500%2060%2C380%20-80%2C440%20Z%22%20opacity%3D%220.25%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M40%2C260%20C70%2C230%20110%2C250%20100%2C290%20C90%2C330%2060%2C310%2040%2C260%20Z%22%20opacity%3D%220.3%22%2F%3E%0A%20%20%20%20%3Cpath%20d%3D%22M310%2C100%20C340%2C80%20370%2C100%20360%2C130%20C350%2C160%20320%2C140%20310%2C100%20Z%22%20opacity%3D%220.3%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22120%22%20cy%3D%2260%22%20r%3D%226%22%20opacity%3D%220.25%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22300%22%20cy%3D%22280%22%20r%3D%227%22%20opacity%3D%220.25%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%2280%22%20cy%3D%22360%22%20r%3D%225%22%20opacity%3D%220.25%22%2F%3E%0A%20%20%20%20%3Ccircle%20cx%3D%22360%22%20cy%3D%22220%22%20r%3D%225%22%20opacity%3D%220.25%22%2F%3E%0A%20%20%3C%2Fg%3E%0A%3C%2Fsvg%3E')", bgSize: '400px 400px' },
],
}

const SOCIAL_PLATFORMS = [
  'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok',
  'facebook', 'snapchat', 'discord', 'twitch', 'pinterest',
  'reddit', 'telegram', 'whatsapp', 'threads', 'bluesky',
  'shopify', 'spotify', 'medium', 'devto', 'codepen',
  'behance', 'dribbble', 'patreon', 'producthunt',
  'tumblr', 'vimeo', 'soundcloud', 'goodreads', 'bandcamp',
  'hashnode', 'mastodon', 'github',
]

const CODING_PLATFORMS = []

// Map display labels to their canonical keys for icon lookup
const PLATFORM_ALIASES = {
  twitter: 'x',
}

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

/**
 * Detect the icon key for a link by checking its label and URL.
 * Returns a canonical key like 'twitter', 'github', 'website', or null.
 */
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
  { label: 'Shopify', key: 'shopify' },
  { label: 'Spotify', key: 'spotify' },
  { label: 'Medium', key: 'medium' },
  { label: 'Dev.to', key: 'devto' },
  { label: 'CodePen', key: 'codepen' },
  { label: 'Behance', key: 'behance' },
  { label: 'Dribbble', key: 'dribbble' },
  { label: 'Patreon', key: 'patreon' },
  { label: 'Product Hunt', key: 'producthunt' },
  { label: 'Tumblr', key: 'tumblr' },
  { label: 'Vimeo', key: 'vimeo' },
  { label: 'SoundCloud', key: 'soundcloud' },
  { label: 'Goodreads', key: 'goodreads' },
  { label: 'Bandcamp', key: 'bandcamp' },
  { label: 'Hashnode', key: 'hashnode' },
  { label: 'Mastodon', key: 'mastodon' },
  { label: 'GitHub', key: 'github' },
]

export const CODING_QUICK_LINKS = [
  { label: 'GitHub', key: 'github' },
]

export const WEBSITE_QUICK_LINKS = [
  { label: 'Website', key: 'website' },
  { label: 'Portfolio', key: 'portfolio' },
]


