import { useCallback, useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router'
import { clearBackup, readBackup, writeBackup } from '../lib/backup.js'
import { useReportUnsaved } from '../unsaved.js'
import { useUnsavedWarning } from './useUnsavedWarning.js'

// Keeps a form's unsaved work safe:
//  - asks before the tab is closed, before signing out, and before moving to another admin page
//  - keeps a copy in this browser while there are unsaved changes (restorable later)
//
//   storageKey:     where the browser copy lives, e.g. backupKey('profile')
//   form, dirty:    the current values, and whether they differ from what is saved
//   baseline:       JSON of the saved values (a copy identical to it is not worth restoring)
//   baseUpdatedAt:  when the saved version was last changed on the server
//   isValid(form):  checks that a stored copy has the right shape
//
// Returns { blocker, restorable, takeRestorable, discardRestorable, markSaved }.
export function useFormProtection({ storageKey, form, dirty, baseline, baseUpdatedAt = null, isValid }) {
  useUnsavedWarning(dirty)
  useReportUnsaved(dirty)

  const dirtyRef = useRef(false)
  const latest = useRef({ form, dirty, base: baseUpdatedAt })
  // On opening: is there unsaved work from an earlier visit? (Offered, never applied automatically.)
  const [restorable, setRestorable] = useState(() => {
    const backup = readBackup(storageKey, isValid)
    return backup && JSON.stringify(backup.form) !== baseline ? backup : null
  })

  useEffect(() => {
    dirtyRef.current = dirty
    latest.current = { form, dirty, base: baseUpdatedAt }
  }, [form, dirty, baseUpdatedAt])

  const shouldBlock = useCallback(
    ({ currentLocation, nextLocation }) => dirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
    [],
  )
  const blocker = useBlocker(shouldBlock)

  // A moment after typing stops, keep a copy in this browser.
  useEffect(() => {
    if (!dirty) return undefined
    const timer = setTimeout(() => writeBackup(storageKey, form, baseUpdatedAt), 700)
    return () => clearTimeout(timer)
  }, [form, dirty, storageKey, baseUpdatedAt])

  // Write the latest copy straight away when the page is left or the tab is closed.
  useEffect(() => {
    const flush = () => {
      if (latest.current.dirty) writeBackup(storageKey, latest.current.form, latest.current.base)
    }
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [storageKey])

  // A stored copy identical to what is already saved is not worth keeping.
  useEffect(() => {
    const backup = readBackup(storageKey, isValid)
    if (backup && JSON.stringify(backup.form) === baseline) clearBackup(storageKey)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Call after a successful save: the server has everything, so the browser copy is not needed.
  const markSaved = useCallback(() => {
    dirtyRef.current = false
    latest.current = { ...latest.current, dirty: false }
    clearBackup(storageKey)
  }, [storageKey])

  const takeRestorable = useCallback(() => {
    const backed = restorable?.form
    setRestorable(null)
    return backed
  }, [restorable])

  const discardRestorable = useCallback(() => {
    clearBackup(storageKey)
    setRestorable(null)
  }, [storageKey])

  return { blocker, restorable, takeRestorable, discardRestorable, markSaved }
}