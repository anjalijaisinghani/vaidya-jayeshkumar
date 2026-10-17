import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './auth/useAuth.js'

// Everything nested inside this component is only reachable while signed in.
export default function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        <span className="spinner" aria-hidden="true" />
        <span className="sr-only">Checking your session...</span>
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <Outlet />
}