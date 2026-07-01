import { isSocial, SOCIAL_QUICK_LINKS, WEBSITE_QUICK_LINKS } from './formConstants'
import {
  FaGlobe, FaLinkedin, FaTwitter, FaGithub, FaInstagram, FaYoutube, FaTiktok,
  FaFacebook, FaSnapchat, FaDiscord, FaTwitch, FaPinterest, FaReddit,
  FaTelegram, FaWhatsapp,
} from 'react-icons/fa'
import { FaThreads, FaBluesky, FaLink } from 'react-icons/fa6'

const LINK_ICONS = {
  instagram: <FaInstagram size={16} />,
  twitter: <FaTwitter size={16} />,
  facebook: <FaFacebook size={16} />,
  linkedin: <FaLinkedin size={16} />,
  youtube: <FaYoutube size={16} />,
  tiktok: <FaTiktok size={16} />,
  snapchat: <FaSnapchat size={16} />,
  discord: <FaDiscord size={16} />,
  twitch: <FaTwitch size={16} />,
  pinterest: <FaPinterest size={16} />,
  reddit: <FaReddit size={16} />,
  telegram: <FaTelegram size={16} />,
  whatsapp: <FaWhatsapp size={16} />,
  threads: <FaThreads size={16} />,
  bluesky: <FaBluesky size={16} />,
  github: <FaGithub size={16} />,
  website: <FaGlobe size={16} />,
  portfolio: <FaGlobe size={16} />,
}

function getIcon(key) {
  return LINK_ICONS[key] || <FaLink size={16} />
}

function detectIcon(label) {
  const key = label.toLowerCase().replace(/ \/.*$/, '').replace(/\s+/g, '')
  return LINK_ICONS[key] || null
}

/**
 * Group the "other" links (non-social, non-coding) into titled sections.
 * Links before the first section go into an ungrouped group.
 */
function groupOtherLinks(links) {
  const groups = []
  let current = null
  for (const link of links) {
    if (link.isSection) {
      current = { section: link, links: [], id: link.id }
      groups.push(current)
    } else {
      if (!current) {
        current = { section: null, links: [], id: null }
        groups.push(current)
      }
      current.links.push(link)
    }
  }
  return groups
}

export default function LinksEditor({ links, onAddLink, onUpdateLink, onRemoveLink, onAddSection, onAddLinkToGroup }) {
  const sectionLinks = links.filter(l => l.isSection)
  const regularLinks = links.filter(l => !l.isSection)

  // Use explicit type first; fall back to content detection for legacy links
  const isSocialLink = l => l.type === 'social' || (!l.type && isSocial(l.label))
  const regularSocial = regularLinks.filter(isSocialLink)
  const regularOther = regularLinks.filter(l => !isSocialLink(l))

  // Only the "other" links get section grouping
  const otherGroups = groupOtherLinks(links.filter(l => l.isSection || !isSocialLink(l)))

  return (
    <div className="create-section__field-group">
      <label className="create-section__field-label">Links</label>
      <p className="create-section__field-help">Add your social media, coding, and website links.</p>

      {/* Social Media — flat, untouched */}
      <div className="create-section__links-subgroup">
        <span className="create-section__links-subgroup-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Social media
        </span>
        <div className="create-section__quick-links">
          {SOCIAL_QUICK_LINKS.map(ql => (
            <button
              key={ql.key}
              type="button"
              className="create-section__quick-link-btn"
              onClick={() => onAddLink(ql.label, 'social')}
              title={ql.label}
            >
              {getIcon(ql.key)}
            </button>
          ))}
        </div>

        {regularSocial.length > 0 && (
          <div className="create-section__links-list">
            {regularSocial.map(link => (
              <LinkEntry key={link.id} link={link} icon={getIcon(link.label.toLowerCase().replace(/ \/.*$/, '').replace(/\s+/g, ''))} onUpdate={onUpdateLink} onRemove={onRemoveLink} />
            ))}
          </div>
        )}
      </div>

      {/* Websites + Custom — grouped under titled sections */}
      <div className="create-section__links-subgroup">
        <span className="create-section__links-subgroup-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Websites
        </span>
        <div className="create-section__quick-links">
          {WEBSITE_QUICK_LINKS.map(ql => (
            <button
              key={ql.key}
              type="button"
              className="create-section__quick-link-btn"
              onClick={() => onAddLink(ql.label, 'website')}
              title={ql.label}
            >
              {getIcon(ql.key)}
            </button>
          ))}
          <button
            type="button"
            className="create-section__quick-link-btn create-section__quick-link-btn--custom"
            onClick={() => onAddLink('', 'website')}
          >
            <FaLink size={14} />
          </button>
        </div>

        {regularOther.length > 0 || sectionLinks.length > 0 ? (
          <div className="create-section__link-groups">
            {otherGroups.map((group, i) => (
              <div
                key={group.section?.id || `g-${i}`}
                className={`create-section__link-group${group.section ? ' create-section__link-group--titled' : ''}`}
              >
                {group.section ? (
                  <div className="create-section__link-group-header">
                    <svg className="create-section__section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="16" y2="18"/></svg>
                    <input
                      type="text"
                      className="create-section__input create-section__link-group-input"
                      placeholder="Section title e.g. My Handmade Websites"
                      value={group.section.label}
                      onChange={e => onUpdateLink(group.section.id, 'label', e.target.value)}
                    />
                    <button
                      type="button"
                      className="create-section__link-remove"
                      onClick={() => onRemoveLink(group.section.id)}
                      aria-label="Remove section"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ) : null}

                {group.section && !group.section.label.trim() && group.links.length > 0 && (
                  <div className="create-section__group-warning">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>This section has no title. Links will show without a heading. Use <strong>Website</strong> / <strong>Portfolio</strong> / <strong>Custom</strong> quick-add buttons above for links without a group.</span>
                  </div>
                )}

                <div className="create-section__link-group-body">
                  {group.links.length === 0 && group.section && (
                    <p className="create-section__link-group-empty">Add links to this section using the buttons below.</p>
                  )}

                  {group.links.map(link => {
                    const icon = detectIcon(link.label) || <FaLink size={16} />
                    return (
                      <div key={link.id} className="create-section__link-entry">
                        <span className="create-section__link-entry-icon">{icon}</span>
                        <input
                          type="text"
                          className="create-section__input create-section__link-label-input"
                          placeholder="Label"
                          value={link.label}
                          onChange={e => onUpdateLink(link.id, 'label', e.target.value)}
                        />
                        <input
                          type="url"
                          className="create-section__input create-section__link-url-input"
                          placeholder="https://"
                          value={link.url}
                          onChange={e => onUpdateLink(link.id, 'url', e.target.value)}
                        />
                        <button
                          type="button"
                          className="create-section__link-remove"
                          onClick={() => onRemoveLink(link.id)}
                          aria-label="Remove link"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    )
                  })}

                  <button
                    type="button"
                    className="create-section__add-link-btn"
                    onClick={() => onAddLinkToGroup?.(group.section?.id, '', 'website')}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    {group.section ? 'Add link' : 'Add link'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="create-section__field-hint">Tap an icon above to add a link.</p>
        )}

        <button
          type="button"
          className="create-section__add-section-btn"
          onClick={() => onAddSection?.()}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add section title
        </button>
      </div>
    </div>
  )
}

function LinkEntry({ link, icon, onUpdate, onRemove }) {
  return (
    <div className="create-section__link-entry">
      <span className="create-section__link-entry-icon">
        {icon}
      </span>
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
