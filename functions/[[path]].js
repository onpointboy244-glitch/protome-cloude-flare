import { createClient } from '@supabase/supabase-js'

/**
 * Cloudflare Pages Function — replaces the Express server.
 *
 * Serves as a catch-all for routes that don't match a static asset:
 *   /api/report  →  POST handler for profile reporting
 *   /:username   →  injects OG meta tags + __INITIAL_PROFILE__ JSON
 *   /*           →  returns index.html (SPA fallback)
 *
 * Static files (JS, CSS, images) are served directly by Cloudflare CDN
 * at the edge — this function never runs for them.
 */
export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const path = url.pathname.replace(/\/$/, '') || '/'

  // ── CORS headers for all responses ─────────────────────────
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // ── GET the base index.html from Pages static assets ───────
  async function getIndexHtml() {
    const assetUrl = new URL(url)
    assetUrl.pathname = '/index.html'
    const resp = await env.ASSETS.fetch(assetUrl)
    return resp.text()
  }

  // ── API: Report ──────────────────────────────────────────
  if (path === '/api/report') {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)
    const body = await request.json()
    const { username, reason, details } = body

    if (!username || !reason) {
      return new Response(
        JSON.stringify({ error: 'Username and reason are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'

    try {
      const { data: existing } = await supabase
        .from('reported_profiles')
        .select('id')
        .eq('username', username.toLowerCase())
        .eq('ip_address', ip)
        .maybeSingle()

      if (existing) {
        return new Response(
          JSON.stringify({ error: 'You have already reported this profile.' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
      }

      const { error } = await supabase.from('reported_profiles').insert({
        username: username.toLowerCase(),
        ip_address: ip,
        reason,
        details: details || null,
        created_at: new Date().toISOString(),
      })

      if (error) {
        if (error.code === '23505') {
          return new Response(
            JSON.stringify({ error: 'You have already reported this profile.' }),
            { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
          )
        }
        throw error
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message || 'Something went wrong.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }
  }

  // ── SPA: load index.html ─────────────────────────────────
  let html = await getIndexHtml()

  // ── Known static-page routes → serve as-is ──────────────
  const staticPages = ['', '/', '/privacy', '/terms', '/about', '/blog', '/contact']
  if (staticPages.includes(path)) {
    return new Response(html, {
      headers: { 'content-type': 'text/html', 'cache-control': 'public, max-age=300' },
    })
  }

  // ── Profile page: inject OG meta tags ────────────────────
  const username = path.slice(1)

  if (!username || username.includes('.') || username === 'favicon.svg') {
    return new Response(html, {
      headers: { 'content-type': 'text/html', 'cache-control': 'public, max-age=300' },
    })
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY)

  let name = username
  let description = `Check out ${username}'s protome profile.`
  let image = null
  let accent = '#c45a3c'
  let profileData = null

  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase())
      .maybeSingle()

    if (data) {
      profileData = data
      name = data.name || username
      description = data.bio
        ? data.bio.length > 200
          ? data.bio.slice(0, 200) + '…'
          : data.bio
        : `Check out ${name}'s protome profile.`
      image = data.photo_url || null
      accent = data.accent || '#c45a3c'
    }
  } catch {
    // Supabase unavailable — serve without OG tags
  }

  const safeName = esc(name)
  const safeDesc = esc(description)
  const safeImage = image ? esc(image) : null
  const siteUrl = esc(url.origin + '/' + username)
  const safeAccent = esc(accent)

  const profileJSON = profileData
    ? JSON.stringify(profileData).replace(/<\//g, '\\u003C/')
    : 'null'
  const profileHTML =
    '<script id="__INITIAL_PROFILE__" type="application/json">' + profileJSON + '</script>'

  const metaTags = [
    `<title>${safeName} — protome</title>`,
    `<meta name="description" content="${safeDesc}" />`,
    `<meta name="theme-color" content="${safeAccent}" />`,
    `<meta property="og:title" content="${safeName} — protome" />`,
    `<meta property="og:description" content="${safeDesc}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:url" content="${siteUrl}" />`,
    safeImage ? `<meta property="og:image" content="${safeImage}" />` : '',
    `<meta property="og:image:width" content="400" />`,
    `<meta property="og:image:height" content="400" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${safeName} — protome" />`,
    `<meta name="twitter:description" content="${safeDesc}" />`,
    safeImage ? `<meta name="twitter:image" content="${safeImage}" />` : '',
  ]
    .filter(Boolean)
    .join('\n    ')

  html = html
    .replace(/<title>.*?<\/title>/, '')
    .replace('</head>', `    ${metaTags}\n    ${profileHTML}\n  </head>`)

  return new Response(html, {
    headers: { 'content-type': 'text/html', 'cache-control': 'public, max-age=300' },
  })
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, ' ')
}
