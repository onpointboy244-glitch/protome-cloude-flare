import { useEffect, useState, useRef, useCallback } from 'react'
import { AuthContext } from './useAuth'
import '../components/Toast.css'

let _supabase = null
let _supabaseLoading = null

async function getSupabase() {
  if (_supabase) return _supabase
  if (!_supabaseLoading) {
    _supabaseLoading = import('./supabase').then(m => {
      _supabase = m.supabase
      return _supabase
    })
  }
  return _supabaseLoading
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)
  const subscriptionRef = useRef(null)

  const clearToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(null)
  }, [])

  const showToast = useCallback((message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message })
    toastTimer.current = setTimeout(() => setToast(null), 5000)
  }, [])

  const refreshSession = useCallback(async () => {
    const sb = await getSupabase()
    const { data: { user } } = await sb.auth.getUser()
    setUser(user)
    setLoading(false)
  }, [])

  // Mount: restore session + check for email confirmation redirect
  useEffect(() => {
    const init = async () => {
      await refreshSession()
      // After session check, see if we were redirected from email confirmation
      if (localStorage.getItem('email_confirmed')) {
        localStorage.removeItem('email_confirmed')
        showToast("Email confirmed! You're now signed in.")
      }
    }
    init()

    // Listen for auth state changes (same-tab sign in / sign out)
    getSupabase().then(sb => {
      const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null)
      })
      subscriptionRef.current = subscription
    }).catch(() => {})

    return () => {
      subscriptionRef.current?.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Cross-tab: detect email confirmation or session changes from other tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'email_confirmed') {
        localStorage.removeItem('email_confirmed')
        refreshSession().then(() => {
          showToast("Email confirmed! You're now signed in.")
        })
      }
      if (e.key?.startsWith('sb-') || e.key === 'supabase.auth.token') {
        refreshSession()
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-check session when tab regains focus
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshSession()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signUp = async (email, password) => {
    const sb = await getSupabase()
    return sb.auth.signUp({ email, password, options: { emailRedirectTo: undefined } })
  }

  const signIn = async (email, password) => {
    const sb = await getSupabase()
    return sb.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    const sb = await getSupabase()
    return sb.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, signUp, signIn, signOut }}>
      {children}
      {toast && (
        <div className="toast-container" role="status" aria-live="polite">
          <div className="toast" role="alert">
            <span className="toast__icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
            <span className="toast__message">{toast.message}</span>
            <button className="toast__close" onClick={clearToast} aria-label="Dismiss">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}
