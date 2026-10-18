import { useCallback } from 'react'
import { api } from '../../lib/api.js'
import { useAuth } from '../auth/useAuth.js'

// For actions (publish, delete, save...). If the server says the session has ended (401),
// the admin is sent to the sign-in page and the error is still thrown to the caller,
// who should not show a message for status 401.
export function useAdminRequest() {
  const { expire } = useAuth()
  return useCallback(
    async (path, options) => {
      try {
        return await api(path, options)
      } catch (err) {
        if (err.status === 401) expire()
        throw err
      }
    },
    [expire],
  )
}