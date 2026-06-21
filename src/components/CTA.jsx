import './CTA.css'

export default function CTA() {
  return (
    <section id="cta" className="section cta">
      <div className="container">
        <div className="cta__card">
          <h2 className="cta__title">
            Ready for a protofile<br />
            <span className="cta__title-accent">that feels like you?</span>
          </h2>
          <p className="cta__desc">
            Join the waitlist and be the first to create your protofile.
          </p>

          <form className="cta__form" onSubmit={e => e.preventDefault()}>
            <label htmlFor="cta-email" className="sr-only">Email address</label>
            <input
              id="cta-email"
              type="email"
              placeholder="Enter your email"
              className="cta__input"
              required
              autoComplete="email"
            />
            <button type="submit" className="btn btn--primary cta__btn">
              Join the waitlist
            </button>
          </form>

          <p className="cta__footnote">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
