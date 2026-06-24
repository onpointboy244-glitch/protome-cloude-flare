import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from './supabase'
import '../components/Toast.css'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

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
    const { data: { user } } = await supabase.auth.getUser()
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
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

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password, options: { emailRedirectTo: undefined } })

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () =>
    supabase.auth.signOut()

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

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
