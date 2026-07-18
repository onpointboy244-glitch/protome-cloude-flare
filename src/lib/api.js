let _supabase = null
let _supabaseLoading = null

/**
 * Lazily import the Supabase client.
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient>}
 */
async function getSupabase() {
  if (_supabase) return _supabase
  // Deduplicate concurrent calls during first load
  if (!_supabaseLoading) {
    _supabaseLoading = import('./supabase').then(m => {
      _supabase = m.supabase
      return _supabase
    })
  }
  return _supabaseLoading
}

import { MAX_FREE_PROFILES } from '../components/profile/createSection/formConstants'

/**
 * Maps flat form/Db field names → path inside structured `design` JSONB.
 * All design settings are stored in the `design` JSONB column.
 * Add new entries here when adding design options — no schema migration needed.
 *
 * Design structure:
 *   colors:    { accent, bg_color }
 *   background:{ bg_gradient, bg_type, bg_size }
 *   font:      string
 *   button:    { style, corner }
 */
const DESIGN_MAP = [
  { flat: 'accent',         dest: ['colors', 'accent'] },
  { flat: 'bg_color',       dest: ['colors', 'bg_color'] },
  { flat: 'bg_gradient',    dest: ['background', 'bg_gradient'] },
  { flat: 'bg_type',        dest: ['background', 'bg_type'] },
  { flat: 'bg_size',        dest: ['background', 'bg_size'] },
  { flat: 'font',           dest: ['font'] },
  { flat: 'button_style',   dest: ['button', 'style'] },
  { flat: 'button_corner',  dest: ['button', 'corner'] },
]

/**
 * Normalize a profile object: merge structured `design` JSONB back into
 * top-level flat fields so all existing code (profile.accent, etc.) works unchanged.
 */
function normalizeProfile(profile) {
  if (!profile || !profile.design || typeof profile.design !== 'object') return profile
  const result = { ...profile }
  for (const { flat, dest } of DESIGN_MAP) {
    let val = profile.design
    for (const key of dest) {
      if (val && typeof val === 'object') val = val[key]
      else { val = undefined; break }
    }
    if (val !== undefined) result[flat] = val
  }
  return result
}

/**
 * Extract design fields from flat form data and build structured `design` JSONB.
 * Strips the individual columns — only the `design` JSONB is saved to the DB.
 */
function attachDesign(profileData) {
  // Strip flat design fields so only non-design data ends up in ...rest
  const flatKeys = DESIGN_MAP.map(d => d.flat)
  const rest = {}
  for (const key of Object.keys(profileData)) {
    if (!flatKeys.includes(key)) rest[key] = profileData[key]
  }
  const design = {}
  for (const { flat, dest } of DESIGN_MAP) {
    if (flat in profileData) {
      let obj = design
      for (let i = 0; i < dest.length - 1; i++) {
        if (!obj[dest[i]] || typeof obj[dest[i]] !== 'object') obj[dest[i]] = {}
        obj = obj[dest[i]]
      }
      obj[dest[dest.length - 1]] = profileData[flat]
    }
  }
  return { ...rest, design }
}

/**
 * Strip dangerous protocols from URLs to prevent stored XSS via javascript: or data: links.
 * Called client-side (defense in depth) — a Supabase DB trigger would be the server-side guarantee.
 */
function sanitizeLinks(profileData) {
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const isDangerous = (url) => {
    if (!url || typeof url !== 'string') return false
    const lower = url.trim().toLowerCase()
    return dangerousProtocols.some(p => lower.startsWith(p))
  }
  const links = Array.isArray(profileData.links) ? profileData.links : []
  return {
    ...profileData,
    links: links.map(l => {
      if (l.isSection) return l
      return { ...l, url: isDangerous(l.url) ? '' : (l.url || '').trim() }
    }),
  }
}

/**
 * Create a new profile.
 * Requires the user to be authenticated.
 */
