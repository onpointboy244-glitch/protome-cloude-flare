import { useState, useRef, useCallback } from 'react'
import ProtofileCard from './ProtofileCard'
import { createProfile, checkUsername, profileUrl } from '../lib/api'
import './CreateSection.css'

const EMPTY_FORM = {
  name: '',
  role: '',
  email: '',
  location: '',
  bio: '',
  tagInput: '',
  username: '',
}

const PHOTO_MAX_SIZE = 2 * 1024 * 1024 // 2MB

let linkIdCounter = 0
function freshLink(label = '', url = '') {
  return { id: ++linkIdCounter, label, url }
}

const QUICK_LINKS = [
  { label: 'Website' },
  { label: 'LinkedIn' },
  { label: 'Twitter / X' },
  { label: 'GitHub' },
  { label: 'Instagram' },
  { label: 'YouTube' },
  { label: 'TikTok' },
  { label: 'Portfolio' },
]

export default function CreateSection({ onProtofileCreated, latestProtofile }) {
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [tags, setTags] = useState([])
  const [photoData, setPhotoData] = useState('')
  const [links, setLinks] = useState([])
  const [accent, setAccent] = useState('#c45a3c')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [font, setFont] = useState('serif')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [createdUsername, setCreatedUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)
  const [usernameStatus, setUsernameStatus] = useState('idle') // idle | checking | available | taken
  const [usernameError, setUsernameError] = useState('')
  const usernameTimeout = useRef(null)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  // --- Username validation & availability ---
  const validateUsername = useCallback((value) => {
    if (!value) {
      setUsernameStatus('idle')
      setUsernameError('')
      return
    }
    if (!/^[a-z0-9][a-z0-9_-]{0,28}[a-z0-9]$/i.test(value) && value.length < 30) {
      if (!/^[a-z0-9_-]+$/i.test(value)) {
        setUsernameStatus('taken')
        setUsernameError('Letters, numbers, hyphens and underscores only.')
        return
      }
      if (value.length < 2) {
        setUsernameError('Minimum 2 characters.')
        return
      }
      if (/[-_]$/.test(value)) {
        setUsernameStatus('idle')
        setUsernameError('')
        return
      }
    }
    if (value.length > 30) {
      setUsernameStatus('taken')
      setUsernameError('Maximum 30 characters.')
      return
    }
    if (!/^[a-z0-9].*[a-z0-9]$/i.test(value)) {
      setUsernameError('Must start and end with a letter or number.')
      return
    }

    setUsernameStatus('checking')
    setUsernameError('')

    if (usernameTimeout.current) clearTimeout(usernameTimeout.current)
    usernameTimeout.current = setTimeout(async () => {
      const available = await checkUsername(value)
      setUsernameStatus(available ? 'available' : 'taken')
      if (!available) setUsernameError('This username is taken.')
    }, 400)
  }, [])

  // --- Photo ---
  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError('')

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file.')
      return
    }
    if (file.size > PHOTO_MAX_SIZE) {
      setPhotoError('Image must be under 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotoData(ev.target?.result || '')
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setPhotoData('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // --- Tags ---
  const addTag = () => {
    const t = form.tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t])
      update('tagInput', '')
    }
  }

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag))

  const handleTagKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // --- Links ---
  const addLink = (label = '') => {
    setLinks(prev => [...prev, freshLink(label)])
  }

  const updateLink = (id, field, value) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  }

  const removeLink = (id) => {
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setUsernameError('')

    if (!form.name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!form.username.trim()) {
      setError('Choose a username for your profile.')
      return
    }
    if (usernameStatus === 'taken') {
      setError('That username is taken. Try another.')
      return
    }
    if (usernameStatus === 'checking') {
      setError('Wait for the username check to finish.')
      return
    }

    setSaving(true)

    const validLinks = links
      .filter(l => l.label.trim() && l.url.trim())
      .map(l => ({ label: l.label.trim(), url: l.url.trim() }))

    const data = {
      name: form.name.trim(),
      role: form.role.trim() || 'Independent creator',
      email: form.email.trim(),
      location: form.location.trim(),
      bio: form.bio.trim(),
      tags: tags.length > 0 ? tags : ['Creator'],
      photo: photoData,
      links: validLinks,
      accent,
      bgColor,
      font,
    }

    try {
      const result = await createProfile(form.username.trim(), data)
      setCreatedUsername(result.username)
      setSubmitted(true)
      onProtofileCreated(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setForm({ ...EMPTY_FORM })
    setTags([])
    setPhotoData('')
    setLinks([])
    setAccent('#c45a3c')
    setBgColor('#ffffff')
    setFont('serif')
    setSubmitted(false)
    setError('')
    setPhotoError('')
    setCreatedUsername('')
    setUsernameStatus('idle')
    setUsernameError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // =========== RESULT VIEW ===========
  if (submitted && createdUsername) {
    const url = profileUrl(createdUsername)
    return (
      <section id="create" className="section create-section">
        <div className="container">
          <div className="create-section__header">
            <h2 className="section__title" style={{ textAlign: 'center' }}>
              Your profile is live
            </h2>
            <p className="section__subtitle" style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto var(--space-3xl)' }}>
              {createdUsername}/ — yours to share anywhere.
            </p>
          </div>

          <div className="create-section__result">
            <div className="create-section__card-wrapper">
              <ProtofileCard
                data={{
                  ...latestProtofile,
                  links: Object.fromEntries(
                    (latestProtofile?.links || []).map(l => [l.label.toLowerCase().replace(/[^a-z]/g, ''), l.url])
                  ),
                }}
              />
            </div>

            <div className="create-section__share">
              <div className="create-section__share-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                <div>
                  <strong>/{createdUsername}</strong>
                  <span>Open this link on any device to see your profile</span>
                </div>
                <button
                  className="btn btn--ghost create-section__copy-btn"
                  onClick={(e) => {
                    if (url) {
                      navigator.clipboard?.writeText(url)
                      const btn = e.currentTarget
                      btn.textContent = 'Copied!'
                      setTimeout(() => { btn.textContent = 'Copy link' }, 2000)
                    }
                  }}
                >
                  Copy link
                </button>
              </div>

              <div className="create-section__result-actions">
                <a href={`/${createdUsername}`} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                  View profile &rarr;
                </a>
                <button className="btn btn--text" onClick={handleReset}>
                  Create another
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // =========== FORM VIEW ===========
  return (
    <section id="create" className="section create-section">
      <div className="container">
        <div className="create-section__header">
          <h2 className="section__title" style={{ textAlign: 'center' }}>
            Create your protome
          </h2>
          <p className="section__subtitle" style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto var(--space-3xl)' }}>
            Pick a username, add your links, and get a shareable profile page in seconds.
          </p>
        </div>

        <form className="create-section__form" onSubmit={handleSubmit}>
          {error && <p className="create-section__form-error">{error}</p>}

          {/* ===== Photo ===== */}
          <div className="create-section__field-group">
            <label className="create-section__field-label">Profile photo</label>
            <div className="create-section__photo-area">
              {photoData ? (
                <div className="create-section__photo-preview">
                  <img src={photoData} alt="Preview" className="create-section__photo-img" />
                  <button type="button" className="create-section__photo-remove" onClick={removePhoto} aria-label="Remove photo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
                onChange={handlePhoto}
                className="create-section__file-input"
                aria-label="Choose profile photo"
              />
            </div>
            {photoError && <p className="create-section__field-error">{photoError}</p>}
          </div>

          {/* ===== Basic Info ===== */}
          <div className="create-section__field-group">
            <label className="create-section__field-label">About you</label>
            <div className="create-section__grid">
              <div className="create-section__field">
                <label htmlFor="pf-name" className="create-section__label">Full name *</label>
                <input id="pf-name" type="text" className="create-section__input" placeholder="e.g. Jordan Mitchell" value={form.name} onChange={e => update('name', e.target.value)} required />
              </div>
              <div className="create-section__field">
                <label htmlFor="pf-role" className="create-section__label">Role / title</label>
                <input id="pf-role" type="text" className="create-section__input" placeholder="e.g. Product Designer" value={form.role} onChange={e => update('role', e.target.value)} />
              </div>
              <div className="create-section__field">
                <label htmlFor="pf-email" className="create-section__label">Email</label>
                <input id="pf-email" type="email" className="create-section__input" placeholder="jordan@protome.io" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="create-section__field">
                <label htmlFor="pf-location" className="create-section__label">Location</label>
                <input id="pf-location" type="text" className="create-section__input" placeholder="e.g. San Francisco, CA" value={form.location} onChange={e => update('location', e.target.value)} />
              </div>
            </div>
          </div>

          {/* ===== Username ===== */}
          <div className="create-section__field-group">
            <label className="create-section__field-label">Your protome URL</label>
            <div className="create-section__username-input">
              <span className="create-section__username-prefix">/</span>
              <input
                id="pf-username"
                type="text"
                className="create-section__input create-section__input--username"
                placeholder="yourname"
                value={form.username}
                onChange={e => {
                  const val = e.target.value.replace(/[^a-z0-9_-]/gi, '')
                  update('username', val)
                  validateUsername(val)
                }}
                autoComplete="off"
                spellCheck="false"
              />
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
            </div>
            {usernameError && <p className="create-section__field-error">{usernameError}</p>}
            {usernameStatus === 'available' && <p className="create-section__field-success">Available! protome.io/{form.username}</p>}
          </div>

          {/* ===== Bio ===== */}
          <div className="create-section__field-group">
            <label htmlFor="pf-bio" className="create-section__field-label">Bio</label>
            <textarea id="pf-bio" className="create-section__textarea" rows={3} placeholder="Tell people about yourself — your work, what you build, what you're about." value={form.bio} onChange={e => update('bio', e.target.value)} />
          </div>

          {/* ===== Skills / Tags ===== */}
          <div className="create-section__field-group">
            <label className="create-section__field-label">Tags</label>
            <div className="create-section__tag-input">
              <input id="pf-tags" type="text" className="create-section__input" placeholder="Type a skill or interest" value={form.tagInput} onChange={e => update('tagInput', e.target.value)} onKeyDown={handleTagKey} />
              <button type="button" className="btn btn--ghost create-section__tag-add" onClick={addTag}>Add</button>
            </div>
            {tags.length > 0 && (
              <div className="create-section__tag-list">
                {tags.map(tag => (
                  <span key={tag} className="create-section__tag">
                    {tag}
                    <button type="button" className="create-section__tag-remove" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ===== Links ===== */}
          <div className="create-section__field-group">
            <label className="create-section__field-label">Links</label>
            <p className="create-section__field-help">Add the links you want on your profile — portfolio, socials, store, anything.</p>

            {/* Quick-add buttons */}
            <div className="create-section__quick-links">
              {QUICK_LINKS.map(ql => (
                <button
                  key={ql.label}
                  type="button"
                  className="create-section__quick-link-btn"
                  onClick={() => addLink(ql.label)}
                >
                  + {ql.label}
                </button>
              ))}
            </div>

            {/* Added links */}
            {links.length > 0 && (
              <div className="create-section__links-list">
                {links.map(link => (
                  <div key={link.id} className="create-section__link-entry">
                    <input
                      type="text"
                      className="create-section__input create-section__link-label-input"
                      placeholder="Label"
                      value={link.label}
                      onChange={e => updateLink(link.id, 'label', e.target.value)}
                    />
                    <input
                      type="url"
                      className="create-section__input create-section__link-url-input"
                      placeholder="https://"
                      value={link.url}
                      onChange={e => updateLink(link.id, 'url', e.target.value)}
                    />
                    <button
                      type="button"
                      className="create-section__link-remove"
                      onClick={() => removeLink(link.id)}
                      aria-label="Remove link"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {links.length === 0 && (
              <p className="create-section__field-hint">Click a button above to add your first link.</p>
            )}
          </div>

          {/* ===== Design ===== */}
          <div className="create-section__field-group">
            <label className="create-section__field-label">Design</label>
            <div className="create-section__design">
              <div className="create-section__design-row">
                <label htmlFor="pf-accent" className="create-section__label">Accent color</label>
                <div className="create-section__color-input">
                  <input
                    id="pf-accent"
                    type="color"
                    value={accent}
                    onChange={e => setAccent(e.target.value)}
                    className="create-section__color-picker"
                  />
                  <span className="create-section__color-value">{accent}</span>
                </div>
              </div>

              <div className="create-section__design-row">
                <label htmlFor="pf-bg" className="create-section__label">Background color</label>
                <div className="create-section__color-input">
                  <input
                    id="pf-bg"
                    type="color"
                    value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    className="create-section__color-picker"
                  />
                  <span className="create-section__color-value">{bgColor}</span>
                </div>
              </div>

              <div className="create-section__design-row">
                <label className="create-section__label">Font style</label>
                <div className="create-section__font-options">
                  <button
                    type="button"
                    className={`create-section__font-btn ${font === 'serif' ? 'create-section__font-btn--active' : ''}`}
                    onClick={() => setFont('serif')}
                  >
                    <span className="create-section__font-sample create-section__font-sample--serif">Aa</span>
                    Serif
                  </button>
                  <button
                    type="button"
                    className={`create-section__font-btn ${font === 'sans' ? 'create-section__font-btn--active' : ''}`}
                    onClick={() => setFont('sans')}
                  >
                    <span className="create-section__font-sample create-section__font-sample--sans">Aa</span>
                    Sans
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ===== Submit ===== */}
          <div className="create-section__actions">
            <button
              type="submit"
              className="btn btn--primary create-section__submit"
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Create your protome'}
              {!saving && <span aria-hidden="true">&rarr;</span>}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
