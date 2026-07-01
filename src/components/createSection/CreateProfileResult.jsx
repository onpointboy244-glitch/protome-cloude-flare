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
          <div className="create-section__card-wrapper">
            <ProtofileCard
              data={{
                ...latestProtofile,
                photo: latestProtofile?.photo_url || '',
                links: latestProtofile?.links || [],
              }}
            />
          </div>

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
              <a href={`/${createdUsername}`} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                View profile &rarr;
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
