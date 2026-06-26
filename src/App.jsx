import { useState, useEffect, startTransition, lazy, Suspense } from 'react'
import { useAuth } from './lib/useAuth'
import Nav from './components/Nav'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import Features from './components/Features'
import CTA from './components/CTA'
import Footer from './components/Footer'
import Auth from './components/Auth'
import { getProfile, getMyProfiles } from './lib/api'

const SharedProtofile = lazy(() => import('./components/SharedProtofile'))
const CreateSection = lazy(() => import('./components/CreateSection'))
const Pricing = lazy(() => import('./components/Pricing'))
const Privacy = lazy(() => import('./components/Privacy'))
const Terms = lazy(() => import('./components/Terms'))

function LoadingSpinner({ slow }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-lg)', color: 'var(--color-muted)' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" opacity="0.3" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
      {slow && <p style={{ fontSize: 'var(--text-sm)', maxWidth: 260, textAlign: 'center', lineHeight: 1.5 }}>Still loading… check your connection if this persists.</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()
  const [route, setRoute] = useState('loading') // loading | landing | profile | notfound | error
  const [sharedData, setSharedData] = useState(null)
  const [protofileData, setProtofileData] = useState(null)
  const [myProfiles, setMyProfiles] = useState([])
  const [showAuth, setShowAuth] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [slowLoading, setSlowLoading] = useState(false)

  // Show "still loading" hint after 8s on the loading spinner
  useEffect(() => {
    const t = setTimeout(() => setSlowLoading(true), 8000)
    return () => clearTimeout(t)
  }, [route])

  const resolveRoute = (initialProfile = null) => {
    const path = window.location.pathname.replace(/\/$/, '') || '/'
    const username = path === '/' ? null : path.slice(1)

    if (!username) {
      setRoute('landing')
      return
    }

    // Static pages
    if (username === 'privacy') { setRoute('privacy'); return }
    if (username === 'terms') { setRoute('terms'); return }

    // Use server-injected profile data if available (skips loading + Supabase fetch)
    if (initialProfile) {
      setSharedData(initialProfile)
      setRoute('profile')
      return
    }

    setRoute('loading')
    getProfile(username).then(data => {
      if (data) {
        setSharedData(data)
        setRoute('profile')
      } else {
        setRoute('notfound')
      }
    }).catch(() => {
      setErrorMsg('Could not load profile. Check your connection and try again.')
      setRoute('error')
    })
  }

  // On mount: check for __INITIAL_PROFILE__ injected by the Edge Function
  const getInitialProfile = () => {
    try {
      const el = document.getElementById('__INITIAL_PROFILE__')
      if (!el) return null
      const data = JSON.parse(el.textContent)
      el.remove() // clean up
      return data
    } catch { return null }
  }

  useEffect(() => {
    // Check for server-injected profile data (Edge Function pre-fetched it)
    const initial = getInitialProfile()
    startTransition(() => resolveRoute(initial))
    const handlePopState = () => startTransition(() => resolveRoute())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Fetch current user's profiles when signed in
  useEffect(() => {
    if (user) {
      getMyProfiles().then(setMyProfiles)
    } else {
      startTransition(() => {
        setMyProfiles([])
        setProtofileData(null)
      })
    }
  }, [user])

  // Refresh profiles after creating one
  const handleProfileCreated = (data) => {
    setProtofileData(data)
    getMyProfiles().then(setMyProfiles)
  }

  // Refresh profiles after deleting one
  const handleProfileDeleted = (updated) => {
    setMyProfiles(updated)
  }

  // --- Profile view ---
  if (route === 'profile' && sharedData) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <SharedProtofile data={sharedData} />
      </Suspense>
    )
  }

  // --- Not found ---
  if (route === 'notfound') {
    return (
      <div className="notfound">
        <div className="notfound__inner">
          <h1 className="notfound__title">Not found</h1>
          <p className="notfound__text">
            This protome doesn't exist yet. Claim your name and make it yours.
          </p>
          <a href="/" className="btn btn--primary">Create yours →</a>
        </div>
        <style>{`
          .notfound {
            min-height: 100dvh; display: flex; align-items: center; justify-content: center;
            padding: 2rem; background: var(--color-bg);
          }
          .notfound__inner { text-align: center; max-width: 380px; }
          .notfound__title { font-family: var(--font-display); font-size: var(--text-5xl); margin-bottom: var(--space-lg); color: var(--color-ink); }
          .notfound__text { color: var(--color-muted); margin-bottom: var(--space-2xl); line-height: 1.6; }
        `}</style>
      </div>
    )
  }

  // --- Loading ---
  if (route === 'loading') {
    return <LoadingSpinner slow={slowLoading} />
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
        <style>{`
          .notfound {
            min-height: 100dvh; display: flex; align-items: center; justify-content: center;
            padding: 2rem; background: var(--color-bg);
          }
          .notfound__inner { text-align: center; max-width: 380px; }
          .notfound__title { font-family: var(--font-display); font-size: var(--text-5xl); margin-bottom: var(--space-lg); color: var(--color-ink); }
          .notfound__text { color: var(--color-muted); margin-bottom: var(--space-2xl); line-height: 1.6; }
        `}</style>
      </div>
    )
  }

  // --- Static pages ---
  if (route === 'privacy') {
    return <Suspense fallback={<LoadingSpinner />}><Privacy /></Suspense>
  }
  if (route === 'terms') {
    return <Suspense fallback={<LoadingSpinner />}><Terms /></Suspense>
  }

  // --- Landing page ---
  return (
    <>
      <Nav
        onSignIn={() => setShowAuth(true)}
        myProfiles={myProfiles}
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
