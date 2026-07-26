import { computeProfileTheme } from '../../lib/useProfileTheme.js'
import { DEFAULT_DATA } from './demoProfiles.js'

/* ---------- Styles factory ---------- */

export function cardStyles(profile) {
  const d = {
    ...DEFAULT_DATA,
    ...profile,
    photo: profile.photo_url || profile.photo || '',
  }
  return computeProfileTheme(d).cssVars
}
