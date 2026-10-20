import { useEffect } from 'react'

// While `active` is true, the browser asks "Leave site?" before the tab is closed or reloaded.
export function useUnsavedWarning(active) {
  useEffect(() => {
    if (!active) return undefined
    const handler = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [active])
}
