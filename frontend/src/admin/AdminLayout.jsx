import { Suspense, useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import emblem from '../assets/emblem.webp'
import Seo from '../components/Seo.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import { SITE_NAME } from '../lib/site.js'
import { useAuth } from './auth/useAuth.js'
import { UnsavedContext } from './unsaved.js'

// More entries are added here as the admin pages are built.
const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/posts', label: 'Posts' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/profile', label: 'Doctor profile' },
]

const tabClass = ({ isActive }) =>
  `block rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap no-underline transition-colors ${
    isActive ? 'bg-leaf-800 text-white' : 'text-ink-700 hover:bg-leaf-50 hover:text-leaf-900'
  }`

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const [signOutError, setSignOutError] = useState('')
  const [unsaved, setUnsaved] = useState(false) // set by pages that hold unsaved work
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  async function onSignOut() {
    setSignOutError('')
    try {
      await logout()
    } catch (err) {
      setSignOutError(`Could not sign out: ${err.message}`)
    }
  }

  return (
    <UnsavedContext.Provider value={setUnsaved}>
      <div className="min-h-screen">
        <Seo title="Admin" noindex />
        <header className="border-b border-cream-300 bg-white">
          <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <img src={emblem} width="192" height="190" alt="" className="h-10 w-auto" />
              <div className="leading-tight">
                <p className="font-serif text-lg font-semibold text-leaf-800">Admin panel</p>
                <p className="text-xs text-ink-600">{SITE_NAME}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <a href="/" target="_blank" rel="noopener noreferrer" className="font-semibold">
                View website
              </a>
              <span className="text-ink-600">{admin?.name}</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => (unsaved ? setConfirmSignOut(true) : onSignOut())}>
                Sign out
              </button>
            </div>
          </div>
          <nav aria-label="Admin" className="border-t border-cream-300">
            <ul className="container-page flex gap-1 overflow-x-auto py-2">
              {ADMIN_NAV.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} className={tabClass}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {signOutError && (
          <div className="container-page pt-4">
            <p className="alert alert-error" role="alert">{signOutError}</p>
          </div>
        )}

        <main className="container-page py-8 sm:py-10">
          <Suspense
            fallback={
              <div className="flex justify-center py-16" role="status">
                <span className="spinner" aria-hidden="true" />
                <span className="sr-only">Loading...</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>

        <ConfirmDialog
          open={confirmSignOut}
          title="Sign out with unsaved changes?"
          confirmLabel="Sign out anyway"
          cancelLabel="Stay signed in"
          danger
          onConfirm={() => {
            setConfirmSignOut(false)
            onSignOut()
          }}
          onCancel={() => setConfirmSignOut(false)}
        >
          <p>You have changes that are not saved yet. If you sign out now, they will be lost.</p>
        </ConfirmDialog>
      </div>
    </UnsavedContext.Provider>
  )
}