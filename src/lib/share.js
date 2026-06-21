const STORAGE_KEY = 'protome_protofiles'

/**
 * Generate a short random ID (6 alphanumeric chars)
 */
function shortId() {
  return Math.random().toString(36).slice(2, 8)
}

/**
 * Save a protofile to localStorage and return its short ID.
 */
export function saveProtofile(data) {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  const id = shortId()
  stored[id] = data
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // localStorage full — clean old entries and retry once
    const keys = Object.keys(stored)
    // Remove oldest entries (up to 10)
    for (let i = 0; i < Math.min(keys.length, 10); i++) {
      delete stored[keys[i]]
    }
    stored[id] = data
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } catch {
      return null
    }
  }
  return id
}

/**
 * Load a protofile by its short ID from localStorage.
 */
export function loadProtofile(id) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return stored[id] || null
  } catch {
    return null
  }
}

/**
 * Build a short, clean share URL for a protofile.
 */
export function buildProtofileUrl(id) {
  if (!id) return null
  const url = new URL(window.location.href)
  url.hash = `#/pf/${id}`
  return url.toString()
}

/**
 * Parse a protofile ID from a URL hash.
 * Supports: #/pf/abc123
 */
export function parseProtofileId(hash) {
  try {
    const match = hash.match(/^#\/pf\/([\w-]+)$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}
