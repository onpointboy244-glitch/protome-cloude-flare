import { useEffect, useRef } from 'react'
import './DeleteProfileModal.css'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function DeleteProfileModal({ profile, deleting, onCancel, onConfirm }) {
  const modalRef = useRef(null)

  // Focus trap + Escape key
  useEffect(() => {
    if (!profile) return
    const modal = modalRef.current
    if (!modal) return
    const focusable = modal.querySelectorAll(FOCUSABLE)
    if (focusable.length > 0) focusable[0].focus()
    const handleKey = (e) => {
      if (e.key === 'Escape') { onCancel?.(); return }
      if (e.key !== 'Tab') return
      const els = modal.querySelectorAll(FOCUSABLE)
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
    return () => {
      document.removeEventListener('keydown', handleKey)
      // Restore focus to previously focused element
      const btn = document.querySelector('[data-restore-focus]')
      btn?.focus()
    }
  }, [profile, onCancel])

  if (!profile) return null

  return (
    <div className="create-section__delete-overlay" onClick={onCancel}>
      <div ref={modalRef} className="create-section__delete-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Delete profile">
        <div className="create-section__delete-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3 className="create-section__delete-title">Delete /{profile.username}?</h3>
        <p className="create-section__delete-text">
          This will permanently delete your profile and its data. The username <strong>{profile.username}</strong> will become available for anyone to claim.
        </p>
        <div className="create-section__delete-actions">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onCancel}
            disabled={deleting}
            data-restore-focus
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn create-section__delete-confirm"
            onClick={() => onConfirm(profile)}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete forever'}
          </button>
        </div>
      </div>
    </div>
  )
}
