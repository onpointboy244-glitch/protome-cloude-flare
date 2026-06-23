import { supabase } from './supabase'

/**
 * Create a new profile.
 * Requires the user to be authenticated.
 */
export async function createProfile(username, profileData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in to create a profile.')

  const { error } = await supabase.from('profiles').insert({
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in to update a profile.')

  const { error } = await supabase
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
  const { data, error } = await supabase
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
  const { data } = await supabase
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
 * Upload a profile photo to Supabase Storage.
 * Returns the public URL.
 */
export async function uploadPhoto(file, username) {
  const ext = file.name.split('.').pop()
  const path = `${username}/photo.${ext}`

  // Try to delete existing photo first (ignore error if none exists)
  await supabase.storage.from('photos').remove([path]).catch(() => {})

  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(path, file)

  if (uploadError) throw new Error(uploadError.message)

  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(path)

  return publicUrl
}

/**
 * Join the waitlist.
 */
export async function joinWaitlist(email) {
  const { error } = await supabase
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in to delete a profile.')

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('username', username.toLowerCase())
    .eq('owner_id', user.id)

  if (error) throw new Error(error.message)
  return true
}

export async function getMyProfiles() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
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
  const { data } = await supabase
    .from('plans')
    .select('*')
    .order('sort_order', { ascending: true })

  return data || []
}
