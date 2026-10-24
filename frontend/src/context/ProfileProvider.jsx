import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import { ProfileContext } from './profileContext.js'

// Loads the doctor's public profile, so the header, footer and pages can share it.
export default function ProfileProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', profile: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    api('/profile', { signal: controller.signal })
      .then((res) => setState({ status: 'ready', profile: res.data }))
      .catch((err) => {
        if (err.name === 'AbortError') return
        setState({ status: 'error', profile: null })
      })
    return () => controller.abort()
  }, [attempt])

  // Loads the profile again without flashing a loading state.
  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  const value = useMemo(() => ({ ...state, reload }), [state, reload])
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}