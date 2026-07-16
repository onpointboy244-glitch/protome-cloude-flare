import { useCallback } from 'react'
import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { isSocial, SOCIAL_QUICK_LINKS, WEBSITE_QUICK_LINKS } from './formConstants'
import { renderPlatformIcon, detectIconKey } from '../../../lib/icons.jsx'
import './LinksEditor.css'

/**
 * Group the "other" links (non-social) into titled sections.
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

function SortableLinkEntry({ link, icon, onUpdate, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id })
  const missingLabel = !link.label.trim() && link.url.trim()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    zIndex: isDragging ? 10 : 0,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`create-section__link-entry ${isDragging ? 'create-section__link-entry--dragging' : ''}`}
    >
      <button
        type="button"
        className="create-section__link-drag-handle"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="9" cy="5" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="5" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="9" cy="19" r="1.5" fill="currentColor" stroke="none"/>
          <circle cx="15" cy="19" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
      </button>
      <span className="create-section__link-entry-icon">{icon}</span>
      <input
        type="text"
        className={`create-section__input create-section__link-label-input ${missingLabel ? 'create-section__link-label-input--error' : ''}`}
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
      {missingLabel && <span className="create-section__link-hint">Add a label</span>}
    </div>
  )
}

function SortableGroup({ group, onUpdateLink, onRemoveLink }) {
  const linkIds = group.links.map(l => l.id)

  return (
    <SortableContext items={linkIds} strategy={verticalListSortingStrategy}>
      {group.links.length === 0 && group.section && (
        <p className="create-section__link-group-empty">Add links to this section using the buttons below.</p>
      )}

      {group.links.map(link => {
        const icon = renderPlatformIcon(detectIconKey(link.label, link.url), 16)
        return (
          <SortableLinkEntry
            key={link.id}
            link={link}
            icon={icon}
            onUpdate={onUpdateLink}
            onRemove={onRemoveLink}
          />
        )
      })}
    </SortableContext>
  )
}

export default function LinksEditor({ links, onAddLink, onUpdateLink, onRemoveLink, onAddSection, onAddLinkToGroup, onMoveLink }) {
  const sectionLinks = links.filter(l => l.isSection)
  const regularLinks = links.filter(l => !l.isSection)

  // Use explicit type first; fall back to content detection for legacy links
  const isSocialLink = l => l.type === 'social' || (!l.type && isSocial(l.label))
  const regularSocial = regularLinks.filter(isSocialLink)
  const regularOther = regularLinks.filter(l => !isSocialLink(l))

  // Only the "other" links get section grouping
  const otherGroups = groupOtherLinks(links.filter(l => l.isSection || !isSocialLink(l)))

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } })
  )

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event
    if (!active || !over || active.id === over.id) return
    onMoveLink?.(active.id, over.id)
  }, [onMoveLink])

  return (
    <div className="create-section__field-group">
      <label className="create-section__field-label">Links</label>
      <p className="create-section__field-help">Add your social media, coding, and website links.</p>

      {/* Social Media — flat, untouched */}
      <div className="create-section__links-subgroup">
        <span className="create-section__links-subgroup-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          Social
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
              {renderPlatformIcon(ql.key, 16)}
            </button>
          ))}
          <button
            type="button"
            className="create-section__quick-link-btn create-section__quick-link-btn--custom"
            onClick={() => onAddLink('Website', 'social', { _autoDetect: true })}
            title="Add custom link"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </button>
        </div>

        {regularSocial.length > 0 && (
          <div className="create-section__links-list">
            {regularSocial.map(link => (
              <LinkEntry key={link.id} link={link} icon={renderPlatformIcon(detectIconKey(link.label, ''), 16)} onUpdate={onUpdateLink} onRemove={onRemoveLink} />
            ))}
          </div>
        )}
      </div>

      {/* Links — grouped under titled sections */}
      <div className="create-section__links-subgroup">
        <span className="create-section__links-subgroup-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Links
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
              {renderPlatformIcon(ql.key, 16)}
            </button>
          ))}
          <button
            type="button"
            className="create-section__quick-link-btn create-section__quick-link-btn--custom"
            onClick={() => onAddLink('', 'website')}
          >
            {renderPlatformIcon(null, 14)}
          </button>
        </div>

        {regularOther.length > 0 || sectionLinks.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="create-section__link-groups">
              {otherGroups.map((group, i) => (
                <div
                  key={group.section?.id || `g-${i}`}
                  className={`create-section__link-group${group.section ? ' create-section__link-group--titled' : ''}${group.links.length > 0 ? ' create-section__link-group--has-links' : ''}`}
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
                      <span>This section has no title. Links will show without a heading.</span>
                    </div>
                  )}

                  <div className="create-section__link-group-body">
                    <SortableGroup
                      group={group}
                      onUpdateLink={onUpdateLink}
                      onRemoveLink={onRemoveLink}
                    />

                    <button
                      type="button"
                      className="create-section__add-link-btn"
                      onClick={() => onAddLinkToGroup?.(group.section?.id, '', 'website')}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Add link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </DndContext>
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
  const labelKey = link.label ? detectIconKey(link.label, '') : null
  const urlKey = link.url ? detectIconKey('', link.url) : null
  const isWrongPlatform = labelKey && link.url.trim() && urlKey && urlKey !== labelKey
  const isUnknownUrl = labelKey && link.url.trim() && !urlKey
  const showError = (isWrongPlatform || isUnknownUrl) && labelKey && labelKey !== 'website'
  const platform = labelKey || link.label

  const handleUrlChange = (e) => {
    const newUrl = e.target.value
    onUpdate(link.id, 'url', newUrl)
    // For custom "+" links: always re-detect and update label/icon from URL
    if (link._autoDetect) {
      if (!newUrl.trim()) return
      const detected = detectIconKey('', newUrl)
      if (detected) {
        onUpdate(link.id, 'label', detected.charAt(0).toUpperCase() + detected.slice(1))
      } else {
        onUpdate(link.id, 'label', 'Website')
      }
    }
  }

  return (
    <div className="create-section__link-entry">
      <span className="create-section__link-entry-icon">
        {icon}
      </span>
      <span className="create-section__social-label">{link.label}</span>
      <input
        type="url"
        className={`create-section__input create-section__link-url-input ${showError ? 'create-section__link-url-input--error' : ''}`}
        placeholder="https://"
        value={link.url}
        onChange={handleUrlChange}
      />
      <button
        type="button"
        className="create-section__link-remove"
        onClick={() => onRemove(link.id)}
        aria-label="Remove link"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      {showError && (
        <span className="create-section__link-hint create-section__link-hint--mismatch">
          Please enter a valid {platform} URL.
        </span>
      )}
    </div>
  )
}
