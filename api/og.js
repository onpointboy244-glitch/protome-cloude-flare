/* global process */
/**
 * Vercel serverless function — OG meta tag injection for profile pages.
 *
 * This replaces the Express `/:username` route from server/index.js
 * so the app can run fully on Vercel's free tier.
 *
 * How it works:
 *   1. Someone visits protome.vercel.app/jordan
 *   2. Vercel rewrites the request to /api/og?username=jordan
 *   3. This function fetches the profile from Supabase
 *   4. Injects OG / Twitter meta tags into index.html
 *   5. Returns the modified HTML — social crawlers get rich previews
 *
 * To enable it, uncomment the `rewrites` section in vercel.json
 * (and comment it out if you switch back to the Express server).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// --- Init Supabase ---

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// --- Cache the built index.html ---

const distPath = join(root, "dist");
let cachedHtml = null;

function getIndexHtml() {
  if (!cachedHtml) {
    cachedHtml = readFileSync(join(distPath, "index.html"), "utf-8");
  }
  return cachedHtml;
}

// --- Handler ---

export default async function handler(req, res) {
  const username = req.query.username;

  // Skip if not a profile request
  if (!username || username.includes(".") || username === "favicon.svg") {
    if (existsSync(distPath)) {
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Cache-Control", "public, s-maxage=86400");
      return res.status(200).send(getIndexHtml());
    }
    return res.status(200).json({ message: "protome API" });
  }

  let name = username;
  let description = `Check out ${username}'s protome profile.`;
  let image = null;
  let accent = "#c45a3c";

  // Fetch profile data from Supabase
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

  let html;
  if (existsSync(distPath)) {
    html = getIndexHtml()
      .replace(/<title>.*?<\/title>/, "")
      .replace("</head>", `    ${metaTags}\n  </head>`);
  } else {
    html = `<!DOCTYPE html><html><head>${metaTags}</head><body><p>protome</p></body></html>`;
  }

  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=86400");
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
