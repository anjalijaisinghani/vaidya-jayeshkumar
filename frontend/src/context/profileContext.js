import { createContext } from 'react'

// status: 'loading' | 'ready' | 'error'. profile is null until it has loaded.
// reload() fetches the profile again (used after the admin saves changes).
export const ProfileContext = createContext({ status: 'loading', profile: null, reload: () => {} })