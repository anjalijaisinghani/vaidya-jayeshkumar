import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

// Shows whether the frontend can reach the backend and the database.
export default function ApiStatus() {
  const [state, setState] = useState({ status: 'loading', message: '' })

  useEffect(() => {
    const controller = new AbortController()
    api('/health', { signal: controller.signal })
      .then(() => setState({ status: 'ok', message: 'Connected to the backend and the database.' }))
      .catch((err) => {
        if (err.name === 'AbortError') return
        setState({ status: 'error', message: err.message })
      })
    return () => controller.abort()
  }, [])

  if (state.status === 'loading') {
    return (
      <p className="flex items-center gap-3 text-sm text-ink-600" role="status">
        <span className="spinner" aria-hidden="true" /> Checking the backend...
      </p>
    )
  }
  if (state.status === 'ok') {
    return (
      <p className="alert alert-success" role="status">
        {state.message}
      </p>
    )
  }
  return (
    <p className="alert alert-error" role="alert">
      Backend check failed: {state.message} Is the backend running on port 5000?
    </p>
  )
}