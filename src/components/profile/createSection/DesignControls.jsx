import { WALLPAPER_STYLES, WALLPAPER_TYPES } from "./formConstants";
import "./DesignControls.css";

const FONTS = [
  {
    key: "serif",
    label: "Serif",
    className: "create-section__font-sample--serif",
  },
  {
    key: "sans",
    label: "Sans",
    className: "create-section__font-sample--sans",
  },
  {
    key: "mono",
    label: "Mono",
    className: "create-section__font-sample--mono",
  },
  {
    key: "hand",
    label: "Hand",
    className: "create-section__font-sample--hand",
  },
  {
    key: "bold",
    label: "Bold",
    className: "create-section__font-sample--bold",
  },
  {
    key: "rounded",
    label: "Rounded",
    className: "create-section__font-sample--rounded",
  },
];

const BUTTON_STYLES = [
  {
    key: "solid",
    label: "Solid",
    description: "White on dark, black on light",
  },
  {
    key: "glass",
    label: "Glass",
    description: "Semi-transparent, subtle look",
  },
  { key: "outline", label: "Outline", description: "Transparent with border" },
];

const BUTTON_CORNERS = [
  { key: "square", label: "Square", description: "Minimal rounding" },
  { key: "rounded", label: "Rounded", description: "Standard rounded corners" },
  { key: "pill", label: "Pill", description: "Fully rounded capsule shape" },
];

const SOCIAL_STYLES = [
  { key: "default", label: "Default" },
  { key: "stacked", label: "Stacked" },
  { key: "bubble", label: "Bubble" },
  { key: "minimal", label: "Minimal" },
  { key: "pill", label: "Pill" },
];

export default function DesignControls({
  accent,
  bgColor,
  bgType,
  bgGradient,
  bgSize,
  font,
  buttonStyle,
  buttonCorner,
  buttonColor,
  buttonTextColor,
  socialStyle,
  onAccentChange,
  onBgColorChange,
  onBgTypeChange,
  onBgChange,
  onFontChange,
  onButtonStyleChange,
  onButtonCornerChange,
  onButtonColorChange,
  onButtonTextColorChange,
  onSocialStyleChange,
}) {
  const presets = WALLPAPER_STYLES[bgType] || WALLPAPER_STYLES.none;

  const isActive = (preset) => {
    if (bgType === "pattern")
      return bgGradient === preset.css && bgSize === (preset.bgSize || "cover");
    return bgGradient === preset.css;
  };

  return (
    <div className="create-section__field-group">
      <label className="create-section__field-label">Design</label>
      <div className="create-section__design">
        <div className="create-section__design-row">
          <label htmlFor="pf-accent" className="create-section__label">
            Accent color
          </label>
          <div className="create-section__color-input">
            <input
              id="pf-accent"
              type="color"
              value={accent}
              onChange={(e) => onAccentChange(e.target.value)}
              className="create-section__color-picker"
            />
            <span className="create-section__color-value">{accent}</span>
          </div>
        </div>

        <div className="create-section__design-row">
          <label htmlFor="pf-bg-color" className="create-section__label">
            Background color
          </label>
          <div className="create-section__color-input">
            <input
              id="pf-bg-color"
              type="color"
              value={bgColor}
              onChange={(e) => onBgColorChange(e.target.value)}
              className="create-section__color-picker"
            />
            <span className="create-section__color-value">{bgColor}</span>
          </div>
        </div>

        <div className="create-section__design-row">
          <label className="create-section__label">Background style</label>
          <div className="create-section__bg-type-options">
            {WALLPAPER_TYPES.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`create-section__bg-type-btn ${bgType === t.key ? "create-section__bg-type-btn--active" : ""}`}
                onClick={() => onBgTypeChange(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {bgType !== "none" && (
          <div className="create-section__design-row">
            <label className="create-section__label">Style</label>
            <div className="create-section__bg-type-options">
              {presets.map((g) => {
                const active = isActive(g);
                return (
                  <button
                    key={g.id}
                    type="button"
                    className={`create-section__bg-type-btn ${active ? "create-section__bg-type-btn--active" : ""}`}
                    onClick={() => onBgChange(g)}
                    title={g.name}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="create-section__design-row">
          <label className="create-section__label">Font style</label>
          <div className="create-section__font-options">
            {FONTS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`create-section__font-btn ${font === f.key ? "create-section__font-btn--active" : ""}`}
                onClick={() => onFontChange(f.key)}
              >
                <span className={`create-section__font-sample ${f.className}`}>
                  Aa
                </span>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="create-section__design-row">
          <label className="create-section__label">Button style</label>
          <div className="create-section__bg-type-options">
            {BUTTON_STYLES.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`create-section__bg-type-btn ${buttonStyle === s.key ? "create-section__bg-type-btn--active" : ""}`}
                onClick={() => onButtonStyleChange(s.key)}
                title={s.description}
              >
                <span
                  className={`create-section__btn-preview create-section__btn-preview--${s.key}`}
                />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="create-section__design-row">
          <label className="create-section__label">Button corners</label>
          <div className="create-section__bg-type-options">
            {BUTTON_CORNERS.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`create-section__bg-type-btn ${buttonCorner === c.key ? "create-section__bg-type-btn--active" : ""}`}
                onClick={() => onButtonCornerChange(c.key)}
                title={c.description}
              >
                <span
                  className={`create-section__corner-preview create-section__corner-preview--${c.key}`}
                />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {buttonStyle === "solid" && (
          <div className="create-section__design-row">
            <label htmlFor="pf-btn-color" className="create-section__label">
              Button color
            </label>
            <div className="create-section__color-input">
              <input
                id="pf-btn-color"
                type="color"
                value={buttonColor || "#ffffff"}
                onChange={(e) => onButtonColorChange(e.target.value)}
                className="create-section__color-picker"
              />
              <span className="create-section__color-value">
                {buttonColor || "#ffffff (default)"}
              </span>
            </div>
          </div>
        )}

        <div className="create-section__design-row">
          <label htmlFor="pf-btn-text-color" className="create-section__label">
            Button text color
          </label>
          <div className="create-section__color-input">
            <input
              id="pf-btn-text-color"
              type="color"
              value={buttonTextColor || "#000000"}
              onChange={(e) => onButtonTextColorChange(e.target.value)}
              className="create-section__color-picker"
            />
            <span className="create-section__color-value">
              {buttonTextColor || "Auto"}
            </span>
          </div>
        </div>

        <div className="create-section__design-row">
          <label className="create-section__label">Social style</label>
          <div className="create-section__social-style-options">
            {SOCIAL_STYLES.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`create-section__bg-type-btn ${socialStyle === s.key ? "create-section__bg-type-btn--active" : ""}`}
                onClick={() => onSocialStyleChange(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
