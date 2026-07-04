import { useEffect, useState, useRef, useCallback } from 'react'
import { AuthContext } from './useAuth'
import { useToast } from '../components/Toast'

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
  const subscriptionRef = useRef(null)
  const addToast = useToast()

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
        addToast("Email confirmed! You're now signed in.", 'success')
      }
    }
    init()

    // Listen for auth state changes (same-tab sign in / sign out / password recovery)
    getSupabase().then(sb => {
      const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null)
        // Password recovery link clicked — signal the auth modal to show set-password form
        if (event === 'PASSWORD_RECOVERY') {
          localStorage.setItem('password_recovery', '1')
        }
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
          addToast("Email confirmed! You're now signed in.", 'success')
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

  const resetPassword = async (email) => {
    const sb = await getSupabase()
    return sb.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
  }

  const updatePassword = async (newPassword) => {
    const sb = await getSupabase()
    const { error } = await sb.auth.updateUser({ password: newPassword })
    if (error) throw error
    return true
  }

  return (
    <AuthContext.Provider value={{ user, loading, setUser, signUp, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}
