import { useState, useEffect } from 'react'
import { getPlans } from '../lib/api'
import './Pricing.css'

export default function Pricing() {
  const [plans, setPlans] = useState([])
  const [comingSoon, setComingSoon] = useState(null)

  useEffect(() => {
    getPlans().then(setPlans)
  }, [])

  return (
    <section id="pricing" className="section pricing">
      <div className="container">
        <div className="section__header section__header--center pricing__header">
          <h2 className="section__title">
            Simple, transparent pricing
          </h2>
          <p className="section__subtitle">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="pricing__grid">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`pricing-card ${plan.featured ? 'pricing-card--featured' : ''}`}
            >
              {plan.featured && (
                <span className="pricing-card__badge">Most popular</span>
              )}
              <div className="pricing-card__body">
                <h3 className="pricing-card__name">{plan.name}</h3>
                <div className="pricing-card__price">
                  <span className="pricing-card__currency">$</span>
                  <span className="pricing-card__amount">{plan.price}</span>
                  <span className="pricing-card__period">/month</span>
                </div>
                <p className="pricing-card__desc">{plan.description}</p>
                <ul className="pricing-card__features">
                  {plan.features?.map(f => (
                    <li key={f} className="pricing-card__feature">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="pricing-card__check">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pricing-card__action">
                {plan.available ? (
                  <a
                    href={`/${plan.href || '#create'}`}
                    className={`btn ${plan.featured ? 'btn--primary' : 'btn--ghost'} pricing-card__btn`}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <button
                    className={`btn ${plan.featured ? 'btn--primary' : 'btn--ghost'} pricing-card__btn`}
                    onClick={() => setComingSoon(plan.name)}
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Modal */}
      {comingSoon && (
        <div className="pricing-overlay" onClick={() => setComingSoon(null)}>
          <div className="pricing-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Coming soon">
            <button className="pricing-modal__close" onClick={() => setComingSoon(null)} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="pricing-modal__icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
                <path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>
                <path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>
              </svg>
            </div>
            <h2 className="pricing-modal__title">Coming soon</h2>
            <p className="pricing-modal__text">
              You can use everything protome offers for free right now.
              Paid plans will be available once payments are set up.
            </p>
            <button className="btn btn--primary pricing-modal__btn" onClick={() => setComingSoon(null)}>
              Sounds good
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
