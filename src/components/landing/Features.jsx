import './Features.css'

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
      </svg>
    ),
    title: 'Designed by typographers',
    desc: 'Every protofile uses refined type scales, professional kerning, and considered spacing. Your information reads as well as it looks.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    ),
    title: 'Ready in minutes',
    desc: 'No back-and-forth. Share your details, and your protofile is composed instantly. Fast enough to iterate until it feels right.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
      </svg>
    ),
    title: 'One link, anywhere',
    desc: 'Your protofile lives at a beautiful, custom shareable link. Put it in your email signature, portfolio, or bio.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    title: 'Your brand, your colors',
    desc: 'Choose from refined palettes or bring your own. Your protofile should feel like you, not like a template.',
  },
]

export default function Features() {
  return (
    <section id="features" className="section section--surface">
      <div className="container">
        <div className="section__header features__header">
          <h2 className="section__title">
            More than a profile.<br /> A presentation.
          </h2>
          <p className="section__subtitle">
            Most online profiles look like database entries. A protofile is designed —
            because how you present yourself matters as much as what you say.
          </p>
        </div>

        <div className="features__showcase">
          <div className="feature-showcase">
            <div className="feature-showcase__visual">
              <div className="showcase-card" aria-hidden="true">
                <div className="showcase-card__header">
                  <span className="showcase-card__label">Before</span>
                  <div className="showcase-card__content showcase-card__content--plain">
                    <div className="showcase-card__line showcase-card__line--short" />
                    <div className="showcase-card__line" />
                    <div className="showcase-card__line" />
                    <div className="showcase-card__line showcase-card__line--short" />
                  </div>
                </div>
              </div>
              <div className="showcase-arrow" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14"/><path d="m15 6 6 6-6 6"/></svg>
              </div>
              <div className="showcase-card showcase-card--styled">
                <div className="showcase-card__bar" />
                <div className="showcase-card__header">
                  <span className="showcase-card__label" style={{ color: 'var(--color-primary-l)' }}>After</span>
                  <div className="showcase-card__content">
                    <div className="showcase-card__avatar" />
                    <div className="showcase-card__lines">
                      <div className="showcase-card__line showcase-card__line--name" />
                      <div className="showcase-card__line showcase-card__line--role" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="feature-list">
            {FEATURES.map((f, i) => (
              <div className="feature-item" key={i}>
                <span className="feature-item__icon">{f.icon}</span>
                <div>
                  <h3 className="feature-item__title">{f.title}</h3>
                  <p className="feature-item__desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
