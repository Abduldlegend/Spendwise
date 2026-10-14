import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Skeleton from '../components/ui/Skeleton'

/**
 * Gate for the authenticated routes. Unauthenticated visitors (including a user
 * who just signed out) are sent to the public landing page, where the sign-in
 * links live — so logging out lands on marketing, never the sign-in form.
 */
export default function RequireAuth() {
  const { status } = useAuth()

  if (status === 'pending') {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <Skeleton count={3} variant="card" />
      </div>
    )
  }

  if (status !== 'authenticated') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

/** Keeps signed-in users off the auth screens and the public landing page. */
export function RedirectIfAuthenticated() {
  const { status } = useAuth()
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

/**
 * Gate for the public landing page. Signed-in visitors are sent straight to the
 * app so they never see marketing chrome; everyone else sees the landing route.
 */
export function LandingRoute() {
  const { status } = useAuth()
  if (status === 'authenticated') return <Navigate to="/dashboard" replace />
  return <Outlet />
}
