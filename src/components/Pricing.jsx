import './Pricing.css'

const PLANS = [
  {
    name: 'Free',
    price: '0',
    desc: 'Try protome and see what a difference design makes.',
    features: ['1 protofile', 'Basic design', 'Shareable link', 'Unlimited views'],
    featured: false,
  },
  {
    name: 'Pro',
    price: '12',
    desc: 'For professionals who want their story to stand out.',
    features: [
      'Unlimited protofiles',
      'Custom colors & fonts',
      'Priority updates',
      'Export to PDF',
      'Custom domain',
    ],
    featured: true,
  },
  {
    name: 'Team',
    price: '28',
    desc: 'For teams and organizations managing multiple profiles.',
    features: [
      'Everything in Pro',
      'Team workspace',
      'Admin controls',
      'API access',
      'Dedicated support',
    ],
    featured: false,
  },
]

export default function Pricing() {
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
          {PLANS.map(plan => (
            <div
              key={plan.name}
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
                <p className="pricing-card__desc">{plan.desc}</p>
                <ul className="pricing-card__features">
                  {plan.features.map(f => (
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
                <a
                  href="#cta"
                  className={`btn ${plan.featured ? 'btn--primary' : 'btn--ghost'} pricing-card__btn`}
                >
                  {plan.name === 'Free' ? 'Get started' : 'Upgrade to ' + plan.name}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
