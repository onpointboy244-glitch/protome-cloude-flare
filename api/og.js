/* global process */
/**
 * Vercel serverless function — OG meta tag injection for profile pages.
 *
 * Optimised for fast cold starts:
 *   - `@supabase/supabase-js` is only loaded lazily when a profile is
 *     actually looked up (most requests are static / warm-up pings).
 *   - `index.html` is read once and cached across warm invocations.
 *
 * How it works:
 *   1. Someone visits protome.vercel.app/jordan
 *   2. Vercel rewrites the request to /api/og?username=jordan
 *   3. This function fetches the profile from Supabase
 *   4. Injects OG / Twitter meta tags into index.html
 *   5. Returns the modified HTML — social crawlers get rich previews
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// --- Lazy singletons for cold-start speed ---
// Supabase client is NOT loaded at module-init. We import it on demand
// so that static requests (root, assets, warm-up pings) never pay that cost.

let cachedHtml = null;
let supabaseClient = null;

async function getSupabase() {
  if (supabaseClient) return supabaseClient;
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const { createClient } = await import("@supabase/supabase-js");
  supabaseClient = createClient(url, key);
  return supabaseClient;
}

function getIndexHtml() {
  if (cachedHtml) return cachedHtml;
  const distPath = join(root, "dist");
  if (existsSync(distPath)) {
    cachedHtml = readFileSync(join(distPath, "index.html"), "utf-8");
  } else {
    cachedHtml = null;
  }
  return cachedHtml;
}

// --- Handler ---

export default async function handler(req, res) {
  const username = req.query.username;

  // — Static / non-profile requests — return HTML immediately, no Supabase needed
  if (!username || username.includes(".") || username === "favicon.svg" || username === "keepwarm") {
    const html = getIndexHtml();
    if (html) {
      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(html);
    }
    return res.status(200).json({ message: "protome API" });
  }

  let name = username;
  let description = `Check out ${username}'s protome profile.`;
  let image = null;
  let accent = "#c45a3c";

  // — Profile lookup — lazily load Supabase only now
  const supabase = await getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("name, bio, photo_url, accent")
        .eq("username", username.toLowerCase())
        .maybeSingle();

      if (data) {
        name = data.name || username;
        description = data.bio
          ? data.bio.length > 200
            ? data.bio.slice(0, 200) + "…"
            : data.bio
          : `Check out ${name}'s protome profile.`;
        image = data.photo_url || null;
        accent = data.accent || "#c45a3c";
      }
    } catch { /* supabase unavailable */ }
  }

  const safeName = esc(name);
  const safeDesc = esc(description);
  const safeImage = image ? esc(image) : null;
  const url = esc(
    `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host || "protome.vercel.app"}/${username}`,
  );
  const safeAccent = esc(accent);

  const metaTags = [
    `<title>${safeName} — protome</title>`,
    `<meta name="description" content="${safeDesc}" />`,
    `<meta name="theme-color" content="${safeAccent}" />`,
    `<meta property="og:title" content="${safeName} — protome" />`,
    `<meta property="og:description" content="${safeDesc}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:url" content="${url}" />`,
    safeImage ? `<meta property="og:image" content="${safeImage}" />` : "",
    `<meta property="og:image:width" content="400" />`,
    `<meta property="og:image:height" content="400" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${safeName} — protome" />`,
    `<meta name="twitter:description" content="${safeDesc}" />`,
    safeImage ? `<meta name="twitter:image" content="${safeImage}" />` : "",
  ]
    .filter(Boolean)
    .join("\n    ");

  const html = (getIndexHtml() ?? "")
    .replace(/<title>.*?<\/title>/, "")
    .replace("</head>", `    ${metaTags}\n  </head>`);

  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(html);
}

// --- Helpers ---

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, " ");
}
