/**
 * Generates a static `public/sitemap.xml` at build time.
 *
 * Fetches all public profile usernames from Supabase and writes
 * a complete sitemap so Google Search Console can always fetch it
 * as a plain static file — no Worker dependency, no timeouts.
 *
 * Reads SUPABASE_URL and SUPABASE_ANON_KEY from environment (or .env).
 * Runs automatically as part of `npm run build` via package.json.
 */

// ── Load .env if env vars aren't already set ──────────────────
import fs from 'fs'
import path from 'path'

function loadEnv() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) return

  const envPath = path.resolve('.env')
  try {
    const content = fs.readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // .env not found — that's ok, env vars may come from CI/Cloudflare dashboard
  }
}

loadEnv()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment or .env')
  process.exit(1)
}

const SITE_URL = 'https://protome.pages.dev'

// ── Helpers ───────────────────────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function url(path, params = {}) {
  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
  return `${SUPABASE_URL}/rest/v1/${path}${qs ? '?' + qs : ''}`
}

function headers() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  }
}

// ── Static pages ──────────────────────────────────────────────
const staticUrls = [
  { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
  { loc: `${SITE_URL}/about`, priority: '0.7', changefreq: 'monthly' },
  { loc: `${SITE_URL}/privacy`, priority: '0.5', changefreq: 'monthly' },
  { loc: `${SITE_URL}/terms`, priority: '0.5', changefreq: 'monthly' },
]

async function main() {
  // ── Fetch profiles from Supabase ──────────────────────────
  let profileUrls = []
  try {
    const endpoint = url('profiles', {
      select: 'username,updated_at',
      order: 'updated_at.desc',
    })
    const res = await fetch(endpoint, { headers: headers() })
    if (!res.ok) throw new Error(`Supabase returned ${res.status}`)
    const profiles = await res.json()

    if (Array.isArray(profiles)) {
      profileUrls = profiles.map(p => ({
        loc: `${SITE_URL}/${encodeURIComponent(p.username)}`,
        lastmod: p.updated_at ? p.updated_at.split('T')[0] : undefined,
        priority: '0.5',
        changefreq: 'weekly',
      }))
    }
    console.log(`✓ Fetched ${profileUrls.length} profiles from Supabase`)
  } catch (err) {
    console.warn(`⚠ Supabase unavailable (${err.message}) — sitemap will have static pages only`)
  }

  // ── Build XML ──────────────────────────────────────────────
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
  xml += '</urlset>\n'

  // ── Write to public/ ──────────────────────────────────────
  const outPath = path.resolve('public/sitemap.xml')
  fs.writeFileSync(outPath, xml, 'utf-8')
  console.log(`✓ Wrote ${allUrls.length} URLs to ${outPath}`)
}

main().catch(err => {
  console.error('❌ generate-sitemap failed:', err)
  process.exit(1)
})
