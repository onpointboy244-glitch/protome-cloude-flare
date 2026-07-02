import './UsernameField.css'

export default function UsernameField({
  username,
  editingUsername,
  usernameStatus,
  usernameError,
  onChange,
}) {
  return (
    <div className="create-section__field-group">
      <label className="create-section__field-label">Your protome URL</label>
      <div className="create-section__username-input">
        <span className="create-section__username-prefix">/</span>
        <input
          id="pf-username"
          type="text"
          className={`create-section__input create-section__input--username ${editingUsername ? 'create-section__input--readonly' : ''}`}
          placeholder="yourname"
          value={username}
          onChange={e => {
            if (editingUsername) return
            const val = e.target.value.replace(/[^a-z0-9_-]/gi, '')
            onChange(val)
          }}
          readOnly={!!editingUsername}
          autoComplete="off"
          spellCheck="false"
          title={editingUsername ? 'Usernames cannot be changed after creation' : ''}
        />
        {editingUsername ? (
          <span className="create-section__username-status">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
        ) : (
          <span className={`create-section__username-status create-section__username-status--${usernameStatus}`}>
            {usernameStatus === 'checking' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}>
                <circle cx="12" cy="12" r="10" opacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            )}
            {usernameStatus === 'available' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            )}
            {usernameStatus === 'taken' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            )}
          </span>
        )}
      </div>
      {!editingUsername && usernameError && <p className="create-section__field-error">{usernameError}</p>}
      {!editingUsername && usernameStatus === 'available' && <p className="create-section__field-success">Available! protome.io/{username}</p>}
    </div>
  )
}
