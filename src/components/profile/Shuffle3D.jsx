import { useState, useEffect, useCallback, useRef, useMemo, useSyncExternalStore } from 'react'
import {
  FaCamera, FaHeadphones, FaPencilRuler, FaLayerGroup, FaFont,
  FaCode, FaTerminal, FaProjectDiagram, FaMicrochip,
  FaFeatherAlt, FaBook, FaEnvelope, FaPenNib,
  FaPaperPlane, FaChartLine, FaBolt, FaSuitcase,
} from 'react-icons/fa'
import CardFace from './CardFace.jsx'
import { computeProfileTheme } from '../../lib/useProfileTheme.js'
import GooeyBackground from './GooeyBackground'
import './Shuffle3D.css'

/* ---- Field icons — little objects of each demo profile's trade ----
   Font Awesome solid icons (filled, "real" looking) instead of
   Feather's thin outlines. */
const FIELD_ICONS = {
  camera: FaCamera,
  headphones: FaHeadphones,
  'pen-tool': FaPencilRuler,
  layers: FaLayerGroup,
  type: FaFont,
  code: FaCode,
  terminal: FaTerminal,
  branch: FaProjectDiagram,
  cpu: FaMicrochip,
  feather: FaFeatherAlt,
  book: FaBook,
  mail: FaEnvelope,
  edit: FaPenNib,
  send: FaPaperPlane,
  trend: FaChartLine,
  zap: FaBolt,
  bag: FaSuitcase,
}

/* Where icons rest once a card is centered — a gentle arc fully ABOVE
   the card (card is 300×430 → top edge at y=-215). They RISE here from
   behind the card as it approaches front, and sink back when it leaves.
   Seeded-shuffled per profile so each demo lands differently but always
   looks deliberate. */
const FIELD_ANCHORS = [
  { dx: -170, dy: -292, rot: -8 },
  { dx: -57, dy: -316, rot: -3 },
  { dx: 57, dy: -316, rot: 3 },
  { dx: 170, dy: -292, rot: 8 },
]

/* Vertical rest spot — well INSIDE the card body, so at rest the icons are
   fully hidden behind the card (z is below it). The rise from HIDDEN_Y up
   to an anchor's dy is what makes them emerge "from behind". */
const HIDDEN_Y = 80

function easeOutCubic(t) {
  const u = Math.max(0, Math.min(1, t))
  return 1 - Math.pow(1 - u, 3)
}

