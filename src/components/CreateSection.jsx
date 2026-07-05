import { useState, useRef, useCallback, useEffect, useMemo, startTransition } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../lib/useAuth'
import { useProfileForm } from '../lib/useProfileForm'
import { createProfile, updateProfile, deleteProfile, checkUsername, uploadPhoto, deleteProfilePhoto } from '../lib/api'
import { MAX_FREE_PROFILES } from './createSection/formConstants'
import CreateProfileResult from './createSection/CreateProfileResult'
import ProfileSelector from './createSection/ProfileSelector'
import ProfilePhotoUploader from './createSection/ProfilePhotoUploader'
import UsernameField from './createSection/UsernameField'
import LinksEditor from './createSection/LinksEditor'
import DesignControls from './createSection/DesignControls'
import DeleteProfileModal from './createSection/DeleteProfileModal'
import { useToast } from './Toast'
import './CreateSection.css'

export default function CreateSection({ onProtofileCreated, onProfileDeleted, latestProtofile, onSignInNeeded, myProfiles = [], profilesLoading, editTarget, onEditConsumed }) {
  const { user, loading } = useAuth()
  const addToast = useToast()
  const {
    state: f, originalPhotoUrl: originalPhotoUrlRef,
    setField, handlePhoto, removePhoto, setDesign,
    reset, loadProfile,
    addLink, addLinkToGroup, addSection, updateLink, removeLink, moveLink,
  } = useProfileForm()

  // --- UI-only state ---
  const [submitted, setSubmitted] = useState(false)
  const [createdUsername, setCreatedUsername] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [usernameStatus, setUsernameStatus] = useState('idle')
  const [usernameError, setUsernameError] = useState('')
  const [editingUsername, setEditingUsername] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const usernameTimeout = useRef(null)

  const profileMutation = useMutation({
    mutationFn: async () => {
      const username = f.username.trim().toLowerCase()

      let photoUrl = ''
      if (f.photoFile) photoUrl = await uploadPhoto(f.photoFile, username)
      if (f.photoRemoved && !f.photoFile && editingUsername) await deleteProfilePhoto(editingUsername)

      const processedLinks = f.links
        .filter(l => l.isSection ? l.label.trim() : l.url.trim())
        .map(l => l.isSection
          ? { label: l.label.trim(), isSection: true }
          : { label: l.label.trim() || 'Website', url: l.url.trim(), ...(l.type ? { type: l.type } : {}) }
        )

      const validLinks = processedLinks.filter((item, index, arr) => {
        if (!item.isSection) return true
        for (let i = index + 1; i < arr.length; i++) {
          if (arr[i].isSection) break
          return true
        }
        return false
      })

      const data = {
        name: f.name.trim(), role: f.role.trim(),
        bio: f.bio.trim(),
        photo_url: f.photoRemoved && !f.photoFile ? '' : (photoUrl || (editingUsername ? originalPhotoUrlRef.current : '') || f.photoData || ''),
        links: validLinks, accent: f.accent, bg_color: f.bgColor, bg_gradient: f.bgGradient, font: f.font,
        detect_icons: f.detectIcons, username,
      }

      if (editingUsername) await updateProfile(editingUsername, data)
      else await createProfile(username, data)
      return data
    },
    onSuccess: (data) => {
      setCreatedUsername(data.username)
      setSubmitted(true)
      onProtofileCreated(data)
    },
    onError: (err) => {
      showError(err.message || 'Something went wrong. Try again.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (profile) => deleteProfile(profile.username),
    onSuccess: (_, profile) => {
      setConfirmDelete(null)
      onProfileDeleted?.()
      if (editingUsername === profile.username) selectProfile(null)
    },
    onError: (err) => {
      showError(err.message || 'Failed to delete profile.')
    },
  })

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameTimeout.current) clearTimeout(usernameTimeout.current)
    }
  }, [])

  // Reset result view on sign out
  useEffect(() => {
    if (!user) {
      const id = setTimeout(() => { setSubmitted(false); setCreatedUsername('') }, 0)
      return () => clearTimeout(id)
    }
  }, [user])

  // Fire a toast for form-level errors
  const showError = useCallback((msg) => {
    addToast(msg, 'error')
  }, [addToast])

  // --- Profile selection ---
  const selectProfile = useCallback((profile) => {
    if (!profile) {
      reset()
      setEditingUsername('')
      setUsernameStatus('idle')
      setUsernameError('')
      originalPhotoUrlRef.current = ''
      return
    }
    loadProfile(profile)
    setEditingUsername(profile.username)
    setUsernameStatus('available')
    setUsernameError('')
  }, [reset, loadProfile, originalPhotoUrlRef])

  // Auto-select profile when Edit is clicked in nav
  useEffect(() => {
    if (!user || !editTarget || myProfiles.length === 0) return
    const profile = myProfiles.find(p => p.username === editTarget)
    if (profile) startTransition(() => selectProfile(profile))
    onEditConsumed?.()
  }, [editTarget, user, myProfiles, onEditConsumed, selectProfile])

  // --- Username validation ---
  const validateUsername = useCallback((value) => {
    if (!value) { setUsernameStatus('idle'); setUsernameError(''); return }
    if (!/^[a-z0-9][a-z0-9_-]{0,28}[a-z0-9]$/i.test(value) && value.length < 30) {
      if (!/^[a-z0-9_-]+$/i.test(value)) {
        setUsernameStatus('taken'); setUsernameError('Letters, numbers, hyphens and underscores only.'); return
      }
      if (value.length < 2) { setUsernameStatus('idle'); setUsernameError('Minimum 2 characters.'); return }
      if (/[-_]$/.test(value)) { setUsernameStatus('idle'); setUsernameError('Must end with a letter or number.'); return }
    }
    if (value.length > 30) { setUsernameStatus('taken'); setUsernameError('Maximum 30 characters.'); return }
    if (!/^[a-z0-9].*[a-z0-9]$/i.test(value)) { setUsernameStatus('idle'); setUsernameError('Must start and end with a letter or number.'); return }

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
  const wrappedHandlePhoto = async (e) => {
    setPhotoError('')
    const err = await handlePhoto(e)
    if (err) setPhotoError(err)
  }

  // --- Submit ---
  const handleSubmit = (e) => {
    e.preventDefault(); setUsernameError('')
    if (!user) { onSignInNeeded?.(); return }
    const nameTrimmed = f.name.trim()
    if (nameTrimmed.length < 2) { showError('Please enter a name (at least 2 characters).'); return }
    if (!/[a-zA-Z]/.test(nameTrimmed)) { showError('Name must include at least one letter.'); return }
    if (!f.username.trim()) { showError('Choose a username for your profile.'); return }
    if (usernameStatus === 'taken' && f.username.trim().toLowerCase() !== editingUsername) { showError('That username is taken. Try another.'); return }
    if (usernameStatus === 'checking') { showError('Wait for the username check to finish.'); return }
    if (!/^[a-z0-9][a-z0-9_-]{0,28}[a-z0-9]$/i.test(f.username.trim())) { showError('Username must start and end with a letter or number (2-30 chars, letters, numbers, hyphens, underscores).'); return }
    if (f.links.some(l => !l.isSection && !l.label.trim() && l.url.trim())) { showError('Give each link a label or remove the empty ones.'); return }
    if (f.links.some(l => !l.isSection && l.label.trim() && !l.url.trim())) { showError('Give each link a URL or remove the empty ones.'); return }

    profileMutation.mutate()
  }

  const handleReset = () => {
    reset()
    setSubmitted(false); setPhotoError(''); setCreatedUsername('')
    setEditingUsername(''); originalPhotoUrlRef.current = ''
    setUsernameStatus('idle'); setUsernameError('')
  }

  const handleDelete = (profile) => {
    deleteMutation.mutate(profile)
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
              <p style={{ color: 'var(--color-muted)' }}>Checking your session&hellip;</p>
            </div>
          </div>
        ) : user ? (
          <form className="create-section__form" onSubmit={handleSubmit}>

            <ProfileSelector myProfiles={myProfiles} profilesLoading={profilesLoading} onEdit={selectProfile} onDelete={setConfirmDelete} editingProfile={editingUsername} />

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
              <><ProfilePhotoUploader photoData={f.photoData} photoError={photoError} onPhoto={wrappedHandlePhoto} onRemove={removePhoto} />

              <div className="create-section__field-group">
                <label className="create-section__field-label">About you</label>
                <div className="create-section__grid">
                  <div className="create-section__field">
                    <label htmlFor="pf-name" className="create-section__label">Full name *</label>
                    <input id="pf-name" type="text" className="create-section__input" placeholder="e.g. Jordan Mitchell" value={f.name} onChange={e => setField('name', e.target.value)} required />
                  </div>
                  <div className="create-section__field">
                    <label htmlFor="pf-role" className="create-section__label">Role / title</label>
                    <input id="pf-role" type="text" className="create-section__input" placeholder="e.g. Product Designer · Independent" value={f.role} onChange={e => setField('role', e.target.value)} />
                  </div>
                </div>
              </div>

              <UsernameField
                username={f.username}
                editingUsername={editingUsername}
                usernameStatus={usernameStatus}
                usernameError={usernameError}
                onChange={val => { setField('username', val); validateUsername(val) }}
              />

              <div className="create-section__field-group">
                <label htmlFor="pf-bio" className="create-section__field-label">Bio</label>
                <textarea id="pf-bio" className="create-section__textarea" rows={3} placeholder="Tell people about yourself — your work, what you build, what you're about." value={f.bio} onChange={e => setField('bio', e.target.value)} />
              </div>

              <LinksEditor links={f.links} onAddLink={addLink} onAddLinkToGroup={addLinkToGroup} onAddSection={addSection} onUpdateLink={updateLink} onRemoveLink={removeLink} onMoveLink={moveLink} />

              <DesignControls
                accent={f.accent}
                bgGradient={f.bgGradient}
                font={f.font}
                onAccentChange={val => setDesign({ accent: val })}
                onBgChange={g => {
                  if (g.id === 'none') setDesign({ bgGradient: null, bgColor: '#ffffff' })
                  else setDesign({ bgGradient: g.css, bgColor: g.bg })
                }}
                onFontChange={val => setDesign({ font: val })}
              />

              <div className="create-section__field-group">
                <div className="create-section__toggle-row">
                  <div className="create-section__toggle-info">
                    <label className="create-section__field-label" style={{ margin: 0 }}>Detect platform icons</label>
                    <p className="create-section__field-help" style={{ margin: 0 }}>Show platform icons (Instagram, GitHub, etc.) next to link buttons.</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={f.detectIcons}
                      onChange={e => setField('detectIcons', e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              </div>

              <div className="create-section__actions">
                <button type="submit" className="btn btn--primary create-section__submit" disabled={profileMutation.isPending}>
                  {profileMutation.isPending ? 'Saving…' : editingUsername ? 'Save changes' : 'Create your protome'}
                  {!profileMutation.isPending && <span aria-hidden="true">&rarr;</span>}
                </button>
              </div>
              </>
            )}

            <DeleteProfileModal profile={confirmDelete} deleting={deleteMutation.isPending} onCancel={() => setConfirmDelete(null)} onConfirm={handleDelete} />
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