export async function createProfile(username, profileData) {
  const sb = await getSupabase()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('You must be signed in to create a profile.')

  // Enforce free-tier profile limit
  const { count } = await sb
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  if (count >= MAX_FREE_PROFILES) throw new Error(`Free plan limited to ${MAX_FREE_PROFILES} profiles. Delete one or upgrade to create more.`)

  const { error } = await sb.from('profiles').insert({
    username: username.toLowerCase(),
    owner_id: user.id,
    ...attachDesign(sanitizeLinks(profileData)),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)
  return { username: username.toLowerCase() }
}

/**
 * Update an existing profile.
 * Requires the user to be authenticated and own the profile.
 */
export async function updateProfile(username, profileData) {
  const sb = await getSupabase()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('You must be signed in to update a profile.')

  const { error } = await sb
    .from('profiles')
    .update({
      ...attachDesign(sanitizeLinks(profileData)),
      updated_at: new Date().toISOString(),
    })
    .eq('username', username.toLowerCase())
    .eq('owner_id', user.id)

  if (error) throw new Error(error.message)
  return { username: username.toLowerCase() }
}

/**
 * Fetch a profile by username.
 * Public — no auth required.
 */
export async function getProfile(username) {
  const sb = await getSupabase()
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return normalizeProfile(data)
}

/**
 * Check if a username is available.
 */
export async function checkUsername(username) {
  const sb = await getSupabase()
  const { data } = await sb
    .from('profiles')
    .select('username')
    .eq('username', username.toLowerCase())
    .maybeSingle()

  return !data
}

/**
 * Build a full URL for a profile.
 */
export function profileUrl(username) {
  return `${window.location.origin}/${username}`
}

/**
 * Resize and compress an image before upload.
 * Returns a Blob (WebP, max 400×400).
 */
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      const MAX = 400
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height / width) * MAX)
          width = MAX
        } else {
          width = Math.round((width / height) * MAX)
          height = MAX
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(blob => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to encode image'))
      }, 'image/webp', 0.85)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

/**
 * Upload a profile photo to Supabase Storage.
 * Returns the public URL.
 */
export async function uploadPhoto(file, username) {
  // Reject oversized or non-image files before processing (defense in depth)
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
  if (file.size > MAX_FILE_SIZE) throw new Error('Image must be smaller than 10 MB.')
  if (!file.type || !file.type.startsWith('image/')) throw new Error('Only image files are allowed.')
  // Resize + compress before upload (max 400×400, WebP)
  const resized = await resizeImage(file)
  const ts = Date.now()
  const path = `${username}/photo_${ts}.webp`

  const sb = await getSupabase()
  // Clean up old photos for this user to avoid accumulation
  const { data: existing } = await sb.storage.from('photos').list(username)
  if (existing?.length) {
    await sb.storage.from('photos').remove(
      existing.map(f => `${username}/${f.name}`)
    ).catch(() => {})
  }

  const { error: uploadError } = await sb.storage
    .from('photos')
    .upload(path, resized, { contentType: 'image/webp' })

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = sb.storage
    .from('photos')
    .getPublicUrl(path)

  return publicUrl
}

/**
 * Delete all stored photos for a given username.
 * Used when the user explicitly removes their photo during editing.
 */
export async function deleteProfilePhoto(username) {
  const sb = await getSupabase()
  const { data: existing } = await sb.storage.from('photos').list(username)
  if (existing?.length) {
    await sb.storage.from('photos').remove(
      existing.map(f => `${username}/${f.name}`)
    ).catch(() => {})
  }
}

/**
 * Join the waitlist.
 */
export async function joinWaitlist(email) {
  const sb = await getSupabase()
  const { error } = await sb
    .from('waitlist')
    .insert({ email })

  if (error) {
    if (error.code === '23505') throw new Error('Already on the list!')
    throw new Error(error.message)
  }

  return true
}

/**
 * Get all profiles owned by the currently signed-in user.
 * Returns an array (empty if none).
 */
/**
 * Delete a profile by username.
 * Requires the user to be authenticated and own the profile.
 */
export async function deleteProfile(username) {
  const sb = await getSupabase()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('You must be signed in to delete a profile.')

  const { error } = await sb
    .from('profiles')
    .delete()
    .eq('username', username.toLowerCase())
    .eq('owner_id', user.id)

  if (error) throw new Error(error.message)
  return true
}

export async function getMyProfiles() {
  const sb = await getSupabase()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return []

  const { data } = await sb
    .from('profiles')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })

  return (data || []).map(normalizeProfile)
}

/**
 * Report a profile for review.
 * Sends to the server which checks by IP address.
 */
export async function reportProfile(username, { reason, details }) {
  const res = await fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.toLowerCase(), reason, details }),
  })

  let data
  try {
    data = await res.json()
  } catch {
    throw new Error('Server returned an unexpected response. Make sure the server is running.')
  }

  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit report.')
  }

  return true
}

export async function getPlans() {
  const sb = await getSupabase()
  const { data } = await sb
    .from('plans')
    .select('*')
    .order('sort_order', { ascending: true })

  return data || []
}
