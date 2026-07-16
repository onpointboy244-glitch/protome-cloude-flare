import ProtofileCard from '../profile/ProtofileCard'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__content">
          <span className="hero__tag hero__animate">Introducing protome</span>
          <h1 className="hero__title hero__animate">
            Your raw information,<br />
            <span className="hero__title-accent">beautifully resolved</span>
          </h1>
          <p className="hero__desc hero__animate">
            Tell us about yourself. We transform your scattered details into a polished
            protofile — clean, designed, unmistakably yours.
          </p>
          <div className="hero__actions hero__animate">
            <a href="#create" className="btn btn--primary">
              Create your protofile
              <span aria-hidden="true" className="hero__arrow">&rarr;</span>
            </a>
            <a href="#how-it-works" className="btn btn--text">
              See how it works
            </a>
          </div>
        </div>

        <div className="hero__visual">
          <ProtofileCard animateIn />
        </div>
      </div>
    </section>
  )
}
