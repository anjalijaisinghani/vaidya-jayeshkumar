import { useContext } from 'react'
import { ProfileContext } from './profileContext.js'

export function useProfile() {
  return useContext(ProfileContext)
}