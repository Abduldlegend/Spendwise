import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Skeleton from '../components/ui/Skeleton'

/**
 * Gate for the authenticated routes. Redirects to `/signin` and preserves the
 * intended destination so sign-in returns the user where they were going.
 */
export default function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'pending') {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <Skeleton count={3} variant="card" />
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

/** Keeps signed-in users off the auth screens. */
export function RedirectIfAuthenticated() {
  const { status } = useAuth()
  if (status === 'authenticated') return <Navigate to="/" replace />
  return <Outlet />
}
