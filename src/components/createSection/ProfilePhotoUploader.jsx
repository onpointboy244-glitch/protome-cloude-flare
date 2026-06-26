import { useRef } from 'react'

export default function ProfilePhotoUploader({ photoData, photoError, onPhoto, onRemove }) {
  const fileInputRef = useRef(null)

  return (
    <div className="create-section__field-group">
      <label className="create-section__field-label">Profile photo</label>
      <div className="create-section__photo-area">
        {photoData ? (
          <div className="create-section__photo-preview">
            <img src={photoData} alt="Preview" className="create-section__photo-img" />
            <button type="button" className="create-section__photo-remove" onClick={onRemove} aria-label="Remove photo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ) : (
          <button type="button" className="create-section__photo-upload" onClick={() => fileInputRef.current?.click()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span>Upload photo</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onPhoto}
          className="create-section__file-input"
          aria-label="Choose profile photo"
        />
      </div>
      {photoError && <p className="create-section__field-error">{photoError}</p>}
    </div>
  )
}