function hashUnit(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

function fieldPositions(seed, count) {
  const order = FIELD_ANCHORS.map((_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(hashUnit(seed * 7919 + i * 13) * (i + 1))
    const t = order[i]
    order[i] = order[j]
    order[j] = t
  }
  return order.slice(0, count).map((k) => ({ ...FIELD_ANCHORS[k] }))
}

/* ==================================================================
   3D Rotating Ring Carousel

   A visible glowing ring rotates continuously in 3D space, carrying
   cards on a smooth orbit. Motion is driven by requestAnimationFrame
   — no snaps, no discrete steps.

   • rAF drives continuous rotation (never wraps)
   • Cards at equal angular positions on the ring
   • Smooth ease toward clicked card
   • Pauses on hover
   • Each card radiates its own accent color
   ================================================================== */

const RING_RADIUS = 200

/* ---- Premium 3D depth ---- */
const TILT_MAX = 42     // max rotateY on side cards (deg) — they angle toward center
const TILT_ARC = 0.18   // elliptical lift: fraction of ring radius cards rise at front
const BLUR_GAIN = 3     // depth-of-field: blur px per unit of scale loss

function posOnRing(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  const x = RING_RADIUS * Math.sin(rad)
  const z = RING_RADIUS * Math.cos(rad) - RING_RADIUS
  // Ferris-wheel arc: cards rise as they pass the front, drop away behind
  const y = -RING_RADIUS * TILT_ARC * Math.cos(rad)
  const cosA = Math.cos(rad)
  const scale = 0.3 + 0.7 * Math.max(0, cosA * 0.85 + 0.15)
  const opacity = Math.max(0.04, Math.min(1, (cosA + 1) * 0.5 + 0.02))
  const isBack = cosA < -0.3
  // Side cards rotate to face the ring center (left +, right -); front stays flat
  const tilt = -Math.sin(rad) * TILT_MAX
  // Depth-of-field: sharp at front, blur grows as cards fall toward the sides/back
  const blur = Math.max(0, (1 - scale) * BLUR_GAIN)
  return { x, y, z, scale, opacity, isBack, tilt, blur }
}

function enrich(profiles) {
  return profiles.map((p, i) => ({ ...p, _idx: i, _theme: computeProfileTheme(p) }))
}

const DEG_PER_CARD = 90

export default function Shuffle3D({ profiles = [] }) {
  const [angleState, setAngleState] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [activeHovered, setActiveHovered] = useState(false)
  const total = profiles.length

  const angleRef = useRef(0)
  const hoveredRef = useRef(false)
  const targetRef = useRef(null)

  const data = useMemo(() => enrich(profiles), [profiles])

  useEffect(() => { hoveredRef.current = hovered }, [hovered])

  /* Detect real hover capability (mouse/trackpad) vs touch */
  const canHover = useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia('(hover: hover)')
      mq.addEventListener?.('change', callback)
      return () => mq.removeEventListener?.('change', callback)
    },
    () => window.matchMedia('(hover: hover)').matches,
    () => false // SSR fallback
  )

  /* ---- Continuous rotation via rAF ---- */
  useEffect(() => {
    const BASE_SPEED = 9  // degrees per frame — very fast
    let running = true
    let raf

    const tick = () => {
      if (!running) return
      const a = angleRef.current

      if (targetRef.current !== null) {
        const diff = targetRef.current - a
        let shortest = ((diff % 360) + 540) % 360 - 180
        if (Math.abs(shortest) < 0.5) {
          angleRef.current = targetRef.current
          targetRef.current = null
        } else {
          angleRef.current += shortest * 0.08
        }
      } else if (!hoveredRef.current || !canHover) {
        // ---- Slow-mo each time a card reaches the front ----
        // Cards are every 90°. Distance from center → speed.
        // At 0° (center) → slow. At 45° (midway) → fast.
        const mod = ((a % 90) + 90) % 90
        const distFromCenter = Math.min(mod, 90 - mod)  // 0–45
        const t = distFromCenter / 45  // 0=center, 1=midway
        // Crawls at center, accelerates toward midway
        const speedFactor = Math.pow(t, 3)
        const instantSpeed = BASE_SPEED * (0.02 + 0.98 * speedFactor)
        angleRef.current += instantSpeed
      }

      setAngleState(angleRef.current)
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => { running = false; if (raf) cancelAnimationFrame(raf) }
  }, [canHover])

  /* ---- Go to specific card ---- */
  const goTo = useCallback((i) => {
    if (total === 0) return
    const currentA = angleRef.current
    const cycle = Math.floor(currentA / 360) * 360
    let target = cycle + i * DEG_PER_CARD
    while (target < currentA) target += 360
    targetRef.current = target
    setActiveHovered(false)
  }, [total])

  /* ---- Derive current index ---- */
  const currentIndex = total > 0
    ? (((Math.round(angleState / DEG_PER_CARD) % total) + total) % total)
    : 0

  if (!total) return null

  const activeAccent = data[currentIndex]?._theme?.accentColor || data[currentIndex]?.accent || '#888'

  /* ---- Build cards with positions ---- */
  const cards = data.map((profile, i) => {
    const cardAngle = -i * DEG_PER_CARD + angleState
    const pos = posOnRing(cardAngle)
    const theme = profile._theme
    const accent = theme.accentColor || profile.accent || '#888'
    const isActive = i === currentIndex
    return { i, profile, theme, accent, pos, isActive }
  })

  /* ---- Sort back-to-front ---- */
  const sorted = [...cards].sort((a, b) => a.pos.z - b.pos.z || a.i - b.i)

  /* ---- Field items — burst out from behind the active card ---- */
  const activePos = cards[currentIndex]?.pos
  const activeAngle = (((angleState - currentIndex * DEG_PER_CARD) % 360) + 540) % 360 - 180
  const POPUP_FADE = 40  // degrees of travel over which items fade in/out
  const rawStrength = activePos ? (POPUP_FADE - Math.abs(activeAngle)) / POPUP_FADE : 0
  const popupStrength = Math.max(0, Math.min(1, rawStrength))
  const rawFieldItems = data[currentIndex]?.fieldItems || []
  const spots = fieldPositions(currentIndex, rawFieldItems.length)
  const fieldItems = rawFieldItems
    .map((key, fi) => {
      const Icon = FIELD_ICONS[key]
      return Icon ? { key, Icon, pos: spots[fi] } : null
    })
    .filter(Boolean)

  return (
    <div
      className="shuffle-3d"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActiveHovered(false) }}
    >
      <div className="shuffle-3d__scene">
        {/* ambient backlight */}
        <div
          className="shuffle-3d__ambient"
          style={{
            background: 'radial-gradient(circle, ' + activeAccent + ' 0%, transparent 70%)',
          }}
        />

        {/* cards on the ring */}
        {sorted.map(({ i, profile, theme, accent, pos, isActive }) => {
          const classParts = ['shuffle-3d__card']
          if (isActive) classParts.push('shuffle-3d__card--active')
          if (!isActive && !pos.isBack) classParts.push('shuffle-3d__card--side')
          if (pos.isBack) classParts.push('shuffle-3d__card--back')
          if (theme.isLightBg) classParts.push('protofile--light')
          else classParts.push('protofile--dark')
          if (theme.fontClass) classParts.push(theme.fontClass)
          // Match the real profile card: wallpaper/gooey modifiers drive the
          // pattern-specific glass buttons (blur 3px) + pill/minimal socials.
          // Only the modifiers — the base .protofile__card width/radius would
          // fight the carousel card sizing.
          if (theme.hasWallpaper && !theme.isGooey) classParts.push('protofile__card--wallpaper')
          if (theme.isGooey) classParts.push('protofile__card--gooey')

          const t = 'translateX(-50%) translateX(' + pos.x + 'px) translateY(-50%) translateY(' + pos.y + 'px) translateZ(' + pos.z + 'px) scale(' + pos.scale + ') rotateY(' + pos.tilt + 'deg)'
          const hl = 'translateX(-50%) translateX(' + pos.x + 'px) translateY(-54%) translateY(' + pos.y + 'px) translateZ(' + (pos.z + 16) + 'px) scale(' + Math.min(pos.scale + 0.02, 1.03) + ') rotateY(' + pos.tilt + 'deg)'

          const cardVars = {
            ...theme.cssVars,
            ...(theme.isGooey ? { position: 'relative' } : {}),
          }

          return (
            <div
              key={'card-' + i}
              className={classParts.join(' ')}
              style={{
                transform: isActive && activeHovered ? hl : t,
                opacity: pos.opacity,
                // 'none' when sharp — a non-none filter on this card would become
                // the backdrop root and kill backdrop-filter on the glass buttons
                // inside (they'd stop being see-through). Side cards keep the DOF blur.
                filter: pos.blur > 0 ? 'blur(' + pos.blur + 'px)' : 'none',
                zIndex: Math.round(pos.z + RING_RADIUS + 100),
                pointerEvents: isActive ? 'auto' : 'none',
                '--card-accent': accent,
              }}
              onClick={() => !isActive && goTo(i)}
              onMouseEnter={() => canHover && isActive && setActiveHovered(true)}
              onMouseLeave={() => canHover && isActive && setActiveHovered(false)}
              role="button"
              tabIndex={isActive ? 0 : -1}
              aria-label={profile.name}
              aria-current={isActive ? 'true' : undefined}
            >
              <div className="shuffle-3d__card-inner" style={cardVars}>
                {theme.isGooey && (
                  <GooeyBackground accent={theme.accentColor} variant={theme.gooeyVariant} />
                )}
                <CardFace profile={profile} animateIn />
              </div>
            </div>
          )
        })}

        {/* field objects popping out from behind the active card */}
        {fieldItems.length > 0 && activePos && (
          <div className="shuffle-3d__field-layer">
            {fieldItems.map(({ key, Icon, pos }, fi) => {
              const rise = easeOutCubic(popupStrength)
              const riseY = HIDDEN_Y + (pos.dy - HIDDEN_Y) * rise
              const scale = 0.3 + 0.7 * rise
              return (
                <span
                  key={'field-' + key}
                  className="shuffle-3d__field-item"
                  style={{
                    transform:
                      'translateX(-50%) translateX(' + activePos.x + 'px) translateY(-50%) translateY(' + activePos.y + 'px)' +
                      ' translate(' + pos.dx + 'px,' + riseY + 'px)' +
                      ' scale(' + scale + ')' +
                      ' rotate(' + pos.rot * rise + 'deg)',
                    opacity: Math.min(1, popupStrength * 1.5),
                    // Below the active card (which is +100) so icons emerge from behind it
                    zIndex: Math.round(activePos.z + RING_RADIUS + 88),
                    '--field-accent': activeAccent,
                  }}
                >
                  <span
                    className="shuffle-3d__field-bob"
                    style={{
                      animationDelay: (fi * 0.65) + 's',
                      animationDuration: (2.8 + (fi % 3) * 0.4) + 's',
                    }}
                  >
                    <Icon size={26} />
                  </span>
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* dot nav */}
      <div className="shuffle-3d__dots">
        {data.map((p, i) => {
          const accent = p._theme.accentColor || p.accent || '#888'
          return (
            <button
              key={'dot-' + i}
              className={'shuffle-3d__dot' + (i === currentIndex ? ' shuffle-3d__dot--active' : '')}
              onClick={() => goTo(i)}
              aria-label={'View ' + p.name + "'s profile"}
              title={p.name}
              style={i === currentIndex ? { background: accent, '--dot-color': accent } : { '--dot-color': accent }}
            />
          )
        })}
      </div>
    </div>
  )
}
