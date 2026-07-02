import { GRADIENT_PRESETS } from './formConstants'
import './DesignControls.css'

export default function DesignControls({ accent, bgGradient, font, onAccentChange, onBgChange, onFontChange }) {
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
          <label className="create-section__label">Background</label>
          <div className="create-section__gradient-picker">
            {GRADIENT_PRESETS.map(g => {
              const isLight = g.css && !g.css.includes('radial')
              const isSelected = bgGradient === g.css || (!bgGradient && g.id === 'none')
              return (
                <button
                  key={g.id}
                  type="button"
                  className={`create-section__gradient-swatch ${isSelected ? 'create-section__gradient-swatch--active' : ''}`}
                  onClick={() => onBgChange(g)}
                  title={g.name}
                  aria-label={g.name}
                  style={{ background: g.css || g.bg }}
                >
                  {isSelected && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isLight ? '#1a1a1a' : '#fff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="create-section__design-row">
          <label className="create-section__label">Font style</label>
          <div className="create-section__font-options">
            <button
              type="button"
              className={`create-section__font-btn ${font === 'serif' ? 'create-section__font-btn--active' : ''}`}
              onClick={() => onFontChange('serif')}
            >
              <span className="create-section__font-sample create-section__font-sample--serif">Aa</span>
              Serif
            </button>
            <button
              type="button"
              className={`create-section__font-btn ${font === 'sans' ? 'create-section__font-btn--active' : ''}`}
              onClick={() => onFontChange('sans')}
            >
              <span className="create-section__font-sample create-section__font-sample--sans">Aa</span>
              Sans
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
