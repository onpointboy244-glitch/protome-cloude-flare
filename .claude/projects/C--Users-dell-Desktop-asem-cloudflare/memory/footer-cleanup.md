---
name: footer-cleanup
description: Footer simplification — removed tree logo and arc animation, simplified layout
metadata:
  type: project
  date: 2026-07-05
---

# Footer cleanup (July 5, 2026)

Removed the animated tree SVG and traveling-dot arc from the SharedProtofile footer. The tree + arc animation was iterated many times (curved arc → traveling dot via stroke-dasharray → traveling dot via `<circle>` cx animation) but ultimately scrapped.

**Current footer layout:**
- **Top**: "protome" brand centered (diamond ◆ + brand-line + "protome" text in uppercase Outfit)
- **Bottom row** (pushed to card bottom via `margin-top: auto` on `.protofile__footer-row`):
  - Left: "Privacy & Policy" + "Terms" links
  - Right: "Report" button (red on hover, click opens ReportModal)

**Files changed:**
- `src/components/sharedProtofile/SharedProtofile.jsx` — removed tree SVG, arc SVG, hover-group, hover-area. Simplified to `protofile__footer-brand-wrap` + `protofile__footer-row`
- `src/components/sharedProtofile/Footer.css` — stripped all tree/arc/hover-group CSS. Footer is now `flex: 1; flex-direction: column`. Brand wrap centers at top. Footer row uses `space-between` + `margin-top: auto`.
- `src/components/sharedProtofile/Layout.css` — changed `.protofile__main` bottom padding from `var(--space-2xl)` to `var(--space-sm)` so footer links sit flush to card bottom

**Why:** User got frustrated with the arc animation never looking right and decided to just keep the protome brand without any animation or tree companion.

**How to apply:** No further action needed — the cleanup is complete. If a future version wants an animated element between brand elements, start fresh rather than reviving the old approaches.
