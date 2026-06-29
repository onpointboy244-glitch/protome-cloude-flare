/**
 * Cloudflare Pages Function — replaces the Express server.
 *
 * Serves as a catch-all for routes that don't match a static asset:
 *   /api/report  →  POST handler for profile reporting
 *   /:username   →  injects OG meta tags + __INITIAL_PROFILE__ JSON
 *   /*           →  returns index.html (SPA fallback)
 *
 * Uses raw fetch to Supabase REST API instead of @supabase/supabase-js
 * (which has Node.js dependencies that crash Cloudflare Workers).
 */
export async function onRequest(context) {
  try {
    const { request, env } = context
    const url = new URL(request.url)
    const path = url.pathname.replace(/\/$/, '') || '/'

    // ── Serve static assets directly from the CDN ──────────────
    const isStaticAsset =
      path.startsWith('/assets/') ||
      path === '/favicon.svg' ||
      /\.(js|css|svg|png|jpg|jpeg|gif|ico|woff2?|ttf|eot|webp|avif)$/i.test(path)
    if (isStaticAsset) {
      return env.ASSETS.fetch(request)
    }

    // ── CORS headers ───────────────────────────────────────────
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // ── Helper: Supabase REST client (no SDK needed) ──────────
    function supabaseUrl(path) {
      return `${env.SUPABASE_URL}/rest/v1/${path}`
    }

    function supabaseHeaders() {
      return {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      }
    }

    // ── GET index.html from Pages assets ──────────────────────
    async function getIndexHtml() {
      const assetUrl = new URL(url)
      assetUrl.pathname = '/index.html'
      const resp = await env.ASSETS.fetch(assetUrl)
      return resp.text()
    }

    // ── API: Report ──────────────────────────────────────────
    if (path === '/api/report') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const body = await request.json()
      const { username, reason, details } = body
      if (!username || !reason) {
        return new Response(JSON.stringify({ error: 'Username and reason are required.' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const ip = request.headers.get('CF-Connecting-IP') || 'unknown'

      try {
        // Check if this IP already reported this profile
        const checkUrl = supabaseUrl(`reported_profiles?username=eq.${encodeURIComponent(username.toLowerCase())}&ip_address=eq.${encodeURIComponent(ip)}&select=id`)
        const checkRes = await fetch(checkUrl, { headers: supabaseHeaders() })
        const existing = await checkRes.json()

        if (existing && existing.length > 0) {
          return new Response(JSON.stringify({ error: 'You have already reported this profile.' }), {
            status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        // Insert the report
        const insertRes = await fetch(supabaseUrl('reported_profiles'), {
          method: 'POST',
          headers: supabaseHeaders(),
          body: JSON.stringify({
            username: username.toLowerCase(),
            ip_address: ip,
            reason,
            details: details || null,
            created_at: new Date().toISOString(),
          }),
        })

        if (!insertRes.ok) {
          if (insertRes.status === 409) {
            return new Response(JSON.stringify({ error: 'You have already reported this profile.' }), {
              status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
          }
          throw new Error(`Supabase error: ${insertRes.status}`)
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message || 'Something went wrong.' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // ── SPA: load index.html ─────────────────────────────────
    let html = await getIndexHtml()

    // ── Known static pages ───────────────────────────────────
    const staticPages = ['', '/', '/privacy', '/terms', '/about', '/blog', '/contact']
    if (staticPages.includes(path)) {
      return new Response(html, {
        headers: { 'content-type': 'text/html', 'cache-control': 'public, max-age=300' },
      })
    }

    // ── Profile page: inject OG meta tags ────────────────────
    const username = path.slice(1)
    if (!username) {
      return new Response(html, {
        headers: { 'content-type': 'text/html', 'cache-control': 'public, max-age=300' },
      })
    }

    // Fetch profile via Supabase REST API
    let name = username
    let description = `Check out ${username}'s protome profile.`
    let image = null
    let accent = '#c45a3c'
    let profileData = null

    try {
      const profileUrl = supabaseUrl(`profiles?username=eq.${encodeURIComponent(username.toLowerCase())}&select=*`)
      const profileRes = await fetch(profileUrl, { headers: supabaseHeaders() })
      const profiles = await profileRes.json()

      if (profiles && profiles.length > 0) {
        const data = profiles[0]
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
    ].filter(Boolean).join('\n    ')

    html = html
      .replace(/<title>.*?<\/title>/, '')
      .replace('</head>', `    ${metaTags}\n    ${profileHTML}\n  </head>`)

    return new Response(html, {
      headers: { 'content-type': 'text/html', 'cache-control': 'public, max-age=300' },
    })

  } catch (err) {
    // Global catch — prevent Error 1101, return the SPA as fallback
    return new Response('Internal error', {
      status: 500,
      headers: { 'content-type': 'text/plain' },
    })
  }
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
