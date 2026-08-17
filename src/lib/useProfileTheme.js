/**
 * Shared profile theme computation — single source of truth for ALL design
 * fields: backgrounds, colors, fonts, button styles, social styles, etc.
 *
 * Used by both SharedProtofile (public profile) and CardFace (live preview).
 * ANY design logic change goes HERE, not in the components.
 */
import { isLightColor, gradientIsDark } from './icons.jsx'

// ── hex utilities (local to this file) ──────────────────────────

function hexNormalize(c) {
  return c.length === 4
    ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]
    : c
}

function luminance(c) {
  const h = hexNormalize(c).replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b
}

function sameColorFamily(c1, c2) {
  const h1 = hexNormalize(c1).replace('#', '')
  const h2 = hexNormalize(c2).replace('#', '')
  const t1 = parseInt(h1.slice(0, 2), 16) + parseInt(h1.slice(2, 4), 16) + parseInt(h1.slice(4, 6), 16)
  const t2 = parseInt(h2.slice(0, 2), 16) + parseInt(h2.slice(2, 4), 16) + parseInt(h2.slice(4, 6), 16)
  if (!t1 || !t2) return false
  const rd = Math.abs(parseInt(h1.slice(0, 2), 16) / t1 - parseInt(h2.slice(0, 2), 16) / t2)
  const gd = Math.abs(parseInt(h1.slice(2, 4), 16) / t1 - parseInt(h2.slice(2, 4), 16) / t2)
  const bd = Math.abs(parseInt(h1.slice(4, 6), 16) / t1 - parseInt(h2.slice(4, 6), 16) / t2)
  return Math.max(rd, gd, bd) < 0.12
}

// ── Public API ──────────────────────────────────────────────────

