import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as api from '../services/api'
import { load, remove, save, STORAGE_KEYS } from '../utils/storage'

const AuthContext = createContext(null)

/** A usable session has both the user profile and the token that scopes its data. */
function readSession() {
  const session = load(STORAGE_KEYS.session, null)
  return session?.user && session?.token ? session : null
}

/**
 * Authentication.
 *
 * Credentials are real: registration stores a salted hash, sign-in verifies it,
 * and the session (profile + bearer token) persists to `localStorage`. Google
 * sign-in exchanges a Google Identity Services ID token for the same session
 * shape. Until the backend exists the account table lives in `localStorage` too
 * (see `mocks/accounts`).
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession)
  const [status, setStatus] = useState(() => (readSession() ? 'authenticated' : 'anonymous'))
  const [error, setError] = useState(null)

  const user = session?.user ?? null
  const token = session?.token ?? null

  // Persist synchronously so a data fetch triggered by the same state change
  // always sees the token (see `services/api` authHeader).
  const applySession = useCallback((next) => {
    if (next?.user && next?.token) {
      save(STORAGE_KEYS.session, next)
      setSession(next)
      setStatus('authenticated')
    } else {
      remove(STORAGE_KEYS.session)
      setSession(null)
      setStatus('anonymous')
    }
  }, [])

  const runAuth = useCallback(
    async (action) => {
      setStatus('pending')
      setError(null)
      try {
        const next = await action()
        applySession(next)
        return next.user
      } catch (cause) {
        setStatus('anonymous')
        setError(cause.message)
        throw cause
      }
    },
    [applySession],
  )

  const signIn = useCallback((credentials) => runAuth(() => api.login(credentials)), [runAuth])
  const signInWithGoogle = useCallback((credential) => runAuth(() => api.loginWithGoogle(credential)), [runAuth])

  // Registration does not establish a session: the account is created, then the
  // user is sent to the sign-in screen to authenticate.
  const signUp = useCallback(
    async (payload) => {
      setStatus('pending')
      setError(null)
      try {
        const { user: profile } = await api.register(payload)
        applySession(null)
        return profile
      } catch (cause) {
        setStatus('anonymous')
        setError(cause.message)
        throw cause
      }
    },
    [applySession],
  )

  const signOut = useCallback(async () => {
    await api.logout().catch(() => undefined)
    applySession(null)
  }, [applySession])

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      error,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
    }),
    [user, token, status, error, signIn, signUp, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}

export { AuthContext }
