import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import emblem from '../../assets/emblem.webp'
import Seo from '../../components/Seo.jsx'
import { SITE_NAME } from '../../lib/site.js'
import { useAuth } from '../auth/useAuth.js'
import { safeAdminPath } from '../safePath.js'

export default function Login() {
  const auth = useAuth()
  const location = useLocation()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Already signed in (or just signed in): go to the page that was asked for.
  if (auth.status === 'authenticated') {
    return <Navigate to={safeAdminPath(location.state?.from)} replace />
  }

  async function onSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const form = new FormData(event.currentTarget)
    try {
      await auth.login(String(form.get('email') || '').trim(), String(form.get('password') || ''))
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Seo title="Admin sign in" noindex />
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src={emblem} width="192" height="190" alt="" className="h-20 w-auto" />
          <h1 className="mt-3 text-3xl">Admin sign in</h1>
          <p className="mt-1 text-sm text-ink-600">{SITE_NAME}</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8" noValidate>
          {auth.expired && (
            <p className="alert alert-info" role="status">
              Your session has ended. Please sign in again.
            </p>
          )}
          {auth.error && (
            <p className="alert alert-error" role="alert">
              Could not check your session: {auth.error}
            </p>
          )}

          <div>
            <label htmlFor="admin-email" className="field-label">Email</label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="username"
              required
              className="field-input"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="field-label">Password</label>
            <div className="flex gap-2">
              <input
                id="admin-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="field-input"
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm shrink-0"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <p className="alert alert-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to="/">&larr; Back to the website</Link>
        </p>
      </div>
    </main>
  )
}