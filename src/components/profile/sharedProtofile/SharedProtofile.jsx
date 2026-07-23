import { useState } from "react";
import {
  detectPlatformKey,
  detectIcon,
  GENERIC_ICON,
  isLightColor,
  isSocialLink,
  gradientIsDark,
} from "../../../lib/icons.jsx";
import ShareButton from "./ShareButton";
import LinkItem from "./LinkItem";
import ReportModal from "./ReportModal";
import SharePopup from "./SharePopup";
import GooeyBackground from "../GooeyBackground";
import "./SharedProtofile.css";

export default function SharedProtofile({ data }) {
  const d = {
    ...data,
    bgColor: data.bg_color || data.bgColor || "",
    bgGradient: data.bg_gradient || data.bgGradient || "",
    bgType: data.bg_type || "none",
    bgSize: data.bg_size || "cover",
    bgPos: data.bg_pos || "0 0",
    buttonStyle: data.button_style || 'solid',
    buttonCorner: data.button_corner || 'rounded',
    buttonColor: data.button_color || '',
    buttonTextColor: data.button_text_color || '',
    socialStyle: data.social_style || 'default',
  };
  const {
    name,
    role,
    bio,
    photo,
    photo_url,
    links,
    accent,
    bgColor,
    bgGradient,
    bgType,
    bgSize,
    bgPos,
    font,
    buttonStyle,
    buttonCorner,
    buttonColor,
    buttonTextColor,
    socialStyle,
    detect_icons,
  } = d;
  const accentColor = accent || "var(--color-primary-l)";
  // Only check raw hex accent — skip the CSS variable fallback
  const isAccentLight = accent ? isLightColor(accent) : false;
  const fontClass = font && font !== 'serif' ? `protofile--${font}` : '';
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [shareLabel, setShareLabel] = useState(null);
  const linkItems = Array.isArray(links) ? links : [];
  const socialLinks = linkItems.filter(
    (l) => !l.isSection && isSocialLink(l.label, l.url, l.type),
  );
  const otherLinks = linkItems.filter(
    (l) => !isSocialLink(l.label, l.url, l.type),
  );
  const photoSrc = photo_url || photo;
  const hasPhoto = !!photoSrc;
  // Backward compat: if bgGradient is set but bgType is 'none' (no db column yet), treat as gradient
  const isGooey = bgGradient?.startsWith?.("__gooey__");
  const isAccentOverlay = bgGradient?.includes?.("color-mix");
  const gooeyVariant = isGooey
    ? bgGradient === "__gooey__" ? "groovy1" : (bgGradient.split("__").filter(Boolean)[1] || "groovy1")
    : undefined;
  const wallpaperType = bgType === "none" && bgGradient && !isGooey ? "gradient" : bgType;
  const isPattern = wallpaperType === "pattern" && !isGooey;
  const hasWallpaper = wallpaperType !== "none" && bgGradient && !isGooey;
  // Semi-transparent overlays use bgColor for contrast, not gradientIsDark
  const isOverlay = bgGradient && (bgGradient.includes("rgba") || bgGradient.includes("transparent"));
  const isDarkBg = hasWallpaper && !isOverlay
    ? gradientIsDark(bgGradient)
    : !isLightColor(bgColor);
  const isLightBg = isLightColor(bgColor);
  // Normalize hex to 6-char for comparison
  function hexNormalize(c) { return c.length === 4 ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c; }
  // Rough luminance (0–255) for brightness checking
  function luminance(c) {
    const h = hexNormalize(c).replace('#', '');
    const r = parseInt(h.slice(0,2), 16);
    const g = parseInt(h.slice(2,4), 16);
    const b = parseInt(h.slice(4,6), 16);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }
  // Check if two colors share the same hue family by comparing RGB proportions
  // (avoids treating red-on-blue as "invisible" even when luminance is similar)
  function sameColorFamily(c1, c2) {
    const h1 = hexNormalize(c1).replace('#', ''), h2 = hexNormalize(c2).replace('#', '');
    const t1 = parseInt(h1.slice(0,2), 16) + parseInt(h1.slice(2,4), 16) + parseInt(h1.slice(4,6), 16);
    const t2 = parseInt(h2.slice(0,2), 16) + parseInt(h2.slice(2,4), 16) + parseInt(h2.slice(4,6), 16);
    if (!t1 || !t2) return false;
    const rd = Math.abs(parseInt(h1.slice(0,2),16)/t1 - parseInt(h2.slice(0,2),16)/t2);
    const gd = Math.abs(parseInt(h1.slice(2,4),16)/t1 - parseInt(h2.slice(2,4),16)/t2);
    const bd = Math.abs(parseInt(h1.slice(4,6),16)/t1 - parseInt(h2.slice(4,6),16)/t2);
    return Math.max(rd, gd, bd) < 0.12;
  }
  // Treat accent as invisible when it's the same as bg — or close in both hue and brightness
  // (red on black is fine — different families — but two dark blues look the same)
  const accentSame = accent && bgColor &&
    bgColor.startsWith('#') && accent.startsWith('#') &&
    hexNormalize(accent).toLowerCase() === hexNormalize(bgColor).toLowerCase();
  const lumaDiff = accent && bgColor && bgColor.startsWith('#') && accent.startsWith('#')
    ? Math.abs(luminance(accent) - luminance(bgColor))
    : null;
  const accentInvisible = accentSame || (
    lumaDiff !== null && lumaDiff < 60 &&
    bgColor.startsWith('#') && accent.startsWith('#') &&
    sameColorFamily(accent, bgColor)
  );
  const visibleAccent = accentInvisible ? (isLightBg ? "#000" : "#fff") : accentColor;
  // When accent and bg are identical, hover text must oppose the neutral visibleAccent
  const accentHoverText = accentInvisible
    ? (visibleAccent === "#000" ? "#fff" : "#000")
    : (isAccentLight ? "#000" : "#fff");

  return (
    <div
      className={`protofile ${fontClass} ${isLightBg ? "protofile--light" : ""} ${isDarkBg ? "protofile--dark" : ""}`}
      style={{
        "--accent": accentInvisible ? visibleAccent : accentColor,
        "--accent-hover-text": accentHoverText,
        "--bg-color": bgColor || "var(--color-bg)",
        "--card-text": isDarkBg ? "#fff" : "#111",
        "--card-tether-bg": "oklch(0.965 0.005 35)",
        "--card-tether-color": "#333",
      }}
    >
      <div
        className={`protofile__card ${hasWallpaper && !isGooey ? "protofile__card--wallpaper" : ""} ${isGooey ? "protofile__card--gooey" : ""}`}
        style={{
          ...(!isGooey && hasWallpaper ? { "--bg-gradient": bgGradient.replace(/ACCENTCLR/g, encodeURIComponent(accent || '#C5A059')) } : {}),
          "--bg-size": isPattern ? bgSize : "cover",
          "--bg-repeat": isPattern ? "repeat" : "no-repeat",
          "--bg-pos": isPattern ? bgPos : "0 0",
        }}
      >
        <div
          className="protofile__accent-bar"
          style={{ background: accentColor }}
        />
        {isGooey && <GooeyBackground accent={visibleAccent} variant={gooeyVariant} />}
        <main className={`protofile__main${isGooey ? ' protofile__main--gooey' : ''}${isAccentOverlay ? ' protofile__main--accent-overlay' : ''}`}>
          {/* Share — top left */}
          <div className="protofile__share-wrapper">
            <ShareButton accentColor={visibleAccent} isLightBg={isLightBg} onShare={() => setShareOpen(true)} />
          </div>

          {/* Photo / Avatar */}
          {hasPhoto ? (
            <div className="protofile__photo-wrapper">
              <img
                src={photoSrc}
                alt={name || ""}
                className="protofile__photo"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="protofile__avatar" style={{ color: accentColor }}>
              {initials}
            </div>
          )}

          {/* Name */}
          {name && <h1 className="protofile__name">{name}</h1>}

          {/* Role */}
          {role && <p className="protofile__role">{role}</p>}

          {/* Bio */}
          {bio && <p className="protofile__bio">{bio}</p>}

          {/* Social icon row */}
          {socialLinks.length > 0 && (
            <div className={`protofile__socials${socialStyle !== 'default' ? ` protofile__socials--${socialStyle}` : ''}`}>
              {socialLinks.map((link, i) => {
                const icon = detectIcon(link.label, link.url) || GENERIC_ICON;
                const href = link.url.startsWith("http")
                  ? link.url
                  : `https://${link.url}`;
                return (
                  <a
                    key={`social-${link.id || i}`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="protofile__social-btn"
                    title={link.label}
                    aria-label={link.label}
                    data-platform={detectPlatformKey(link.label, link.url)}
                  >
                    {icon}
                  </a>
                );
              })}
            </div>
          )}

          {/* Non-social links: sections + buttons */}
          <div className="protofile__links">
            {otherLinks.map((item, i) =>
              item.isSection ? (
                <div
                  key={`sect-${item.id || i}`}
                  className="protofile__section-heading"
                >
                  {item.label}
                </div>
              ) : (
                <LinkItem
                  key={`link-${item.id || i}`}
                  item={item}
                  buttonStyle={buttonStyle}
                  buttonCorner={buttonCorner}
                  buttonColor={buttonColor}
                  buttonTextColor={buttonTextColor}
                  showIcon={detect_icons !== false}
                  onShareLink={() => {
                    const href = item.url.startsWith("http") ? item.url : `https://${item.url}`;
                    setShareUrl(href);
                    setShareLabel(item.label);
                    setShareOpen(true);
                  }}
                />
              ),
            )}
          </div>

          {/* Footer */}
          <div
            className="protofile__footer"
            style={{ "--accent-color": visibleAccent }}
          >
            {/* Brand centered at top */}
            <div className="protofile__footer-brand-wrap">
              <a href="/" className="protofile__brand">
                <span className="protofile__brand-top">
                  <span className="protofile__brand-mark">
                    <span className="protofile__brand-diamond" />
                    <span className="protofile__brand-line" />
                  </span>
                  <span className="protofile__brand-text">
                    pro<span className="protofile__brand-middle">t</span>ome
                  </span>
                </span>
                <span className="protofile__claim">CLAIM YOURS NOW</span>
              </a>
            </div>

            {/* Privacy, Terms, Report — grouped together under the brand */}
            <div className="protofile__footer-links">
              <a href="/privacy" className="protofile__footer-link">
                Privacy & Policy
              </a>
              <span className="protofile__footer-dot" aria-hidden="true">
                ·
              </span>
              <a href="/terms" className="protofile__footer-link">
                Terms
              </a>
              <span className="protofile__footer-dot" aria-hidden="true">
                ·
              </span>
              <button
                onClick={() => setReportOpen(true)}
                className="protofile__footer-link protofile__footer-link--report"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M12 2a10 10 0 1 0 10 10h0A10 10 0 0 0 12 2z" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Report
              </button>
            </div>
          </div>
        </main>
      </div>
      {reportOpen && (
        <ReportModal
          username={data.username}
          onClose={() => setReportOpen(false)}
        />
      )}
      {shareOpen && (
        <SharePopup
          url={shareUrl}
          title={name}
          linkLabel={shareLabel}
          onClose={() => { setShareOpen(false); setShareUrl(null); setShareLabel(null); }}
        />
      )}
    </div>
  );
}
