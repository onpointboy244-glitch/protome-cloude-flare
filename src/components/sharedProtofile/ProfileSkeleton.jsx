import './ProfileSkeleton.css'

export default function ProfileSkeleton() {
  return (
    <div className="protofile-skeleton" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 'var(--space-lg)' }}>
      <div className="protofile-skeleton__card">
        <div className="protofile-skeleton__accent-bar" />

        <div className="protofile-skeleton__main">
          {/* Share button placeholder */}
          <div className="protofile-skeleton__share-placeholder" />

          {/* Avatar */}
          <div className="protofile-skeleton__avatar" />

          {/* Name */}
          <div className="protofile-skeleton__name" />

          {/* Role */}
          <div className="protofile-skeleton__role" />

          {/* Bio lines */}
          <div className="protofile-skeleton__bio">
            <div className="protofile-skeleton__bio-line" />
            <div className="protofile-skeleton__bio-line protofile-skeleton__bio-line--short" />
          </div>

          {/* Social circles */}
          <div className="protofile-skeleton__socials">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="protofile-skeleton__social-circle" />
            ))}
          </div>

          {/* Link buttons */}
          <div className="protofile-skeleton__links">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="protofile-skeleton__link-btn" />
            ))}
          </div>

          {/* Footer */}
          <div className="protofile-skeleton__footer">
            <div className="protofile-skeleton__brand" />
            <div className="protofile-skeleton__footer-links">
              <div className="protofile-skeleton__footer-text" />
              <div className="protofile-skeleton__footer-text" />
              <div className="protofile-skeleton__footer-text protofile-skeleton__footer-text--short" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
