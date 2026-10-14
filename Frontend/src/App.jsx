import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './App.css'
import { VITE_GOOGLE_CLIENT_ID, isGoogleAuthEnabled, isMockApiEnabled } from './config'
import ToastViewport from './components/ui/ToastViewport'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import AuthPage from './pages/AuthPage'
import AuthenticatedLayout from './pages/AuthenticatedLayout'
import BudgetsPage from './pages/BudgetsPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import MilestonesPage from './pages/MilestonesPage'
import RequireAuth, { LandingRoute, RedirectIfAuthenticated } from './pages/RequireAuth'
import SettingsPage from './pages/SettingsPage'
import TransactionsPage from './pages/TransactionsPage'

/**
 * Composition root.
 *
 * Owns provider order and the MSW lifecycle; every other Context read lives in a
 * page. Provider order matters — toasts wrap data so a failed write can always
 * surface a message.
 */
export default function App() {
  // With a real API configured the mock is skipped, so the app is ready at once.
  const [apiReady, setApiReady] = useState(!isMockApiEnabled)

  useEffect(() => {
    if (!isMockApiEnabled) return undefined

    let active = true
    // MSW's interceptor runtime is heavy, so it is loaded as a separate chunk
    // instead of blocking the first paint.
    import('./mocks/browser')
      .then((module) => module.startMockApi())
      .finally(() => {
        if (active) setApiReady(true)
      })
    return () => {
      active = false
    }
  }, [])

  // Render nothing until the worker is registered, otherwise the first GETs
  // would race the service worker and hit the network.
  if (!apiReady) return null

  const app = (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <DataProvider>
              <Routes>
                <Route element={<LandingRoute />}>
                  <Route index element={<LandingPage />} />
                </Route>

                <Route element={<RedirectIfAuthenticated />}>
                  <Route path="/signin" element={<AuthPage mode="signin" />} />
                  <Route path="/register" element={<AuthPage mode="register" />} />
                </Route>

                <Route element={<RequireAuth />}>
                  <Route element={<AuthenticatedLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/transactions" element={<TransactionsPage />} />
                    <Route path="/budgets" element={<BudgetsPage />} />
                    <Route path="/milestones" element={<MilestonesPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <ToastViewport />
            </DataProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )

  // Only mount the Google provider once a client ID is configured; without it the
  // GIS script cannot load and the Google button renders a disabled fallback.
  return isGoogleAuthEnabled ? (
    <GoogleOAuthProvider clientId={VITE_GOOGLE_CLIENT_ID}>{app}</GoogleOAuthProvider>
  ) : (
    app
  )
}
