import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api.js'

// Loads data from the backend whenever `path` changes.
// Returns { status: 'loading' | 'ready' | 'error', data, meta, error, reload, refreshing }.
// While the same address is being reloaded, the old data stays visible (refreshing: true).
export function useApi(path) {
  const [result, setResult] = useState({ path: null, attempt: -1 })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    api(path, { signal: controller.signal })
      .then((res) => setResult({ path, attempt, status: 'ready', data: res.data, meta: res.meta }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        setResult({ path, attempt, status: 'error', error })
      })
    return () => controller.abort()
  }, [path, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])

  if (result.path === path && result.attempt === attempt) return { ...result, reload }
  // Reloading the same address: keep showing what we have instead of flashing a loading state.
  if (result.path === path && result.status === 'ready') return { ...result, refreshing: true, reload }
  // A different address (or the first load): results from before do not apply.
  return { status: 'loading', reload }
}