import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { ProfileContext } from './profileContext.js'

// Loads the doctor's public profile once, so the header, footer and pages can share it.
export default function ProfileProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', profile: null })

  useEffect(() => {
    const controller = new AbortController()
    api('/profile', { signal: controller.signal })
      .then((res) => setState({ status: 'ready', profile: res.data }))
      .catch((err) => {
        if (err.name === 'AbortError') return
        setState({ status: 'error', profile: null })
      })
    return () => controller.abort()
  }, [])

  return <ProfileContext.Provider value={state}>{children}</ProfileContext.Provider>
}