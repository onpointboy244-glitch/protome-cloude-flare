import './GooeyBackground.css'

const VARIANT_BLOBS = {
  groovy:   [1, 2, 3, 4, 5, 6],
  fold:     [1, 2, 3, 4, 5, 6],
  sunburst: [1, 2, 3, 4, 5, 6, 7],
}

export default function GooeyBackground({ accent = '#C5A059', variant = 'groovy' }) {
  const blobs = VARIANT_BLOBS[variant] || VARIANT_BLOBS.groovy
  // Per-blob opacity so all blobs are visible against the card
  const BLOB_OPACITY = {
    groovy:   [0.18, 0.25, 0.12, 0.32, 0.10, 0.38],
    fold:     [0.20, 0.20, 0.20, 0.20, 0.20, 0.20],
    sunburst: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.22],
  }
  const opacities = BLOB_OPACITY[variant] || BLOB_OPACITY.groovy

  return (
    <div className={`gooey-bg gooey-bg--${variant}`} aria-hidden="true">
      <div className="gooey-bg__wrapper">
        {blobs.map((n, i) => (
          <div
            key={n}
            className={`gooey-bg__blob gooey-bg__blob--${variant}-${n}`}
            style={{ background: accent, opacity: opacities[i] || 0.2 }}
          />
        ))}
      </div>
    </div>
  )
}
