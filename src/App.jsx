import { useState, useEffect, startTransition, lazy, Suspense } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './lib/useAuth'
import Nav from './components/Nav'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import CTA from './components/CTA'
import Footer from './components/Footer'
import Auth from './components/Auth'
import { getProfile, getMyProfiles } from './lib/api'
import GenericLoader from './components/GenericLoader'

const SharedProtofile = lazy(() => import('./components/sharedProtofile/SharedProtofile'))
import ProfileSkeleton from './components/sharedProtofile/ProfileSkeleton'
const CreateSection = lazy(() => import('./components/CreateSection'))
const Pricing = lazy(() => import('./components/Pricing'))
const Privacy = lazy(() => import('./components/Privacy'))
const Terms = lazy(() => import('./components/Terms'))
const About = lazy(() => import('./components/About'))
const Blog = lazy(() => import('./components/Blog'))
const Contact = lazy(() => import('./components/Contact'))

// Check for __INITIAL_PROFILE__ injected by the Edge Function (run at module level)
// Caches result so it survives StrictMode double-invocation
let _initialProfileCache = undefined
function getInitialProfile() {
  if (_initialProfileCache !== undefined) return _initialProfileCache
  _initialProfileCache = null
  try {
    const el = document.getElementById('__INITIAL_PROFILE__')
    if (!el) return _initialProfileCache
    _initialProfileCache = JSON.parse(el.textContent)
    el.remove()
    return _initialProfileCache
  } catch { return null }
}

export default function App() {
  const { user, pendingRecovery } = useAuth()
  const queryClient = useQueryClient()

  // Determine route synchronously from URL so the first paint is correct
  const initialProfile = getInitialProfile()
  const [route, setRoute] = useState(() => {
    const path = window.location.pathname.replace(/\/$/, '') || '/'
    const username = path === '/' ? null : path.slice(1)
    if (!username) return 'landing'
    if (['privacy', 'terms', 'about', 'blog', 'contact'].includes(username)) return username
    if (initialProfile) return 'profile' // pre-rendered by edge function — skip loading
    return 'loading'
  })

  const [sharedData, setSharedData] = useState(initialProfile || null)
  const [protofileData, setProtofileData] = useState(null)
  const { data: myProfiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles', user?.id],
    queryFn: getMyProfiles,
    enabled: !!user,
  })
  const [showAuth, setShowAuth] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [notFoundUsername, setNotFoundUsername] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const resolveRoute = (initialProfileParam = null) => {
    const path = window.location.pathname.replace(/\/$/, '') || '/'
    const username = path === '/' ? null : path.slice(1)

    // Landing page — no loading needed
    if (!username) {
      setRoute('landing')
      return
    }

    // Static pages — no loading needed
    if (username === 'privacy') { setRoute('privacy'); return }
    if (username === 'terms') { setRoute('terms'); return }
    if (username === 'about') { setRoute('about'); return }
    if (username === 'blog') { setRoute('blog'); return }
    if (username === 'contact') { setRoute('contact'); return }

    // Profile page — show skeleton before async fetch
    if (initialProfileParam) {
      startTransition(() => {
        setSharedData(initialProfileParam)
        setRoute('profile')
      })
      return
    }

    setRoute('loading')
    getProfile(username).then(data => {
      startTransition(() => {
        if (data) {
          setSharedData(data)
          setRoute('profile')
        } else {
          setNotFoundUsername(username)
          setRoute('notfound')
        }
      })
    }).catch(() => {
      startTransition(() => {
        setErrorMsg('Could not load profile. Check your connection and try again.')
        setRoute('error')
      })
    })
  }

  // Check for __INITIAL_PROFILE__ injected by the Edge Function — module-level getInitialProfile handles this
  // (function lives at module scope above for first-paint optimization)

  useEffect(() => {
    startTransition(() => resolveRoute(initialProfile || getInitialProfile()))
    const handlePopState = () => startTransition(() => resolveRoute())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  // initialProfile is module-cached, stable — skip exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-open Auth modal in recovery mode when password recovery link is clicked
  useEffect(() => {
    if (pendingRecovery) {
      startTransition(() => setShowAuth(true))
    }
  }, [pendingRecovery])

  // Clear local state on sign out
  useEffect(() => {
    if (!user) {
      startTransition(() => setProtofileData(null))
    }
  }, [user])

  // Refresh profiles after creating one
  const handleProfileCreated = (data) => {
    setProtofileData(data)
    queryClient.invalidateQueries({ queryKey: ['profiles', user?.id] })
  }

  // Refresh profiles after deleting one
  const handleProfileDeleted = () => {
    queryClient.invalidateQueries({ queryKey: ['profiles', user?.id] })
  }

  // --- Profile view ---
  if (route === 'profile' && sharedData) {
    return (
      <Suspense fallback={<ProfileSkeleton />}>
        <SharedProtofile data={sharedData} />
      </Suspense>
    )
  }

  // --- Not found ---
  if (route === 'notfound') {
    return (
      <div className="notfound">
        <div className="notfound__inner">
          <div className="notfound__icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 15s1.5-2 4-2 4 2 4 2" />
              <circle cx="9" cy="9" r="1" fill="currentColor" stroke="none"/>
              <circle cx="15" cy="9" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </div>
          <h1 className="notfound__title">/{notFoundUsername}</h1>
          <p className="notfound__text">
            This protome doesn't exist yet. It's waiting for someone to claim it.
          </p>
          <div className="notfound__actions">
            <a href={`/#create`} className="btn btn--primary">
              Claim /{notFoundUsername}
              <span aria-hidden="true" className="notfound__arrow">&rarr;</span>
            </a>
            <a href="/" className="btn btn--text">Go home</a>
          </div>
        </div>
      </div>
    )
  }

  // --- Loading ---
  if (route === 'loading') {
    return <ProfileSkeleton />
  }

  // --- Error ---
  if (route === 'error') {
    return (
      <div className="notfound">
        <div className="notfound__inner">
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className="notfound__title">Connection issue</h1>
          <p className="notfound__text">{errorMsg || 'Something went wrong. Please try again.'}</p>
          <button className="btn btn--primary" onClick={() => { setRoute('loading'); window.location.reload() }}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  // --- Static pages ---
  if (route === 'privacy') {
    return <Suspense fallback={<GenericLoader />}><Privacy /></Suspense>
  }
  if (route === 'terms') {
    return <Suspense fallback={<GenericLoader />}><Terms /></Suspense>
  }
  if (route === 'about') {
    return <Suspense fallback={<GenericLoader />}><About /></Suspense>
  }
  if (route === 'blog') {
    return <Suspense fallback={<GenericLoader />}><Blog /></Suspense>
  }
  if (route === 'contact') {
    return <Suspense fallback={<GenericLoader />}><Contact /></Suspense>
  }

  // --- Landing page ---
  return (
    <>
      <Nav
        onSignIn={() => setShowAuth(true)}
        myProfiles={myProfiles}
        profilesLoading={profilesLoading}
        onEditProfile={(username) => setEditTarget(username)}
      />

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}

      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Suspense fallback={null}>
          <CreateSection
            latestProtofile={protofileData}
            onProtofileCreated={handleProfileCreated}
            onProfileDeleted={handleProfileDeleted}
            onSignInNeeded={() => setShowAuth(true)}
            myProfiles={myProfiles}
            profilesLoading={profilesLoading}
            editTarget={editTarget}
            onEditConsumed={() => setEditTarget(null)}
          />
        </Suspense>
        <Suspense fallback={null}>
          <Pricing />
        </Suspense>
        <CTA />
      </main>
      <Footer />
    </>
  )
}
