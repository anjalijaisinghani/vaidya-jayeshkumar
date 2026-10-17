import { createContext } from 'react'

// status: 'loading' | 'authenticated' | 'anonymous'
export const AuthContext = createContext({
  status: 'loading',
  admin: null,
  error: null,
  expired: false,
})