import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer__inner">
        <div className="footer__brand">
          <a href="#" className="footer__logo" aria-label="protome home">
            <span className="footer__logo-mark" aria-hidden="true">●</span>
            <span className="footer__logo-text">protome</span>
          </a>
          <p className="footer__tagline">
            Raw information, beautifully resolved.
          </p>
        </div>

        <div className="footer__links">
          <div className="footer__group">
            <h4 className="footer__group-title">Product</h4>
            <a href="#how-it-works" className="footer__link">How it works</a>
            <a href="#features" className="footer__link">Features</a>
            <a href="#pricing" className="footer__link">Pricing</a>
          </div>
          <div className="footer__group">
            <h4 className="footer__group-title">Company</h4>
            <a href="/about" className="footer__link">About</a>
            <a href="/blog" className="footer__link">Blog</a>
            <a href="/contact" className="footer__link">Contact</a>
          </div>
          <div className="footer__group">
            <h4 className="footer__group-title">Legal</h4>
            <a href="/privacy" className="footer__link">Privacy</a>
            <a href="/terms" className="footer__link">Terms</a>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">&copy; {year} protome. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
