import { useState } from 'react'
import { joinWaitlist } from '../../lib/api'
import './CTA.css'

export default function CTA() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      await joinWaitlist(email)
      setStatus('success')
      setMessage("You're in! Expect updates soon.")
      setEmail('')
    } catch (err) {
      setStatus('error')
      setMessage(err?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <section id="cta" className="section cta">
      <div className="container">
        <div className="cta__card">
          <div className="cta__icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 className="cta__title">
            Stay in the loop
          </h2>
          <p className="cta__desc">
            New features, design updates, and product news — straight to your inbox.
            No spam, ever.
          </p>

          <form className="cta__form" onSubmit={handleSubmit}>
            <label htmlFor="cta-email" className="sr-only">Email address</label>
            <input
              id="cta-email"
              type="email"
              placeholder="you@example.com"
              className="cta__input"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={status === 'loading'}
            />
            <button type="submit" className="btn btn--primary cta__btn" disabled={status === 'loading'}>
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>

          {message && (
            <p className={`cta__message cta__message--${status}`}>
              {message}
            </p>
          )}

          <p className="cta__footnote">
            Unsubscribe anytime. We respect your inbox.
          </p>
        </div>
      </div>
    </section>
  )
}
