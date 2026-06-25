/* global process */
/**
 * Vercel Edge Function — OG meta tag injection for profile pages.
 *
 * Edge runtime = near-zero cold start, so profile pages load instantly
 * even on Vercel free tier. Real users get their SPA immediately;
 * social crawlers get rich meta tags.
 *
 * How it works:
 *   1. Someone visits protome.vercel.app/jordan
 *   2. Vercel rewrites to /api/og?username=jordan
 *   3. This function fetches the pre-built index.html (static)
 *   4. Queries Supabase for profile data (only for valid usernames)
 *   5. Injects OG / Twitter meta tags into the HTML
 *   6. Returns the modified HTML
 */

const BOT_UA = [
  'twitterbot', 'facebookexternalhit', 'slack', 'discord',
  'googlebot', 'bingbot', 'whatsapp', 'telegram',
  'linkedinbot', 'pinterest', 'embly', 'slack-imgproxy',
  'slack-image-proxy',
];

function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_UA.some(bot => ua.includes(bot));
}

function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, " ");
}

export default async function handler(request) {
  const url = new URL(request.url);
  const username = url.searchParams.get("username");

  // ── Fetch pre-built index.html from the deployment ──
  const indexUrl = new URL("/index.html", request.url);
  let html;
  try {
    const res = await fetch(indexUrl.toString());
    if (!res.ok) {
      return new Response("Not found", { status: 404 });
    }
    html = await res.text();
  } catch {
    return new Response("Not found", { status: 404 });
  }

  // ── Non-profile requests — just serve the SPA ──
  if (!username || username.includes(".") || username === "favicon.svg" || username === "keepwarm") {
    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  }

  // ── Bot check — only inject meta tags for crawlers ──
  const userAgent = request.headers.get("user-agent") || "";

  let name = username;
  let description = `Check out ${username}'s protome profile.`;
  let image = null;
  let accent = "#c45a3c";

  // Skip Supabase query for real users — saves cold-start time
  if (isBot(userAgent)) {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        const res = await fetch(
          `${supabaseUrl}/rest/v1/profiles?select=name,bio,photo_url,accent&username=eq.${encodeURIComponent(username.toLowerCase())}`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              "Accept": "application/json",
            },
          },
        );
        if (res.ok) {
          const profiles = await res.json();
          const data = profiles?.[0];
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
        }
      } catch {
        // Supabase unavailable — serve SPA without OG tags
      }
    }
  }

  const safeName = esc(name);
  const safeDesc = esc(description);
  const safeImage = image ? esc(image) : null;
  const safeAccent = esc(accent);
  const siteUrl = esc(
    `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("host") || "protome.vercel.app"}/${username}`,
  );

  const metaTags = [
    `<title>${safeName} — protome</title>`,
    `<meta name="description" content="${safeDesc}" />`,
    `<meta name="theme-color" content="${safeAccent}" />`,
    `<meta property="og:title" content="${safeName} — protome" />`,
    `<meta property="og:description" content="${safeDesc}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:url" content="${siteUrl}" />`,
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

  const modified = html
    .replace(/<title>.*?<\/title>/, "")
    .replace("</head>", `    ${metaTags}\n  </head>`);

  return new Response(modified, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

export const config = {
  runtime: "edge",
};
