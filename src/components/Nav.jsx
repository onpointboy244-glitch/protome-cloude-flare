import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../lib/useAuth'
import './Nav.css'

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
]

export default function Nav({ onSignIn, myProfiles = [] }) {
  const { user, signOut } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dark, setDark] = useState(() => {
    // Check localStorage first, fall back to OS preference
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const menuRef = useRef(null)

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  // Listen for OS preference changes (only when no stored preference)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => {
      if (!localStorage.getItem('theme')) {
        setDark(e.matches)
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggleTheme = () => setDark(prev => !prev)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      setMobileOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return
    const handleClick = (e) => {
      if (!e.target.closest('.nav')) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [mobileOpen])

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`} role="navigation" aria-label="Main">
      <div className="container nav__inner">
        <a href="#" className="nav__logo" aria-label="protome home">
          <span className="nav__logo-mark" aria-hidden="true" />
          <span className="nav__logo-text">protome</span>
        </a>

        <div className="nav__links">
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} className="nav__link">
              {link.label}
            </a>
          ))}
        </div>

        <div className="nav__actions">
          {/* Dark mode toggle */}
          <button
            className="nav__theme-toggle"
            onClick={toggleTheme}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            {dark ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Mobile menu toggle */}
          <button
            className="nav__mobile-toggle"
            onClick={() => setMobileOpen(prev => !prev)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>

          {user ? (
            <div className="nav__user-menu" ref={menuRef}>
              <button
                className="nav__user-trigger"
                onClick={() => setMenuOpen(prev => !prev)}
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <span className="nav__user-avatar">
                  {user.email?.[0].toUpperCase()}
                </span>
                <span className="nav__user-email">{user.email}</span>
                <svg
                  className={`nav__chevron ${menuOpen ? 'nav__chevron--open' : ''}`}
                  width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {menuOpen && (
                <div className="nav__dropdown" role="menu">
                  <div className="nav__dropdown-header">
                    <span className="nav__dropdown-email">{user.email}</span>
                  </div>
                  {myProfiles.length > 0 && (
                    <div className="nav__dropdown-profiles">
                      <div className="nav__dropdown-section-label">Your profiles</div>
                      <div className="nav__dropdown-profiles-list">
                        {myProfiles.map(p => (
                          <a
                            key={p.username}
                            href={`/${p.username}`}
                            className="nav__dropdown-item"
                            role="menuitem"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                            {p.name || p.username}
                          </a>
                        ))}
                      </div>
                      <div className="nav__dropdown-divider" />
                    </div>
                  )}

                  <button
                    className="nav__dropdown-item nav__dropdown-item--danger"
                    onClick={signOut}
                    role="menuitem"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn--ghost nav__signin" onClick={onSignIn}>
              Sign in
            </button>
          )}
          <a href="#create" className="btn btn--primary nav__cta">
            Create new
          </a>
          {myProfiles.length > 0 && (
            <a href="#create" className="btn btn--ghost nav__cta nav__cta--edit">
              Edit profile
            </a>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="nav__mobile-panel">
          <div className="container">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="nav__mobile-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
