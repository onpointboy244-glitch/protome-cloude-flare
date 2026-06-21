import { useEffect, useRef } from 'react'
import ProtofileCard from './ProtofileCard'
import './Hero.css'

export default function Hero() {
  const heroRef = useRef(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return

    const kids = el.querySelectorAll('.hero__animate')
    kids.forEach((kid, i) => {
      kid.style.opacity = '0'
      kid.style.animation = `none`
      void kid.offsetWidth
      kid.style.animation =
        `fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + i * 0.12}s forwards`
    })
  }, [])

  return (
    <section className="hero" ref={heroRef}>
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

        <div className="hero__visual hero__animate">
          <ProtofileCard />
        </div>
      </div>
    </section>
  )
}
