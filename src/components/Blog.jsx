import './LegalPages.css'

export default function Blog() {
  return (
    <div className="legal">
      <div className="legal__inner">
        <a href="/" className="legal__back">← Back to protome</a>
        <h1>Blog</h1>
        <p className="legal__date">Updates, thoughts, and announcements.</p>

        <div style={{ opacity: 0.5, textAlign: 'center', padding: 'var(--space-4xl) 0' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 'var(--space-lg)' }}>
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
            We're working on some exciting things. Check back soon for updates!
          </p>
        </div>
      </div>
    </div>
  )
}
