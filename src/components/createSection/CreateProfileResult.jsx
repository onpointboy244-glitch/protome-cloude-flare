import { useState, useRef, useEffect } from 'react'
import ProtofileCard from '../ProtofileCard'
import { profileUrl } from '../../lib/api'

export default function CreateProfileResult({ createdUsername, latestProtofile, onReset }) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef(null)
  const url = profileUrl(createdUsername)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleCopy = async () => {
    if (!url) return
    try {
      await navigator.clipboard?.writeText(url)
      setCopied(true)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <section id="create" className="section create-section">
      <div className="container">
        <div className="create-section__header">
          <h2 className="section__title" style={{ textAlign: 'center' }}>
            Your profile is live
          </h2>
          <p className="section__subtitle" style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto var(--space-3xl)' }}>
            {createdUsername}/ — yours to share anywhere.
          </p>
        </div>

        <div className="create-section__result">
          <div
            className="create-section__card-wrapper"
            onClick={() => window.open(`/${createdUsername}`, '_blank', 'noopener')}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.open(`/${createdUsername}`, '_blank', 'noopener') }}
          >
            <ProtofileCard
              data={{
                ...latestProtofile,
                photo: latestProtofile?.photo_url || '',
                links: latestProtofile?.links || [],
              }}
            />
            <div className="create-section__card-overlay">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Open live
            </div>
          </div>
          {latestProtofile?.links?.some(l => l.isSection) && (
            <p className="create-section__section-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Link group titles only show on your live profile — they don't appear inside this card preview.
            </p>
          )}

          <div className="create-section__share">
            <div className="create-section__share-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              <div>
                <strong>/{createdUsername}</strong>
                <span>Open this link on any device to see your profile</span>
              </div>
              <button
                className="btn btn--ghost create-section__copy-btn"
                onClick={handleCopy}
                aria-live="polite"
              >
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>

            <div className="create-section__result-actions">
              <a href={`/${createdUsername}`} target="_blank" rel="noopener noreferrer" className="btn btn--primary create-section__view-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                See it live &rarr;
              </a>
              <button className="btn btn--text" onClick={onReset}>
                Create another
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
