import './ProfileSelector.css'

export default function ProfileSelector({ myProfiles, profilesLoading, onEdit, onDelete, editingProfile }) {
  // Show skeleton while profiles are loading
  if (profilesLoading) {
    return (
      <div className="create-section__profiles-list">
        <div className="create-section__profiles-label">Your protome URLs</div>
        {[1, 2].map(i => (
          <div key={i} className="create-section__profile-row">
            <div className="create-section__profile-info">
              <div className="skeleton skeleton--text skeleton--name" />
              <div className="skeleton skeleton--text skeleton--url" />
            </div>
            <div className="create-section__profile-actions">
              <div className="skeleton skeleton--btn" />
              <div className="skeleton skeleton--btn" />
              <div className="skeleton skeleton--btn" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!myProfiles || myProfiles.length === 0) return null

  return (
    <div className="create-section__profiles-list">
      <div className="create-section__profiles-label">Your protome URLs</div>
      {myProfiles.map(p => (
        <div key={p.username} className={`create-section__profile-row ${p.username === editingProfile ? 'create-section__profile-row--editing' : ''}`}>
          <div className="create-section__profile-info">
            <span className="create-section__profile-name">{p.name}</span>
            <span className="create-section__profile-url">/{p.username}</span>
          </div>
          <div className="create-section__profile-actions">
            <button
              type="button"
              className="btn btn--ghost create-section__profile-btn"
              onClick={() => onEdit(p)}
            >
              {p.username === editingProfile ? 'Editing' : 'Edit'}
            </button>
            <a
              href={`/${p.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost create-section__profile-btn"
            >
              View
            </a>
            <button
              type="button"
              className="create-section__profile-btn create-section__profile-delete"
              onClick={() => onDelete(p)}
              aria-label={`Delete /${p.username}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
