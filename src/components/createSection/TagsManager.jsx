export default function TagsManager({ tagInput, tags, onTagInput, onAddTag, onRemoveTag, onKeyDown }) {
  return (
    <div className="create-section__field-group">
      <label className="create-section__field-label">Tags</label>
      <div className="create-section__tag-input">
        <input
          id="pf-tags"
          type="text"
          className="create-section__input"
          placeholder="Type a skill or interest"
          value={tagInput}
          onChange={e => onTagInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="button" className="btn btn--ghost create-section__tag-add" onClick={onAddTag}>Add</button>
      </div>
      {tags.length > 0 && (
        <div className="create-section__tag-list">
          {tags.map(tag => (
            <span key={tag} className="create-section__tag">
              {tag}
              <button type="button" className="create-section__tag-remove" onClick={() => onRemoveTag(tag)} aria-label={`Remove ${tag}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
