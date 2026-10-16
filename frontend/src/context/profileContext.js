import { createContext } from 'react'

// status: 'loading' | 'ready' | 'error'. profile is null until it has loaded.
export const ProfileContext = createContext({ status: 'loading', profile: null })