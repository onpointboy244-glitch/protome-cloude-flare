import { useState } from "react";
import {
  detectPlatformKey,
  detectIcon,
  GENERIC_ICON,
  isLightColor,
  isSocialLink,
  gradientIsDark,
} from "../../lib/icons.jsx";
import ShareButton from "./ShareButton";
import LinkItem from "./LinkItem";
import ReportModal from "./ReportModal";
import SharePopup from "./SharePopup";
import "./SharedProtofile.css";

export default function SharedProtofile({ data }) {
  const d = {
    ...data,
    bgColor: data.bg_color || data.bgColor || "",
    bgGradient: data.bg_gradient || data.bgGradient || "",
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
    font,
    detect_icons,
  } = d;
  const accentColor = accent || "var(--color-primary-l)";
  // Only check raw hex accent — skip the CSS variable fallback
  const isAccentLight = accent ? isLightColor(accent) : false;
  const accentHoverText = isAccentLight ? "#000" : "#fff";
  const isSans = font === "sans";
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
  const isDarkBg = bgGradient
    ? gradientIsDark(bgGradient)
    : !isLightColor(bgColor);
  const isLightBg = isLightColor(bgColor);

  return (
    <div
      className={`protofile ${isSans ? "protofile--sans" : ""} ${bgGradient ? "protofile--gradient" : ""} ${isLightBg ? "protofile--light" : ""} ${isDarkBg ? "protofile--dark" : ""}`}
      style={{
        "--accent": accentColor,
        "--accent-hover-text": accentHoverText,
        "--bg-color": bgColor || "var(--color-bg)",
        ...(bgGradient ? { "--bg-gradient": bgGradient } : {}),
      }}
    >
      <div className="protofile__card">
        <div
          className="protofile__accent-bar"
          style={{ background: accentColor }}
        />
        <main className="protofile__main">
          {/* Share — top left */}
          <div className="protofile__share-wrapper">
            <ShareButton accentColor={accentColor} isLightBg={isLightBg} onShare={() => setShareOpen(true)} />
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
            <div className="protofile__socials">
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
            style={{ "--accent-color": accentColor }}
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
