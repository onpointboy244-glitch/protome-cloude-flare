import { useState, useRef, useCallback, useEffect } from 'react'
import { useAuth } from '../lib/useAuth'
import ProtofileCard from './ProtofileCard'
import { createProfile, updateProfile, deleteProfile, checkUsername, profileUrl, uploadPhoto, getMyProfiles } from '../lib/api'
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

function freshLink(label = '', url = '') {
  return { id: Math.random().toString(36).slice(2, 9), label, url }
}

const GRADIENT_PRESETS = [
  { id: 'none', name: 'White', css: null,
    bg: '#ffffff' },
  { id: 'cloud', name: 'Cloud', css: 'linear-gradient(145deg, #f0f5fa 0%, #e0e8f2 50%, #f0f5fa 100%)',
    bg: '#e8eff5' },
  { id: 'ivory', name: 'Ivory', css: 'linear-gradient(145deg, #fefaf5 0%, #f5ede3 50%, #fefaf5 100%)',
    bg: '#f7efe5' },
  { id: 'blush', name: 'Blush', css: 'linear-gradient(145deg, #fef2f2 0%, #fce8e8 50%, #fef2f2 100%)',
    bg: '#faebeb' },
  { id: 'lavender', name: 'Lavender', css: 'linear-gradient(145deg, #f5f3ff 0%, #e8e4f7 50%, #f5f3ff 100%)',
    bg: '#edebf7' },
  { id: 'sage', name: 'Sage', css: 'linear-gradient(145deg, #f0f7f0 0%, #e2efe2 50%, #f0f7f0 100%)',
    bg: '#e7f1e7' },
  { id: 'peach', name: 'Peach', css: 'linear-gradient(145deg, #fef7f0 0%, #fdede0 50%, #fef7f0 100%)',
    bg: '#fbf0e5' },
  { id: 'mint', name: 'Mint', css: 'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 50%, #ecfdf5 100%)',
    bg: '#ddf7eb' },
  { id: 'charcoal', name: 'Charcoal', css: 'radial-gradient(ellipse at 50% 0%, #2d2a27 0%, #1a1817 100%)',
    bg: '#1c1a19' },
  { id: 'slate', name: 'Slate', css: 'radial-gradient(ellipse at 50% 0%, #1e293b 0%, #0f172a 100%)',
    bg: '#121b2e' },
  { id: 'wine', name: 'Wine', css: 'radial-gradient(ellipse at 50% 0%, #3d2323 0%, #1f1212 100%)',
    bg: '#221515' },
  { id: 'forest', name: 'Forest', css: 'radial-gradient(ellipse at 50% 0%, #1a2e1a 0%, #0d1a0d 100%)',
    bg: '#101f10' },
]

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

