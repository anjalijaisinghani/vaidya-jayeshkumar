import { useEffect } from 'react'
import { useApi } from '../../hooks/useApi.js'
import { useAuth } from '../auth/useAuth.js'

// Like useApi, but if the server says the session has ended (401) the admin is sent
// back to the sign-in page.
export function useAdminApi(path) {
  const { expire } = useAuth()
  const result = useApi(path)
  const sessionEnded = result.status === 'error' && result.error.status === 401

  useEffect(() => {
    if (sessionEnded) expire()
  }, [sessionEnded, expire])

  return result
}