import './ProfileSkeleton.css'

export default function ProfileSkeleton() {
  return (
    <div className="linktree-skeleton" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: 'var(--space-lg)' }}>
      <div className="linktree-skeleton__card">
        <div className="linktree-skeleton__accent-bar" />

        <div className="linktree-skeleton__main">
          {/* Share button placeholder */}
          <div className="linktree-skeleton__share-placeholder" />

          {/* Avatar */}
          <div className="linktree-skeleton__avatar" />

          {/* Name */}
          <div className="linktree-skeleton__name" />

          {/* Role */}
          <div className="linktree-skeleton__role" />

          {/* Bio lines */}
          <div className="linktree-skeleton__bio">
            <div className="linktree-skeleton__bio-line" />
            <div className="linktree-skeleton__bio-line linktree-skeleton__bio-line--short" />
          </div>

          {/* Social circles */}
          <div className="linktree-skeleton__socials">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="linktree-skeleton__social-circle" />
            ))}
          </div>

          {/* Link buttons */}
          <div className="linktree-skeleton__links">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="linktree-skeleton__link-btn" />
            ))}
          </div>

          {/* Footer */}
          <div className="linktree-skeleton__footer">
            <div className="linktree-skeleton__brand" />
            <div className="linktree-skeleton__footer-links">
              <div className="linktree-skeleton__footer-text" />
              <div className="linktree-skeleton__footer-text" />
              <div className="linktree-skeleton__footer-text linktree-skeleton__footer-text--short" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
