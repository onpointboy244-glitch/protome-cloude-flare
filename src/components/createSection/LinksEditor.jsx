import { isSocial, SOCIAL_QUICK_LINKS, WEBSITE_QUICK_LINKS } from './formConstants'

export default function LinksEditor({ links, onAddLink, onUpdateLink, onRemoveLink }) {
  return (
    <div className="create-section__field-group">
      <label className="create-section__field-label">Links</label>
      <p className="create-section__field-help">Add your social media and website links.</p>

      {/* Social Media */}
      <div className="create-section__links-subgroup">
        <span className="create-section__links-subgroup-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Social media
        </span>
        <div className="create-section__quick-links">
          {SOCIAL_QUICK_LINKS.map(ql => (
            <button
              key={ql.label}
              type="button"
              className="create-section__quick-link-btn"
              onClick={() => onAddLink(ql.label)}
            >
              + {ql.label}
            </button>
          ))}
        </div>

        {links.filter(l => isSocial(l.label)).length > 0 && (
          <div className="create-section__links-list">
            {links.filter(l => isSocial(l.label)).map(link => (
              <LinkEntry key={link.id} link={link} onUpdate={onUpdateLink} onRemove={onRemoveLink} />
            ))}
          </div>
        )}
      </div>

      {/* Websites */}
      <div className="create-section__links-subgroup">
        <span className="create-section__links-subgroup-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Websites
        </span>
        <div className="create-section__quick-links">
          {WEBSITE_QUICK_LINKS.map(ql => (
            <button
              key={ql.label}
              type="button"
              className="create-section__quick-link-btn"
              onClick={() => onAddLink(ql.label)}
            >
              + {ql.label}
            </button>
          ))}
          <button
            type="button"
            className="create-section__quick-link-btn create-section__quick-link-btn--custom"
            onClick={() => onAddLink('')}
          >
            + Custom link
          </button>
        </div>

        {links.filter(l => !isSocial(l.label)).length > 0 && (
          <div className="create-section__links-list">
            {links.filter(l => !isSocial(l.label)).map(link => (
              <LinkEntry key={link.id} link={link} onUpdate={onUpdateLink} onRemove={onRemoveLink} />
            ))}
          </div>
        )}
      </div>

      {links.length === 0 && (
        <p className="create-section__field-hint">Click a button above to add your first link.</p>
      )}
    </div>
  )
}

function LinkEntry({ link, onUpdate, onRemove }) {
  return (
    <div className="create-section__link-entry">
      <input
        type="text"
        className="create-section__input create-section__link-label-input"
        placeholder="Label"
        value={link.label}
        onChange={e => onUpdate(link.id, 'label', e.target.value)}
      />
      <input
        type="url"
        className="create-section__input create-section__link-url-input"
        placeholder="https://"
        value={link.url}
        onChange={e => onUpdate(link.id, 'url', e.target.value)}
      />
      <button
        type="button"
        className="create-section__link-remove"
        onClick={() => onRemove(link.id)}
        aria-label="Remove link"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  )
}
