import { WALLPAPER_STYLES, WALLPAPER_TYPES } from './formConstants'
import './DesignControls.css'

const FONTS = [
  { key: 'serif', label: 'Serif', className: 'create-section__font-sample--serif' },
  { key: 'sans', label: 'Sans', className: 'create-section__font-sample--sans' },
  { key: 'mono', label: 'Mono', className: 'create-section__font-sample--mono' },
  { key: 'hand', label: 'Hand', className: 'create-section__font-sample--hand' },
  { key: 'bold', label: 'Bold', className: 'create-section__font-sample--bold' },
  { key: 'rounded', label: 'Rounded', className: 'create-section__font-sample--rounded' },
]

const BUTTON_STYLES = [
  { key: 'solid', label: 'Solid', description: 'White on dark, black on light' },
  { key: 'glass', label: 'Glass', description: 'Semi-transparent, subtle look' },
  { key: 'outline', label: 'Outline', description: 'Transparent with border' },
]

const BUTTON_CORNERS = [
  { key: 'square', label: 'Square', description: 'Minimal rounding' },
  { key: 'rounded', label: 'Rounded', description: 'Standard rounded corners' },
  { key: 'pill', label: 'Pill', description: 'Fully rounded capsule shape' },
]

function swatchStyle(preset, type, accent, bgColor) {
  const base = bgColor || '#000000'
  if (type === 'pattern') {
    // Use previewCss for swatch when available (e.g. groovy uses DOM elements in full card)
    const cssValue = preset.previewCss || preset.css
    const css = cssValue.replace(/var\(--accent\)/g, accent || '#666').replace(/ACCENTCLR/g, encodeURIComponent(accent || '#666'))
    return {
      backgroundColor: base,
      backgroundImage: css,
      backgroundSize: preset.bgSize || 'cover',
      backgroundRepeat: 'repeat',
      backgroundPosition: preset.bgPos || '0 0',
    }
  }
  if (preset.css) {
    // Show gradient/glow on the user's bgColor so subtle overlays are visible
    return {
      backgroundColor: base,
      backgroundImage: preset.css,
    }
  }
  // Solid (no wallpaper) — show just the bgColor
  return { backgroundColor: base }
}

export default function DesignControls({ accent, bgColor, bgType, bgGradient, bgSize, font, buttonStyle, buttonCorner, onAccentChange, onBgColorChange, onBgTypeChange, onBgChange, onFontChange, onButtonStyleChange, onButtonCornerChange }) {
  const presets = WALLPAPER_STYLES[bgType] || WALLPAPER_STYLES.none

  const isActive = (preset) => {
    if (bgType === 'pattern') return bgGradient === preset.css && bgSize === (preset.bgSize || 'cover')
    return bgGradient === preset.css
  }

  return (
    <div className="create-section__field-group">
      <label className="create-section__field-label">Design</label>
      <div className="create-section__design">
        <div className="create-section__design-row">
          <label htmlFor="pf-accent" className="create-section__label">Accent color</label>
          <div className="create-section__color-input">
            <input
              id="pf-accent"
              type="color"
              value={accent}
              onChange={e => onAccentChange(e.target.value)}
              className="create-section__color-picker"
            />
            <span className="create-section__color-value">{accent}</span>
          </div>
        </div>

        <div className="create-section__design-row">
          <label htmlFor="pf-bg-color" className="create-section__label">Background color</label>
          <div className="create-section__color-input">
            <input
              id="pf-bg-color"
              type="color"
              value={bgColor}
              onChange={e => onBgColorChange(e.target.value)}
              className="create-section__color-picker"
            />
            <span className="create-section__color-value">{bgColor}</span>
          </div>
        </div>

        <div className="create-section__design-row">
          <label className="create-section__label">Background style</label>
          <div className="create-section__bg-type-options">
            {WALLPAPER_TYPES.map(t => (
              <button
                key={t.key}
                type="button"
                className={`create-section__bg-type-btn ${bgType === t.key ? 'create-section__bg-type-btn--active' : ''}`}
                onClick={() => onBgTypeChange(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {bgType !== 'none' && (
          <div className="create-section__design-row">
            <label className="create-section__label">Style</label>
            <div className="create-section__gradient-picker">
              {presets.map(g => {
                const active = isActive(g)
                const isGooeyPattern = g.css?.startsWith?.('__gooey__')
                const isActive_ = isActive(g)
                const gooeyVariant = isGooeyPattern
                  ? g.css === '__gooey__' ? 'groovy' : (g.css.split('__').filter(Boolean)[1] || 'groovy')
                  : undefined
                const gooeyBlobs = gooeyVariant === 'groovy' ? [1,2,3,4]
                  : gooeyVariant === 'sunburst' ? [1,2,3,4,5,6,7]
                  : [1,2,3,4,5,6]
                return (
                  <button
                    key={g.id}
                    type="button"
                    className={`create-section__gradient-swatch ${isActive_ ? 'create-section__gradient-swatch--active' : ''} ${isGooeyPattern ? 'create-section__gradient-swatch--gooey' : ''}`}
                    onClick={() => onBgChange(g)}
                    title={g.name}
                    aria-label={g.name}
                    style={isGooeyPattern ? { backgroundColor: bgColor || '#000000' } : swatchStyle(g, bgType, accent, bgColor)}
                  >
                    {isGooeyPattern && (
                      <div className={`create-section__groovy-preview create-section__groovy-preview--${gooeyVariant}`} aria-hidden="true">
                        <div className="create-section__groovy-wrapper">
                          {gooeyBlobs.map(n => (
                            <div
                              key={n}
                              className={`create-section__groovy-blob create-section__groovy-blob--${gooeyVariant}-${n}`}
                              style={{ background: accent || '#C5A059' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {isActive_ && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="create-section__design-row">
          <label className="create-section__label">Font style</label>
          <div className="create-section__font-options">
            {FONTS.map(f => (
              <button
                key={f.key}
                type="button"
                className={`create-section__font-btn ${font === f.key ? 'create-section__font-btn--active' : ''}`}
                onClick={() => onFontChange(f.key)}
              >
                <span className={`create-section__font-sample ${f.className}`}>Aa</span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="create-section__design-row">
          <label className="create-section__label">Button style</label>
          <div className="create-section__bg-type-options">
            {BUTTON_STYLES.map(s => (
              <button
                key={s.key}
                type="button"
                className={`create-section__bg-type-btn ${buttonStyle === s.key ? 'create-section__bg-type-btn--active' : ''}`}
                onClick={() => onButtonStyleChange(s.key)}
                title={s.description}
              >
                <span className={`create-section__btn-preview create-section__btn-preview--${s.key}`} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="create-section__design-row">
          <label className="create-section__label">Button corners</label>
          <div className="create-section__bg-type-options">
            {BUTTON_CORNERS.map(c => (
              <button
                key={c.key}
                type="button"
                className={`create-section__bg-type-btn ${buttonCorner === c.key ? 'create-section__bg-type-btn--active' : ''}`}
                onClick={() => onButtonCornerChange(c.key)}
                title={c.description}
              >
                <span className={`create-section__corner-preview create-section__corner-preview--${c.key}`} />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
