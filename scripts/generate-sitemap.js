/**
 * Static Sitemap Generator
 *
 * Runs at build time: fetches all public profiles from Supabase
 * and writes public/sitemap.xml so it's served directly from CDN
 * instead of relying on the edge function.
 *
 * ── Revert ──
 * To go back to the edge-function sitemap:
 *   1. Delete this file
 *   2. In package.json: change build back to "vite build"
 *   3. In functions/[[path]].js: re-add the /sitemap.xml block
 */

const SITE_URL = 'https://protome.pages.dev'
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, ' ')
}

async function generateSitemap() {
  // Static pages
  const staticUrls = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${SITE_URL}/about`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${SITE_URL}/blog`, priority: '0.6', changefreq: 'weekly' },
    { loc: `${SITE_URL}/contact`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${SITE_URL}/privacy`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${SITE_URL}/terms`, priority: '0.5', changefreq: 'monthly' },
  ]

  // Dynamic profiles from Supabase
  let profileUrls = []
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const url = `${SUPABASE_URL}/rest/v1/profiles?select=username,updated_at&order=updated_at.desc`
      const res = await fetch(url, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      })
      const profiles = await res.json()
      if (Array.isArray(profiles)) {
        profileUrls = profiles.map(p => ({
          loc: `${SITE_URL}/${encodeURIComponent(p.username)}`,
          lastmod: p.updated_at ? p.updated_at.split('T')[0] : undefined,
          priority: '0.5',
          changefreq: 'weekly',
        }))
      }
    } catch (err) {
      console.warn('⚠️  Could not fetch profiles for sitemap:', err.message)
    }
  } else {
    console.warn('⚠️  SUPABASE_URL or SUPABASE_ANON_KEY not set — sitemap will only include static pages.')
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

  const fs = await import('fs')
  fs.writeFileSync('public/sitemap.xml', xml, 'utf-8')
  console.log(`✅ Sitemap generated: ${allUrls.length} URLs (${profileUrls.length} profiles)`)
}

generateSitemap()
