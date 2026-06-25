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

/**
 * Create a new profile.
 * Requires the user to be authenticated.
 */
export async function createProfile(username, profileData) {
  const sb = await getSupabase()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('You must be signed in to create a profile.')

  const { error } = await sb.from('profiles').insert({
    username: username.toLowerCase(),
    owner_id: user.id,
    ...profileData,
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
      ...profileData,
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

  if (error || !data) return null
  return data
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
  // Resize + compress before upload (max 400×400, WebP)
  const resized = await resizeImage(file)
  const path = `${username}/photo.webp`

  const sb = await getSupabase()
  // Try to delete existing photo first (ignore error if none exists)
  await sb.storage.from('photos').remove([path]).catch(() => {})

  const { error: uploadError } = await sb.storage
    .from('photos')
    .upload(path, resized, { contentType: 'image/webp', upsert: true })

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = sb.storage
    .from('photos')
    .getPublicUrl(path)

  return publicUrl
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

  return data || []
}

/**
 * Fetch pricing plans from the database (server-controlled).
 */
export async function getPlans() {
  const sb = await getSupabase()
  const { data } = await sb
    .from('plans')
    .select('*')
    .order('sort_order', { ascending: true })

  return data || []
}
