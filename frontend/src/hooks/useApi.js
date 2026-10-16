import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api.js'

// Loads data from the backend whenever `path` changes.
// Returns { status: 'loading' | 'ready' | 'error', data, meta, error, reload }.
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

  // Results that belong to an older path or attempt count as "still loading".
  const current = result.path === path && result.attempt === attempt
  return current ? { ...result, reload } : { status: 'loading', reload }
}