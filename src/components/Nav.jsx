import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../lib/auth'
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
  const menuRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
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
                          /{p.username}
                        </a>
                      ))}
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
            {myProfiles.length > 0 ? 'Edit profile' : 'Create yours'}
          </a>
        </div>
      </div>
    </nav>
  )
}