export function computeProfileTheme(profile) {
  const d = {
    ...profile,
    bgColor: profile.bg_color || profile.bgColor || '',
    bgGradient: profile.bg_gradient || profile.bgGradient || '',
    bgType: profile.bg_type || profile.bgType || 'none',
    bgSize: profile.bg_size || profile.bgSize || 'cover',
    bgPos: profile.bg_pos || profile.bgPos || '0 0',
    buttonStyle: profile.button_style || profile.buttonStyle || 'solid',
    buttonCorner: profile.button_corner || profile.buttonCorner || 'rounded',
    buttonColor: profile.button_color || profile.buttonColor || '',
    buttonTextColor: profile.button_text_color || profile.buttonTextColor || '',
    socialStyle: profile.social_style || profile.socialStyle || 'default',
    socialPosition: profile.social_position || profile.socialPosition || 'top',
    detectIcons: profile.detect_icons !== false && profile.detect_icons !== undefined,
  }
  const { bgColor, bgGradient, bgType, bgSize, bgPos, accent, font,
    buttonStyle, buttonCorner, buttonColor, buttonTextColor,
    socialStyle, socialPosition, detectIcons } = d
  const accentColor = accent || 'var(--color-primary-l)'
  const isAccentLight = accent ? isLightColor(accent) : false
  const fontClass = font ? `protofile--${font}` : ''

  // Wallpaper / pattern / gooey detection
  const isGooey = bgGradient?.startsWith?.('__gooey__')
  const gooeyVariant = isGooey
    ? bgGradient === '__gooey__'
      ? 'groovy1'
      : (bgGradient.split('__').filter(Boolean)[1] || 'groovy1')
    : undefined
  const wallpaperType = bgType === 'none' && bgGradient && !isGooey ? 'gradient' : bgType
  const isPattern = wallpaperType === 'pattern' && !isGooey
  const hasWallpaper = wallpaperType !== 'none' && bgGradient && !isGooey
  const isOverlay = bgGradient && (bgGradient.includes('rgba') || bgGradient.includes('transparent'))
  const isAccentOverlay = !isGooey && bgGradient?.includes?.('color-mix')

  // Dark / light detection (gradientIsDark can't read SVG patterns → fallback to bgColor)
  const isDarkBg = hasWallpaper && !isOverlay
    ? gradientIsDark(bgGradient) || !isLightColor(bgColor)
    : !isLightColor(bgColor)
  const isLightBg = hasWallpaper && !isOverlay
    ? !isDarkBg
    : isLightColor(bgColor)

  // Accent invisibility — when accent is same or near-identical to bg
  const accentSame = accent && bgColor &&
    bgColor.startsWith('#') && accent.startsWith('#') &&
    hexNormalize(accent).toLowerCase() === hexNormalize(bgColor).toLowerCase()
  const lumaDiff = accent && bgColor && bgColor.startsWith('#') && accent.startsWith('#')
    ? Math.abs(luminance(accent) - luminance(bgColor))
    : null
  const accentInvisible = accentSame || (
    lumaDiff !== null && lumaDiff < 60 &&
    bgColor.startsWith('#') && accent.startsWith('#') &&
    sameColorFamily(accent, bgColor)
  )
  const visibleAccent = accentInvisible
    ? (isLightBg ? '#000' : '#fff')
    : accentColor
  const accentHoverText = accentInvisible
    ? (visibleAccent === '#000' ? '#fff' : '#000')
    : (isAccentLight ? '#000' : '#fff')

  // Convenience class strings
  const btnStyleClass = `protofile__link-btn--${buttonStyle}`
  const cornerClass = `protofile__link-btn--${buttonCorner}`
  const socialClass = `protofile__socials${socialStyle !== 'default' ? ` protofile__socials--${socialStyle}` : ''}`
  const mainClass = `protofile__main${isGooey ? ' protofile__main--gooey' : ''}${isAccentOverlay ? ' protofile__main--accent-overlay' : ''}`
  const wrapperClass = `protofile ${fontClass}${isLightBg ? ' protofile--light' : ''}${isDarkBg ? ' protofile--dark' : ''}`
  const cardClass = `protofile__card${hasWallpaper && !isGooey ? ' protofile__card--wallpaper' : ''}${isGooey ? ' protofile__card--gooey' : ''}`
  const cardBgStyle = !isGooey && hasWallpaper
    ? { '--bg-gradient': bgGradient.replace(/ACCENTCLR/g, encodeURIComponent(accent || '#C5A059')) }
    : {}

  // Compute auto button text color based on button style, custom buttonColor, and light/dark theme
  function computeAutoButtonTextColor() {
    if (buttonStyle === 'solid') {
      // Solid: default bg is white on dark, black on light
      // If custom buttonColor is set, compute contrast against it
      const btnBg = buttonColor || (isLightBg ? '#1a1a1a' : '#fff')
      return isLightColor(btnBg) ? '#1a1a1a' : '#fff'
    }
    if (buttonStyle === 'glass') {
      // Glass: white-ish on dark, dark on light
      return isLightBg ? '#1e1e1e' : '#fff'
    }
    // outline: white on dark, dark on light
    return isLightBg ? '#1e1e1e' : '#fff'
  }
  const autoButtonTextColor = computeAutoButtonTextColor()

  // CSS variables map
  const cssVars = {
    '--accent': accentInvisible ? visibleAccent : accentColor,
    '--accent-hover-text': accentHoverText,
    '--card-accent': accentColor,
    '--bg-color': bgColor || 'var(--color-bg)',
    '--card-bg': bgColor || 'var(--color-bg)',
    '--card-text': isDarkBg ? '#fff' : '#111',
    ...(hasWallpaper ? {
      '--card-gradient': bgGradient.replace(/ACCENTCLR/g, encodeURIComponent(accent || '#C5A059')),
      '--bg-gradient': bgGradient.replace(/ACCENTCLR/g, encodeURIComponent(accent || '#C5A059')),
    } : { '--card-gradient': 'none' }),
    '--card-bg-size': isPattern ? bgSize : 'cover',
    '--bg-size': isPattern ? bgSize : 'cover',
    '--card-bg-repeat': isPattern ? 'repeat' : 'no-repeat',
    '--bg-repeat': isPattern ? 'repeat' : 'no-repeat',
    '--bg-pos': isPattern ? bgPos : '0 0',
    ...(isDarkBg ? {
      '--card-text-muted': 'rgba(255, 255, 255, 0.7)',
      '--card-text-soft': 'rgba(255, 255, 255, 0.85)',
      '--card-border': 'rgba(255, 255, 255, 0.15)',
      '--card-bio': 'rgba(255, 255, 255, 0.8)',
      '--card-link-bg': 'rgba(255, 255, 255, 0.12)',
      '--card-social-bg': 'oklch(0 0 0 / 0.15)',
      '--card-social-color': 'rgba(255, 255, 255, 0.75)',
      '--card-social-border': 'rgba(255, 255, 255, 0.12)',
      '--card-avatar-bg': '#e8ddd4',
    } : {
      '--card-text-muted': '#555',
      '--card-text-soft': '#333',
      '--card-border': 'rgba(0, 0, 0, 0.1)',
      '--card-bio': '#333',
      '--card-link-bg': bgGradient ? 'rgba(0, 0, 0, 0.04)' : 'oklch(1 0 0 / 0.7)',
      '--card-social-bg': 'oklch(1 0 0 / 0.5)',
      '--card-social-color': 'oklch(0.35 0.008 35 / 0.8)',
      '--card-social-border': 'oklch(0 0 0 / 0.08)',
      '--card-avatar-bg': '#2a2520',
    }),
    // Button custom colors — cascade to every button in the card
    ...(buttonStyle === 'solid' && buttonColor ? { '--btn-bg': buttonColor, '--btn-border': buttonColor } : {}),
    // Auto button text color (what renders when user hasn't set custom text color)
    '--c-text-auto': autoButtonTextColor,
    // Explicit custom text color overrides auto
    ...(buttonTextColor ? { '--c-text': buttonTextColor } : {}),
  }

  return {
    // Booleans & identifiers
    isLightBg,
    isDarkBg,
    isGooey,
    isPattern,
    hasWallpaper,
    isOverlay,
    isAccentOverlay,
    gooeyVariant,
    fontClass,
    // Accent
    accentColor,
    visibleAccent,
    accentHoverText,
    accentInvisible,
    // Design field values
    buttonStyle,
    buttonCorner,
    buttonColor,
    buttonTextColor,
    socialStyle,
    socialPosition,
    detectIcons,
    // Convenience class strings
    btnStyleClass,
    cornerClass,
    socialClass,
    mainClass,
    wrapperClass,
    cardClass,
    cardBgStyle,
    // CSS custom properties
    cssVars,
  }
}
