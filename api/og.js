// @ts-check

/**
 * Vercel Edge Function — OG meta tag injection for profile pages.
 *
 * Edge Functions run on V8 isolates at the edge, so cold starts are ~50ms
 * instead of 1-4s for Node.js serverless functions.
 *
 * This replaces the Express `/:username` route from server/index.js
 * for the Vercel deployment.
 *
 * How it works:
 *   1. Someone visits protome.vercel.app/jordan
 *   2. Vercel rewrites the request to /api/og?username=jordan
 *   3. This function fetches the profile from Supabase REST API
 *   4. Injects OG / Twitter meta tags into index.html
 *   5. Returns the modified HTML — social crawlers get rich previews
 *
 * The index.html is baked in at build time (scripts/build-html.js)
 * so there's no fs access needed at runtime.
 */

import { HTML } from "./_html.js";

export const config = {
  runtime: "edge",
};

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

// --- Handler ---

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export default async function handler(request) {
  const url = new URL(request.url);
  const username = url.searchParams.get("username");

  // --- Skip non-profile requests -> serve SPA as-is ---
  if (!username || username.includes(".") || username === "favicon.svg") {
    return new Response(HTML, {
      status: 200,
      headers: {
        "content-type": "text/html",
        "cache-control": "public, s-maxage=86400",
      },
    });
  }

  // --- Default OG values (used if Supabase is unreachable) ---
  let name = username;
  let description = `Check out ${username}'s protome profile.`;
  let image = null;
  let accent = "#c45a3c";
  /** @type {Record<string,unknown>|null} */
  let profileData = null;

  // --- Fetch profile from Supabase REST API (no SDK needed — works on Edge) ---
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const endpoint =
        `${supabaseUrl}/rest/v1/profiles` +
        `?username=eq.${encodeURIComponent(username.toLowerCase())}` +
        `&select=*`;

      const res = await fetch(endpoint, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (res.ok) {
        const rows = /** @type {Array<Record<string,unknown>>} */ (
          await res.json()
        );
        const data = rows[0];
        if (data) {
          profileData = data;
          name = /** @type {string} */ (data.name) || username;
          description = data.bio
            ? /** @type {string} */ (data.bio).length > 200
              ? /** @type {string} */ (data.bio).slice(0, 200) + "…"
              : /** @type {string} */ (data.bio)
            : `Check out ${name}'s protome profile.`;
          image = /** @type {string|undefined} */ (data.photo_url) || null;
          accent = /** @type {string} */ (data.accent) || "#c45a3c";
        }
      }
    } catch {
      /* supabase unavailable — use defaults */
    }
  }

  // --- Build meta tags ---

  const safeName = esc(name);
  const safeDesc = esc(description);
  const safeImage = image ? esc(image) : null;
  const pageUrl = esc(`${url.protocol}//${url.host}/${username}`);
  const safeAccent = esc(accent);

  const metaTags = [
    `<title>${safeName} — protome</title>`,
    `<meta name="description" content="${safeDesc}" />`,
    `<meta name="theme-color" content="${safeAccent}" />`,
    `<meta property="og:title" content="${safeName} — protome" />`,
    `<meta property="og:description" content="${safeDesc}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:url" content="${pageUrl}" />`,
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

  // Inject profile data as JSON so the React app skips the fetch entirely
  // Uses type="application/json" + unicode-escaping to prevent </script> injection
  const profileJSON = profileData
    ? JSON.stringify(profileData).replace(/<\//g, "\\u003C/")
    : "null";
  const lt = "<";
  const profileScript =
    lt + `script id="__INITIAL_PROFILE__" type="application/json">${profileJSON}` + lt + "/script>";

  // --- Inject into SPA HTML ---
  const html = HTML
    .replace(/<title>.*?<\/title>/, "")
    .replace(
      "</head>",
      `    ${metaTags}\n    ${profileScript}\n  </head>`,
    );

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html",
      "cache-control": "public, s-maxage=60, stale-while-revalidate=86400",
    },
  });
}

