import './GooeyBackground.css'

const VARIANT_BLOBS = {
  groovy1: [1, 2, 3, 4, 5, 6],
  groovy2: [1, 2, 3, 4, 5, 6],
  fold:    [1, 2, 3, 4, 5, 6],
}

const BLOB_OPACITY = {
  groovy1: [0.12, 0.12, 0.12, 0.12, 0.12, 0.12],
  groovy2: [0.40, 0.40, 0.40, 0.40, 0.40, 0.40],
  fold:    [0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
}

export default function GooeyBackground({ accent = '#C5A059', variant = 'groovy1' }) {
  const blobs = VARIANT_BLOBS[variant] || VARIANT_BLOBS.groovy1
  const opacities = BLOB_OPACITY[variant] || BLOB_OPACITY.groovy1

  // Both groovy variants use the same blob shapes, only the filter/blend differs
  const blobClassRoot = variant === 'groovy1' || variant === 'groovy2' ? 'groovy' : variant

  return (
    <div className={`gooey-bg gooey-bg--${variant}`} aria-hidden="true">
      <div className="gooey-bg__wrapper">
        {blobs.map((n, i) => (
          <div
            key={n}
            className={`gooey-bg__blob gooey-bg__blob--${blobClassRoot}-${n}`}
            style={{ background: accent, opacity: opacities[i] || 0.2 }}
          />
        ))}
      </div>
    </div>
  )
}
