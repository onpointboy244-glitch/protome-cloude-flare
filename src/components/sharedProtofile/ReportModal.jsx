import { useState, useRef, useEffect } from 'react'
import { reportProfile } from '../../lib/api'
import './ReportModal.css'

const REPORT_REASONS = [
  'Spam or scam',
  'Inappropriate content',
  'Fake profile',
  'Harassment or bullying',
  'Impersonation',
  'Other',
]

export default function ReportModal({ username, onClose }) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const modalRef = useRef(null)

  // Focus trap + Escape key
  useEffect(() => {
    const modal = modalRef.current
    if (!modal) return
    const focusable = modal.querySelectorAll('button, input, textarea, [tabindex]:not([tabindex="-1"])')
    if (focusable.length > 0) focusable[0].focus()
    const handleKey = (e) => {
      if (e.key === 'Escape') { onClose?.(); return }
      if (e.key !== 'Tab') return
      const els = modal.querySelectorAll('button, input, textarea, [tabindex]:not([tabindex="-1"])')
      if (els.length === 0) return
      const first = els[0]
      const last = els[els.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) return
    setStatus('sending')
    setErrorMsg('')
    try {
      await reportProfile(username, { reason, details: details.trim() || null })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  return (
    <div className="linktree__modal-overlay" onClick={onClose}>
      <div ref={modalRef} className="linktree__modal" onClick={e => e.stopPropagation()}>
        {status === 'success' ? (
          <>
            <div className="linktree__modal-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h3 className="linktree__modal-title">Report submitted</h3>
            <p className="linktree__modal-text">Thanks for letting us know. We&apos;ll review this profile.</p>
            <button className="btn btn--primary" onClick={onClose} style={{ marginTop: 'var(--space-xl)' }}>Done</button>
          </>
        ) : (
          <>
            <div className="linktree__modal-header">
              <h3 className="linktree__modal-title">Report profile</h3>
              <button className="linktree__modal-close" onClick={onClose} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="linktree__modal-text">Why are you reporting <strong>/{username}</strong>?</p>
            <form onSubmit={handleSubmit}>
              <div className="linktree__modal-options">
                {REPORT_REASONS.map(r => (
                  <label key={r} className={`linktree__modal-option ${reason === r ? 'linktree__modal-option--selected' : ''}`}>
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={e => setReason(e.target.value)}
                      className="linktree__modal-radio"
                    />
                    {r}
                  </label>
                ))}
              </div>
              <textarea
                className="linktree__modal-textarea"
                placeholder="Additional details (optional)"
                value={details}
                onChange={e => setDetails(e.target.value)}
                rows={3}
              />
              {status === 'error' && <p className="linktree__modal-error">{errorMsg}</p>}
              <button
                type="submit"
                className="btn btn--primary"
                disabled={!reason || status === 'sending'}
                style={{ marginTop: 'var(--space-lg)', width: '100%' }}
              >
                {status === 'sending' ? 'Submitting…' : 'Submit report'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
