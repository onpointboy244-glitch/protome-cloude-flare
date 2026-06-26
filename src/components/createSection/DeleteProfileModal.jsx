export default function DeleteProfileModal({ profile, deleting, onCancel, onConfirm }) {
  if (!profile) return null

  return (
    <div className="create-section__delete-overlay" onClick={onCancel}>
      <div className="create-section__delete-modal" onClick={e => e.stopPropagation()}>
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
