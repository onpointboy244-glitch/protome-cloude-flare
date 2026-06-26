import './LegalPages.css'

export default function About() {
  return (
    <div className="legal">
      <div className="legal__inner">
        <a href="/" className="legal__back">← Back to protome</a>
        <h1>About protome</h1>
        <p className="legal__date">Raw information, beautifully resolved.</p>

        <h2>What is protome?</h2>
        <p>
          protome is a link-in-bio profile builder that gives you a clean,
          minimal page to share all of your online presence in one place.
          No clutter, no distractions — just your links, your way.
        </p>

        <h2>Why protome?</h2>
        <p>
          We believe your online identity shouldn't be locked inside a
          platform. protome profiles are simple, fast, and built to work
          everywhere. Whether you're a creator, developer, artist, or just
          someone who wants a single link that actually represents you,
          protome gives you the space to make it yours.
        </p>

        <h2>Our values</h2>
        <ul>
          <li><strong>Simplicity</strong> — Every feature earns its place. If it doesn't make your profile better, it doesn't belong.</li>
          <li><strong>Ownership</strong> — Your content is yours. We just help you display it.</li>
          <li><strong>Speed</strong> — Pages load fast, look great, and work on every device.</li>
        </ul>

        <h2>Who builds it?</h2>
        <p>
          protome is built by a small team passionate about clean design
          and thoughtful software. We're always improving — if you have
          ideas or feedback, we'd love to hear from you.
        </p>
      </div>
    </div>
  )
}
