import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api.js'
import { clearAllBackups, resumeBackups, suspendBackups } from '../lib/backup.js'
import { AuthContext } from './authContext.js'

const SIGNED_OUT = { status: 'anonymous', admin: null, error: null, expired: false }

// Keeps track of who is signed in to the admin panel. It is only mounted under /admin,
// so ordinary visitors never trigger any admin requests.
export default function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', admin: null, error: null, expired: false })

  // On page load, ask the server whether the browser already has a valid session.
  useEffect(() => {
    const controller = new AbortController()
    api('/admin/auth/me', { signal: controller.signal })
      .then((res) => {
        resumeBackups()
        setState({ status: 'authenticated', admin: res.data, error: null, expired: false })
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        // 401 just means "not signed in". Anything else (server down) is worth telling the user.
        setState({ ...SIGNED_OUT, error: err.status === 401 ? null : err.message })
      })
    return () => controller.abort()
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api('/admin/auth/login', { method: 'POST', body: { email, password } })
    resumeBackups()
    setState({ status: 'authenticated', admin: res.data, error: null, expired: false })
  }, [])

  const logout = useCallback(async () => {
    try {
      await api('/admin/auth/logout', { method: 'POST' })
    } catch (err) {
      // If the server could not be reached the session may still be active, so say so.
      if (err.status !== 401) throw err
    }
    // A deliberate sign-out also removes the browser backups (the next person must not see them).
    suspendBackups()
    clearAllBackups()
    setState(SIGNED_OUT)
  }, [])

  // Called when the server says the session is no longer valid (for example after 8 hours).
  const expire = useCallback(() => setState({ ...SIGNED_OUT, expired: true }), [])

  const value = useMemo(() => ({ ...state, login, logout, expire }), [state, login, logout, expire])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}