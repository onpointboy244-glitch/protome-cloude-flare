import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useAuth } from '../lib/useAuth'
import { createProfile, updateProfile, deleteProfile, checkUsername, uploadPhoto, getMyProfiles } from '../lib/api'
import { EMPTY_FORM, freshLink, MAX_FREE_PROFILES } from './createSection/formConstants'
import CreateProfileResult from './createSection/CreateProfileResult'
import ProfileSelector from './createSection/ProfileSelector'
import ProfilePhotoUploader from './createSection/ProfilePhotoUploader'
import UsernameField from './createSection/UsernameField'
import TagsManager from './createSection/TagsManager'
import LinksEditor from './createSection/LinksEditor'
import DesignControls from './createSection/DesignControls'
import DeleteProfileModal from './createSection/DeleteProfileModal'
import './CreateSection.css'

export default function CreateSection({ onProtofileCreated, onProfileDeleted, latestProtofile, onSignInNeeded, myProfiles = [] }) {
  const { user, loading } = useAuth()

  // --- All state ---
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [tags, setTags] = useState([])
  const [photoData, setPhotoData] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
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
  const [usernameStatus, setUsernameStatus] = useState('idle')
  const [usernameError, setUsernameError] = useState('')
  const [editingUsername, setEditingUsername] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const originalPhotoUrl = useRef('')
  const usernameTimeout = useRef(null)

  // Reset result view on sign out
  useEffect(() => {
    if (!user) {
      const id = setTimeout(() => { setSubmitted(false); setCreatedUsername('') }, 0)
      return () => clearTimeout(id)
    }
  }, [user])

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  // --- Profile selection ---
  const selectProfile = useCallback((profile) => {
    if (!profile) {
      setForm({ ...EMPTY_FORM }); setTags([]); setLinks([])
      setPhotoData(''); setPhotoFile(null)
      setAccent('#c45a3c'); setBgGradient(null); setBgColor('#ffffff'); setFont('serif')
      setUsernameStatus('idle'); setUsernameError('')
      originalPhotoUrl.current = ''; setEditingUsername('')
      return
    }
    setForm({
      name: profile.name || '', role: profile.role || '', email: profile.email || '',
      location: profile.location || '', bio: profile.bio || '', tagInput: '',
      username: profile.username || '',
    })
    setTags(profile.tags || [])
    setLinks((profile.links || []).map(l => ({ id: Math.random().toString(36).slice(2, 9), label: l.label, url: l.url })))
    setAccent(profile.accent || '#c45a3c')
    setBgGradient(profile.bg_gradient || null)
    setBgColor(profile.bg_color || '#ffffff')
    setFont(profile.font || 'serif')
    setUsernameStatus('available')
    setPhotoData(profile.photo_url || '')
    originalPhotoUrl.current = profile.photo_url || ''
    setEditingUsername(profile.username)
  }, [])

  // --- Username validation ---
  const validateUsername = useCallback((value) => {
    if (!value) { setUsernameStatus('idle'); setUsernameError(''); return }
    if (!/^[a-z0-9][a-z0-9_-]{0,28}[a-z0-9]$/i.test(value) && value.length < 30) {
      if (!/^[a-z0-9_-]+$/i.test(value)) {
        setUsernameStatus('taken'); setUsernameError('Letters, numbers, hyphens and underscores only.'); return
      }
      if (value.length < 2) { setUsernameError('Minimum 2 characters.'); return }
      if (/[-_]$/.test(value)) { setUsernameStatus('idle'); setUsernameError(''); return }
    }
    if (value.length > 30) { setUsernameStatus('taken'); setUsernameError('Maximum 30 characters.'); return }
    if (!/^[a-z0-9].*[a-z0-9]$/i.test(value)) { setUsernameError('Must start and end with a letter or number.'); return }

    setUsernameStatus('checking'); setUsernameError('')
    if (usernameTimeout.current) clearTimeout(usernameTimeout.current)
    usernameTimeout.current = setTimeout(async () => {
      if (value.toLowerCase() === editingUsername) { setUsernameStatus('available'); setUsernameError(''); return }
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
    if (!file.type.startsWith('image/')) { setPhotoError('Please select an image file.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoData(ev.target?.result || '')
    reader.readAsDataURL(file)
    setPhotoFile(file)
  }

  const removePhoto = () => { setPhotoData(''); setPhotoFile(null) }

  // --- Tags ---
  const addTag = () => {
    const t = form.tagInput.trim()
    if (t && !tags.includes(t)) { setTags(prev => [...prev, t]); update('tagInput', '') }
  }
  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag))
  const handleTagKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }

  // --- Links ---
  const addLink = (label = '') => setLinks(prev => [...prev, freshLink(label)])
  const updateLink = (id, field, value) => setLinks(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l))
  const removeLink = (id) => setLinks(prev => prev.filter(l => l.id !== id))

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setUsernameError('')
    if (!user) { onSignInNeeded?.(); return }
    if (!form.name.trim()) { setError('Please enter your name.'); return }
    if (!form.username.trim()) { setError('Choose a username for your profile.'); return }
    if (usernameStatus === 'taken' && form.username.trim().toLowerCase() !== editingUsername) { setError('That username is taken. Try another.'); return }
    if (usernameStatus === 'checking') { setError('Wait for the username check to finish.'); return }

    setSaving(true)
    try {
      let photoUrl = ''
      if (photoFile) photoUrl = await uploadPhoto(photoFile, form.username.trim())

      const validLinks = links.filter(l => l.label.trim() && l.url.trim()).map(l => ({ label: l.label.trim(), url: l.url.trim() }))

      const username = editingUsername || form.username.trim().toLowerCase()

      const data = {
        name: form.name.trim(), role: form.role.trim() || 'Independent creator',
        email: form.email.trim(), location: form.location.trim(), bio: form.bio.trim(),
        tags: tags.length > 0 ? tags : ['Creator'],
        photo_url: photoUrl || (editingUsername ? originalPhotoUrl.current : '') || photoData || '',
        links: validLinks, accent, bg_color: bgColor, bg_gradient: bgGradient, font,
        username,
      }

      const result = editingUsername ? await updateProfile(editingUsername, data) : await createProfile(username, data)
      setCreatedUsername(result.username); setSubmitted(true)
      onProtofileCreated(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally { setSaving(false) }
  }

  const handleReset = () => {
    setForm({ ...EMPTY_FORM }); setTags([]); setPhotoData(''); setPhotoFile(null); setLinks([])
    setAccent('#c45a3c'); setBgGradient(null); setBgColor('#ffffff'); setFont('serif')
    setSubmitted(false); setError(''); setPhotoError(''); setCreatedUsername('')
    setEditingUsername(''); originalPhotoUrl.current = ''
    setUsernameStatus('idle'); setUsernameError('')
  }

  const handleDelete = async (profile) => {
    setDeleting(true); setError('')
    try {
      await deleteProfile(profile.username); setConfirmDelete(null)
      const updated = await getMyProfiles(); onProfileDeleted?.(updated)
      if (editingUsername === profile.username) selectProfile(null)
    } catch (err) { setError(err.message || 'Failed to delete profile.') }
    finally { setDeleting(false) }
  }

  const editingBanner = useMemo(() => editingUsername && !submitted ? (
    <div className="create-section__editing-banner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
      </svg>
      <span className="create-section__editing-text">Editing <strong>/{editingUsername}</strong></span>
      <button type="button" className="btn btn--ghost create-section__editing-new-btn" onClick={() => selectProfile(null)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        New profile
      </button>
    </div>
  ) : null, [editingUsername, submitted, selectProfile])

  // =========== RESULT VIEW ===========
  if (submitted && createdUsername) {
    return <CreateProfileResult createdUsername={createdUsername} latestProtofile={latestProtofile} onReset={handleReset} />
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

            {!editingUsername && (
              <ProfileSelector myProfiles={myProfiles} onEdit={selectProfile} onDelete={setConfirmDelete} />
            )}

            {editingBanner}

            {!editingUsername && myProfiles.length >= MAX_FREE_PROFILES ? (
              <div className="create-section__limit-card">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <h3>Free limit reached</h3>
                <p>You can have up to <strong>{MAX_FREE_PROFILES} profiles</strong> on the free plan. Delete one to make room, or upgrade to create more.</p>
                <div className="create-section__limit-actions">
                  <a href="#pricing" className="btn btn--primary">View plans</a>
                </div>
              </div>
            ) : (
              <><ProfilePhotoUploader photoData={photoData} photoError={photoError} onPhoto={handlePhoto} onRemove={removePhoto} />

            {/* Basic info */}
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

            <UsernameField
              username={form.username}
              editingUsername={editingUsername}
              usernameStatus={usernameStatus}
              usernameError={usernameError}
              onChange={val => { update('username', val); validateUsername(val) }}
            />

            {/* Bio */}
            <div className="create-section__field-group">
              <label htmlFor="pf-bio" className="create-section__field-label">Bio</label>
              <textarea id="pf-bio" className="create-section__textarea" rows={3} placeholder="Tell people about yourself — your work, what you build, what you're about." value={form.bio} onChange={e => update('bio', e.target.value)} />
            </div>

            <TagsManager
              tagInput={form.tagInput}
              tags={tags}
              onTagInput={val => update('tagInput', val)}
              onAddTag={addTag}
              onRemoveTag={removeTag}
              onKeyDown={handleTagKey}
            />

            <LinksEditor links={links} onAddLink={addLink} onUpdateLink={updateLink} onRemoveLink={removeLink} />

            <DesignControls
              accent={accent}
              bgGradient={bgGradient}
              font={font}
              onAccentChange={setAccent}
              onBgChange={g => {
                if (g.id === 'none') { setBgGradient(null); setBgColor('#ffffff') }
                else { setBgGradient(g.css); setBgColor(g.bg) }
              }}
              onFontChange={setFont}
            />

            {/* Submit */}
            <div className="create-section__actions">
              <button type="submit" className="btn btn--primary create-section__submit" disabled={saving}>
                {saving ? 'Saving…' : editingUsername ? 'Save changes' : 'Create your protome'}
                {!saving && <span aria-hidden="true">&rarr;</span>}
              </button>
            </div>
            </>
          )}

          <DeleteProfileModal profile={confirmDelete} deleting={deleting} onCancel={() => setConfirmDelete(null)} onConfirm={handleDelete} />
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
