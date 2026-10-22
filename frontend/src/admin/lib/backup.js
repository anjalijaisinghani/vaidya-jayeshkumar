// A copy of unsaved work, kept in this browser (localStorage), so a crash, a closed tab or an
// expired session does not lose an article. It is only a safety net: the real saving is to the server.

const PREFIX = 'vj-admin-backup:'
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
const TEXT_FIELDS = ['title', 'categoryId', 'excerpt', 'coverUrl', 'body']

// After signing out on purpose, nothing may be written until the next sign-in.
let suspended = false

export const backupKey = (postId) => `${PREFIX}${postId ?? 'new'}`

function looksValid(form) {
  return (
    form &&
    typeof form === 'object' &&
    TEXT_FIELDS.every((field) => typeof form[field] === 'string') &&
    typeof form.featured === 'boolean'
  )
}

// Returns { form, baseUpdatedAt, savedAt } or null. Old (30 days) or damaged copies are deleted.
export function readBackup(key) {
  let raw
  try {
    raw = window.localStorage.getItem(key)
  } catch {
    return null // storage is blocked: act as if there is no backup
  }
  if (!raw) return null

  try {
    const data = JSON.parse(raw)
    const fresh = data && typeof data.savedAt === 'number' && Date.now() - data.savedAt < MAX_AGE_MS
    if (fresh && looksValid(data.form)) return data
  } catch {
    // not valid JSON: treated as damaged below
  }
  clearBackup(key)
  return null
}

export function writeBackup(key, form, baseUpdatedAt) {
  if (suspended) return
  try {
    window.localStorage.setItem(key, JSON.stringify({ form, baseUpdatedAt: baseUpdatedAt ?? null, savedAt: Date.now() }))
  } catch {
    // Storage is full or blocked: the backup is a bonus, so carry on without it.
  }
}

export function clearBackup(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function clearAllBackups() {
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => window.localStorage.removeItem(key))
  } catch {
    // ignore
  }
}

export const suspendBackups = () => {
  suspended = true
}
export const resumeBackups = () => {
  suspended = false
}