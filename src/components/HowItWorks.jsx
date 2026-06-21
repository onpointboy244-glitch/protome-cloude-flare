import './HowItWorks.css'

const STEPS = [
  {
    number: '01',
    title: 'Share your story',
    desc: 'Tell us about yourself — your work, your background, what matters. A simple form is all it takes.',
    color: 'var(--color-primary-l)',
  },
  {
    number: '02',
    title: 'We craft it',
    desc: 'Our design engine transforms your information into a clean, typographically rich protofile. No templates — each one is composed fresh.',
    color: 'var(--color-primary)',
  },
  {
    number: '03',
    title: 'Share your protofile',
    desc: 'Get a beautiful, shareable link. Your story, presented the way it deserves to be seen.',
    color: 'var(--color-accent)',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section">
      <div className="container">
        <div className="section__header how-it-works__header">
          <h2 className="section__title">
            From raw details to a finished protofile
          </h2>
          <p className="section__subtitle">
            Three deliberate steps. No design skills required.
          </p>
        </div>

        <div className="steps">
          {STEPS.map((step, i) => (
            <div
              className={`step ${i === 1 ? 'step--reverse' : ''}`}
              key={step.number}
            >
              <div className="step__content">
                <span className="step__number" style={{ color: step.color }}>
                  {step.number}
                </span>
                <h3 className="step__title">{step.title}</h3>
                <p className="step__desc">{step.desc}</p>
              </div>
              <div className="step__visual" style={{ background: step.color }}>
                <StepVisual index={i} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StepVisual({ index }) {
  return (
    <div className="step-visual" aria-hidden="true">
      {index === 0 && (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="160" height="120" rx="8" fill="oklch(1 0 0 / 0.15)"/>
          <rect x="40" y="40" width="60" height="8" rx="4" fill="oklch(1 0 0 / 0.4)"/>
          <rect x="40" y="56" width="80" height="6" rx="3" fill="oklch(1 0 0 / 0.2)"/>
          <rect x="40" y="70" width="70" height="6" rx="3" fill="oklch(1 0 0 / 0.2)"/>
          <rect x="40" y="92" width="40" height="4" rx="2" fill="oklch(1 0 0 / 0.15)"/>
          <rect x="40" y="104" width="50" height="4" rx="2" fill="oklch(1 0 0 / 0.15)"/>
          <circle cx="160" cy="40" r="10" fill="oklch(1 0 0 / 0.2)"/>
        </svg>
      )}
      {index === 1 && (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="160" height="120" rx="8" fill="oklch(1 0 0 / 0.15)"/>
          <rect x="30" y="30" width="140" height="4" rx="2" fill="oklch(1 0 0 / 0.3)"/>
          <rect x="30" y="50" width="50" height="50" rx="25" fill="oklch(1 0 0 / 0.2)"/>
          <rect x="94" y="55" width="70" height="8" rx="4" fill="oklch(1 0 0 / 0.4)"/>
          <rect x="94" y="69" width="50" height="5" rx="2.5" fill="oklch(1 0 0 / 0.2)"/>
          <rect x="30" y="112" width="50" height="4" rx="2" fill="oklch(1 0 0 / 0.15)"/>
          <rect x="90" y="112" width="50" height="4" rx="2" fill="oklch(1 0 0 / 0.15)"/>
        </svg>
      )}
      {index === 2 && (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="160" height="120" rx="8" fill="oklch(1 0 0 / 0.15)"/>
          <circle cx="100" cy="60" r="16" fill="oklch(1 0 0 / 0.25)"/>
          <rect x="74" y="82" width="52" height="6" rx="3" fill="oklch(1 0 0 / 0.4)"/>
          <rect x="60" y="96" width="80" height="4" rx="2" fill="oklch(1 0 0 / 0.15)"/>
          <rect x="60" y="106" width="60" height="4" rx="2" fill="oklch(1 0 0 / 0.15)"/>
          <rect x="60" y="116" width="70" height="4" rx="2" fill="oklch(1 0 0 / 0.15)"/>
          <rect x="50" y="130" width="20" height="6" rx="3" fill="oklch(1 0 0 / 0.3)"/>
          <rect x="78" y="130" width="20" height="6" rx="3" fill="oklch(1 0 0 / 0.3)"/>
          <rect x="106" y="130" width="20" height="6" rx="3" fill="oklch(1 0 0 / 0.3)"/>
        </svg>
      )}
    </div>
  )
}
