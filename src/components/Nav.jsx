import { useState, useEffect } from 'react'
import './Nav.css'

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'nav--scrolled' : ''}`} role="navigation" aria-label="Main">
      <div className="container nav__inner">
        <a href="#" className="nav__logo" aria-label="protome home">
          <span className="nav__logo-mark" aria-hidden="true">●</span>
          <span className="nav__logo-text">protome</span>
        </a>

        <div className="nav__links">
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} className="nav__link">
              {link.label}
            </a>
          ))}
        </div>

        <a href="#create" className="btn btn--primary nav__cta">
          Create yours
        </a>
      </div>
    </nav>
  )
}
