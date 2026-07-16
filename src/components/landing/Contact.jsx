import '../legal/LegalPages.css'

export default function Contact() {
  return (
    <div className="legal">
      <div className="legal__inner">
        <a href="/" className="legal__back">← Back to protome</a>
        <h1>Contact</h1>
        <p className="legal__date">We'd love to hear from you.</p>

        <h2>Report an issue</h2>
        <p>
          If you come across a profile that violates our{' '}
          <a href="/terms">Terms of Service</a>, use the report button on
          the profile page or email us at{' '}
          <a href="mailto:report@protome.app">report@protome.app</a>.
        </p>

        <h2>General inquiries</h2>
        <p>
          Have a question, suggestion, or just want to say hello? Reach out
          to us at{' '}
          <a href="mailto:hello@protome.app">hello@protome.app</a>.
          We read every message and try to respond within a few days.
        </p>

        <h2>Legal</h2>
        <p>
          For privacy or terms-related questions, please see our{' '}
          <a href="/privacy">Privacy Policy</a> and{' '}
          <a href="/terms">Terms of Service</a>.
        </p>
      </div>
    </div>
  )
}
