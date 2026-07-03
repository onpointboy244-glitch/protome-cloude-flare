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
      path === '/robots.txt' ||
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

    // ── Dynamic Sitemap: includes all public profiles ──────────
    if (path === '/sitemap.xml') {
      const siteUrl = url.origin

      // Static pages
      const staticUrls = [
        { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'weekly' },
        { loc: `${siteUrl}/about`, priority: '0.7', changefreq: 'monthly' },
        { loc: `${siteUrl}/blog`, priority: '0.6', changefreq: 'weekly' },
        { loc: `${siteUrl}/contact`, priority: '0.6', changefreq: 'monthly' },
        { loc: `${siteUrl}/privacy`, priority: '0.5', changefreq: 'monthly' },
        { loc: `${siteUrl}/terms`, priority: '0.5', changefreq: 'monthly' },
      ]

      // Fetch all public profiles from Supabase
      let profileUrls = []
      try {
        const profilesUrl = supabaseUrl('profiles?select=username,updated_at&order=updated_at.desc')
        const res = await fetch(profilesUrl, { headers: supabaseHeaders() })
        const profiles = await res.json()
        if (Array.isArray(profiles)) {
          profileUrls = profiles.map(p => ({
            loc: `${siteUrl}/${encodeURIComponent(p.username)}`,
            lastmod: p.updated_at ? p.updated_at.split('T')[0] : undefined,
            priority: '0.5',
            changefreq: 'weekly',
          }))
        }
      } catch {
        // Supabase unavailable — serve sitemap with just static pages
      }

      const allUrls = [...staticUrls, ...profileUrls]

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
      for (const u of allUrls) {
        xml += '  <url>\n'
        xml += `    <loc>${esc(u.loc)}</loc>\n`
        if (u.lastmod) xml += `    <lastmod>${esc(u.lastmod)}</lastmod>\n`
        xml += `    <changefreq>${u.changefreq}</changefreq>\n`
        xml += `    <priority>${u.priority}</priority>\n`
        xml += '  </url>\n'
      }
      xml += '</urlset>'

      return new Response(xml, {
        headers: {
          'content-type': 'application/xml; charset=utf-8',
          'cache-control': 'public, max-age=3600',
        },
      })
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
      // Override canonical for sub-pages (index.html canonical points to /)
      if (path && path !== '/') {
        const pageUrl = esc(url.origin + path)
        html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${pageUrl}" />`)
      }
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

    // Profile pages should not be cached — content can change immediately after edit
    const profileCacheControl = 'private, no-cache, max-age=0'

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
    const profileScript =
      '<script id="__INITIAL_PROFILE__" type="application/json">' + profileJSON + '</script>'

    // Build visible profile HTML inside #root so Googlebot sees content on first paint
    const initials = safeName.split(' ').map(w => w.charAt(0)).join('').slice(0, 2).toUpperCase()
    const role = profileData?.role ? esc(profileData.role) : ''
    const bio = profileData?.bio ? esc(profileData.bio) : ''
    const links = profileData?.links
      ? profileData.links.filter(l => !l.isSection && l.url)
      : []
    const linkItems = links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" style="display:block;margin:8px 0;padding:14px 20px;border-radius:12px;background:rgba(255,255,255,0.09);color:#fff;text-decoration:none;text-align:center;font-family:system-ui;font-size:14px">${esc(l.label || l.url)}</a>`).join('\n        ')

    const visibleCard = profileData ? `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:40px 20px;font-family:system-ui;background:${safeAccent};background:linear-gradient(135deg,${safeAccent}33,#fff);box-sizing:border-box">
      <div style="width:100%;max-width:480px;background:rgba(255,255,255,0.06);border-radius:24px;padding:32px 24px;backdrop-filter:blur(12px);box-shadow:0 8px 40px rgba(0,0,0,0.08)">
        <div style="width:80px;height:80px;border-radius:50%;background:${safeAccent};display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:28px;font-weight:600;color:#fff">${initials}</div>
        <h1 style="text-align:center;font-size:24px;font-weight:600;color:#1a1a1a;margin:0 0 4px;letter-spacing:-0.01em">${safeName}</h1>
        ${role ? `<p style="text-align:center;font-size:14px;color:rgba(0,0,0,0.5);margin:0 0 24px">${role}</p>` : ''}
        ${bio ? `<p style="text-align:center;font-size:14px;color:rgba(0,0,0,0.6);line-height:1.6;margin:0 0 24px;max-width:400px">${bio}</p>` : ''}
        ${linkItems}
      </div>
      <p style="margin-top:32px;font-size:12px;color:rgba(0,0,0,0.3);text-align:center">protome</p>
    </div>` : ''
    // Inject visible content into #root replacing the spinner; React replaces it on mount
    const rootHTML = profileData
      ? visibleCard
      : '<div class="shell-spinner" id="shell-spinner"><div class="shell-spinner__ring"></div></div>'

    const metaTags = [
      `<title>${safeName} — protome</title>`,
      `<meta name="description" content="${safeDesc}" />`,
      `<meta name="theme-color" content="${safeAccent}" />`,
      `<link rel="canonical" href="${siteUrl}" />`,
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
      .replace(/<link rel="canonical"[^>]*>/, '')  // remove the static canonical from index.html
      .replace('</head>', `    ${metaTags}\n    ${profileScript}\n  </head>`)
      // Match <div id="root"> through ALL three nested </div> closings (ring, spinner, root)
      .replace(/<div id="root">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '<div id="root">\n      ' + rootHTML + '\n    </div>')

    return new Response(html, {
      headers: { 'content-type': 'text/html', 'cache-control': profileCacheControl },
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