export default function CreateSection({ onProtofileCreated, onProfileDeleted, latestProtofile, onSignInNeeded, myProfiles = [] }) {
  const { user, loading } = useAuth()
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [tags, setTags] = useState([])
  const [photoData, setPhotoData] = useState('') // local preview
  const [photoFile, setPhotoFile] = useState(null) // actual file for upload
  const [links, setLinks] = useState([])
  const [accent, setAccent] = useState('#c45a3c')
  const [bgGradient, setBgGradient] = useState(null)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [font, setFont] = useState('serif')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [createdUsername, setCreatedUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)
  const originalPhotoUrl = useRef('') // keep original photo_url when editing

  // Reset the result view when user signs out
  useEffect(() => {
    if (!user) {
      setSubmitted(false)
      setCreatedUsername('')
    }
  }, [user])
  const [usernameStatus, setUsernameStatus] = useState('idle')
  const [usernameError, setUsernameError] = useState('')
  const usernameTimeout = useRef(null)
  const [editingUsername, setEditingUsername] = useState('') // which profile being edited ('' = new)
  const [confirmDelete, setConfirmDelete] = useState(null) // profile to delete
  const [deleting, setDeleting] = useState(false)

  // Pre-fill form when selecting a profile to edit
  const selectProfile = (profile) => {
    if (!profile) {
      // Reset to new profile form
      setForm({ ...EMPTY_FORM })
      setTags([])
      setLinks([])
      setPhotoData('')
      setPhotoFile(null)
      setAccent('#c45a3c')
      setBgGradient(null)
      setBgColor('#ffffff')
      setFont('serif')
      setUsernameStatus('idle')
      setUsernameError('')
      originalPhotoUrl.current = ''
      setEditingUsername('')
      return
    }
    setForm({
      name: profile.name || '',
      role: profile.role || '',
      email: profile.email || '',
      location: profile.location || '',
      bio: profile.bio || '',
      tagInput: '',
      username: profile.username || '',
    })
    setTags(profile.tags || [])
    setLinks((profile.links || []).map(l => ({ id: Math.random().toString(36).slice(2, 9), label: l.label, url: l.url })))
    setAccent(profile.accent || '#c45a3c')
    setBgGradient(profile.bg_gradient || null)
    setBgColor(profile.bg_color || '#ffffff')
    setFont(profile.font || 'serif')
    setUsernameStatus('available') // their own username
    setPhotoData(profile.photo_url || '')
    originalPhotoUrl.current = profile.photo_url || ''
    setEditingUsername(profile.username)
  }

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
      if (value.toLowerCase() === editingUsername) {
        setUsernameStatus('available')
        setUsernameError('')
        return
      }
      const available = await checkUsername(value)
      setUsernameStatus(available ? 'available' : 'taken')
      if (!available) setUsernameError('This username is taken.')
    }, 400)
  }, [editingUsername])

  // --- Photo ---
  const handlePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError('')

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select an image file.')
      return
    }

    // Local preview
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPhotoData(ev.target?.result || '')
    }
    reader.readAsDataURL(file)

    // Save file for upload
    setPhotoFile(file)
  }

  const removePhoto = () => {
    setPhotoData('')
    setPhotoFile(null)
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

    // Auth check
    if (!user) {
      onSignInNeeded?.()
      return
    }

    if (!form.name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!form.username.trim()) {
      setError('Choose a username for your profile.')
      return
    }
    if (usernameStatus === 'taken' && form.username.trim().toLowerCase() !== editingUsername) {
      setError('That username is taken. Try another.')
      return
    }
    if (usernameStatus === 'checking') {
      setError('Wait for the username check to finish.')
      return
    }

    setSaving(true)

    try {
      // Upload photo if a new one was selected
      let photoUrl = ''
      if (photoFile) {
        photoUrl = await uploadPhoto(photoFile, form.username.trim())
      }

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
        photo_url: photoUrl || (editingUsername ? originalPhotoUrl.current : '') || photoData || '',
        links: validLinks,
        accent,
        bg_color: bgColor,
        bg_gradient: bgGradient,
        font,
      }

      const result = editingUsername
        ? await updateProfile(editingUsername, data)
        : await createProfile(form.username.trim(), data)
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
    setPhotoFile(null)
    setLinks([])
    setAccent('#c45a3c')
    setBgGradient(null)
    setBgColor('#ffffff')
    setFont('serif')
    setSubmitted(false)
    setError('')
    setPhotoError('')
    setCreatedUsername('')
    setEditingUsername('')
    originalPhotoUrl.current = ''
    setUsernameStatus('idle')
    setUsernameError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (profile) => {
    setDeleting(true)
    setError('')
    try {
      await deleteProfile(profile.username)
      setConfirmDelete(null)
      // Refresh profiles list in parent
      const updated = await getMyProfiles()
      onProfileDeleted?.(updated)
      // If we were editing this profile, reset the form
      if (editingUsername === profile.username) {
        selectProfile(null)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete profile.')
    } finally {
      setDeleting(false)
    }
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
                  photo: latestProtofile?.photo_url || '',
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
            {editingUsername ? 'Edit your protome' : 'Create your protome'}
          </h2>
          <p className="section__subtitle" style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto var(--space-3xl)' }}>
            {editingUsername
              ? 'Update your profile — your changes save immediately.'
              : 'Pick a username, add your links, and get a shareable profile page in seconds.'}
          </p>
        </div>

        {loading ? (
          <div className="create-section__auth-required">
            <div className="create-section__auth-card">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="1.5" style={{ animation: 'spin 1s linear infinite', margin: '0 auto var(--space-xl)' }}>
                <circle cx="12" cy="12" r="10" opacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
              <p style={{ color: 'var(--color-muted)' }}>Checking your session…</p>
            </div>
          </div>
        ) : user ? (
          <form className="create-section__form" onSubmit={handleSubmit}>
            {error && <p className="create-section__form-error">{error}</p>}

            {myProfiles.length > 0 && !editingUsername && (
              <div className="create-section__profiles-list">
                <div className="create-section__profiles-label">Your protome URLs</div>
                {myProfiles.map(p => (
                  <div key={p.username} className="create-section__profile-row">
                    <div className="create-section__profile-info">
                      <span className="create-section__profile-name">{p.name}</span>
                      <span className="create-section__profile-url">/{p.username}</span>
                    </div>
                    <div className="create-section__profile-actions">
                      <button
                        type="button"
                        className="btn btn--ghost create-section__profile-btn"
                        onClick={() => selectProfile(p)}
                      >
                        Edit
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
                        onClick={() => setConfirmDelete(p)}
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
            )}

            {editingUsername && (
              <div className="create-section__editing-banner">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
                <span>Editing <strong>/{editingUsername}</strong></span>
                <button type="button" className="btn btn--text" style={{ fontSize: 'var(--text-xs)', padding: '0.25rem 0.5rem' }} onClick={() => selectProfile(null)}>
                  Create new
                </button>
              </div>
            )}

            {/* ===== Photo ===== */}
            <div className="create-section__field-group">
              <label className="create-section__field-label">Profile photo</label>
              <div className="create-section__photo-area">
                {photoData ? (
                  <div className="create-section__photo-preview">
                    <img src={photoData} alt="Preview" className="create-section__photo-img" />
                    <button type="button" className="create-section__photo-remove" onClick={removePhoto} aria-label="Remove photo">
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
                  className={`create-section__input create-section__input--username ${editingUsername ? 'create-section__input--readonly' : ''}`}
                  placeholder="yourname"
                  value={form.username}
                  onChange={e => {
                    if (editingUsername) return
                    const val = e.target.value.replace(/[^a-z0-9_-]/gi, '')
                    update('username', val)
                    validateUsername(val)
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
              {!editingUsername && usernameStatus === 'available' && <p className="create-section__field-success">Available! protome.io/{form.username}</p>}
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
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
                  <label className="create-section__label">Background</label>
                  <div className="create-section__gradient-picker">
                    {GRADIENT_PRESETS.map(g => {
                      const isLight = g.css && !g.css.includes('radial')
                      const isSelected = bgGradient === g.css || (!bgGradient && g.id === 'none')
                      return (
                        <button
                          key={g.id}
                          type="button"
                          className={`create-section__gradient-swatch ${isSelected ? 'create-section__gradient-swatch--active' : ''}`}
                          onClick={() => {
                            if (g.id === 'none') {
                              setBgGradient(null)
                              setBgColor('#ffffff')
                            } else {
                              setBgGradient(g.css)
                              setBgColor(g.bg)
                            }
                          }}
                          title={g.name}
                          aria-label={g.name}
                          style={{ background: g.css || g.bg }}
                        >
                          {isSelected && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isLight ? '#1a1a1a' : '#fff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </button>
                      )
                    })}
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

            {/* ===== Delete Confirmation ===== */}
            {confirmDelete && (
              <div className="create-section__delete-overlay" onClick={() => setConfirmDelete(null)}>
                <div className="create-section__delete-modal" onClick={e => e.stopPropagation()}>
                  <div className="create-section__delete-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <h3 className="create-section__delete-title">Delete /{confirmDelete.username}?</h3>
                  <p className="create-section__delete-text">
                    This will permanently delete your profile and its data. The username <strong>{confirmDelete.username}</strong> will become available for anyone to claim.
                  </p>
                  <div className="create-section__delete-actions">
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => setConfirmDelete(null)}
                      disabled={deleting}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn create-section__delete-confirm"
                      onClick={() => handleDelete(confirmDelete)}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting…' : 'Delete forever'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ===== Submit ===== */}
            <div className="create-section__actions">
              <button
                type="submit"
                className="btn btn--primary create-section__submit"
                disabled={saving}
              >
                {saving ? 'Saving…' : editingUsername ? 'Save changes' : 'Create your protome'}
                {!saving && <span aria-hidden="true">&rarr;</span>}
              </button>
            </div>
          </form>
        ) : (
          <div className="create-section__auth-required">
            <div className="create-section__auth-card">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <h3>Sign in to create your protome</h3>
              <p>You need an account to claim your username. Takes 10 seconds.</p>
              <button className="btn btn--primary" onClick={onSignInNeeded}>
                Sign in / Sign up
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
