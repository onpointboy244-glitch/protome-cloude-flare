const API = '/api'

/**
 * Create or update a profile on the server.
 * @returns {{ username: string }} or throws
 */
export async function createProfile(username, data) {
  const res = await fetch(`${API}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, ...data }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Failed to save profile')
  return json
}

/**
 * Fetch a profile by username.
 * @returns {object|null}
 */
export async function getProfile(username) {
  try {
    const res = await fetch(`${API}/profiles/${encodeURIComponent(username)}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/**
 * Check if a username is available.
 * @returns {boolean}
 */
export async function checkUsername(username) {
  try {
    const res = await fetch(`${API}/check/${encodeURIComponent(username)}`)
    const json = await res.json()
    return json.available
  } catch {
    return false
  }
}

/**
 * Build a full URL for a profile.
 */
export function profileUrl(username) {
  return `${window.location.origin}/${username}`
}
