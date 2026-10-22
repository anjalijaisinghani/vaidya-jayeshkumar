import { createContext, useContext, useEffect } from 'react'

// The admin layout provides a function that records "this page holds unsaved work".
export const UnsavedContext = createContext(() => {})

// A page calls this with true while it has unsaved changes, so the layout can warn before signing out.
export function useReportUnsaved(active) {
  const report = useContext(UnsavedContext)
  useEffect(() => {
    report(active)
    return () => report(false)
  }, [active, report])
}