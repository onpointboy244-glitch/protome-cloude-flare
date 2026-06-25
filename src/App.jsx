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

function LoadingSpinner() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted)' }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" opacity="0.3" />
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()
  const [route, setRoute] = useState('loading') // loading | landing | profile | notfound
  const [sharedData, setSharedData] = useState(null)
  const [protofileData, setProtofileData] = useState(null)
  const [myProfiles, setMyProfiles] = useState([])
  const [showAuth, setShowAuth] = useState(false)

  const resolveRoute = (initialProfile = null) => {
    const path = window.location.pathname.replace(/\/$/, '') || '/'
    const username = path === '/' ? null : path.slice(1)

    if (!username) {
      setRoute('landing')
      return
    }

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
    return <LoadingSpinner />
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
