import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GoogleLogin } from '@react-oauth/google'
import { z } from 'zod'
import { Button, Icon } from '../components/ui/Button'
import BrandMark from '../components/ui/BrandMark'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { isGoogleAuthEnabled } from '../config'

/**
 * Shared sign-in / sign-up screen.
 *
 * Email + password only validates shape (mocked credential path). Google sign-in
 * uses real Google Identity Services and is enabled once `VITE_GOOGLE_CLIENT_ID`
 * is configured; without it the button renders a disabled fallback.
 */
const credentialsSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
})

/**
 * Shared sign-in / sign-up screen. The lone column is vertically and
 * horizontally centered so the form is the whole page.
 * @param {{ mode: 'signin' | 'register' }} props
 */
export default function AuthPage({ mode }) {
  const isRegister = mode === 'register'
  const { signIn, signUp, signInWithGoogle, status } = useAuth()
  const { success } = useToast()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState(null)

  // Google renders a fixed-width button, so its width is measured from the
  // container and clamped to Google's 200–400px range to stay responsive.
  const googleButtonRef = useRef(null)
  // const [googleButtonWidth, setGoogleButtonWidth] = useState(280)

  useEffect(() => {
    const node = googleButtonRef.current
    if (!node || !isGoogleAuthEnabled || typeof ResizeObserver === 'undefined') return undefined

    const observer = new ResizeObserver(([_entry]) => {
      // const width = Math.min(400, Math.max(200, Math.floor(entry.contentRect.width)))
      // setGoogleButtonWidth(width)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: '', password: '', fullName: '' },
  })

  if (status === 'authenticated') return <Navigate to="/dashboard" replace />

  const onSubmit = async (values) => {
    setServerError(null)
    try {
      if (isRegister) {
        await signUp({ email: values.email, password: values.password, fullName: values.fullName })
        success('Account created — sign in to continue')
        navigate('/signin', { replace: true })
      } else {
        await signIn({ email: values.email, password: values.password })
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      setServerError(error.message)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setServerError(null)
    try {
      await signInWithGoogle(credentialResponse.credential)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setServerError(error.message)
    }
  }

  const pending = status === 'pending'

  return (
    <div className="ledger-grid flex min-h-dvh items-center justify-center bg-surface px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center md:text-left">
          <div className="flex justify-center md:justify-start">
            <BrandMark link={false} size="md" />
          </div>
          <p className="mt-1.5 text-sm text-fg-muted">Personal finance OS</p>
        </div>

        <h1 className="text-center text-3xl font-semibold text-fg md:text-left">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-center text-base text-fg-muted md:text-left">
          {isRegister
            ? 'Set a base currency and start tracking envelopes.'
            : 'Sign in to pick up where you left off.'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4" noValidate>
          {isRegister && (
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold uppercase tracking-wide text-fg-muted">Full name</span>
              <input
                type="text"
                placeholder="Damilola Adebayo"
                className="h-11 rounded-lg border border-hairline bg-control px-3.5 text-base text-fg placeholder:text-fg-faint focus:border-brand focus:outline-none"
                {...register('fullName')}
              />
            </label>
          )}

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold uppercase tracking-wide text-fg-muted">Email</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={`h-11 rounded-lg border bg-control px-3.5 text-base text-fg placeholder:text-fg-faint focus:outline-none ${
                errors.email ? 'border-negative focus:border-negative' : 'border-hairline focus:border-brand'
              }`}
              {...register('email')}
            />
            {errors.email && (
              <span role="alert" className="text-sm font-medium text-negative-fg">
                {errors.email.message}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold uppercase tracking-wide text-fg-muted">Password</span>
            <input
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              className={`h-11 rounded-lg border bg-control px-3.5 text-base text-fg placeholder:text-fg-faint focus:outline-none ${
                errors.password ? 'border-negative focus:border-negative' : 'border-hairline focus:border-brand'
              }`}
              {...register('password')}
            />
            {errors.password && (
              <span role="alert" className="text-sm font-medium text-negative-fg">
                {errors.password.message}
              </span>
            )}
          </label>

          {serverError && (
            <p role="alert" className="rounded-lg bg-negative-subtle px-3 py-2 text-base text-negative-fg">
              {serverError}
            </p>
          )}

          <Button variant="primary" type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-hairline" />
          <span className="text-xs uppercase tracking-wide text-fg-faint">or</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <div className="mt-4 w-full">
          {isGoogleAuthEnabled ? (
            <div ref={googleButtonRef} className="relative flex w-full justify-center">
              <Button
                variant="secondary"
                type="button"
                size="lg"
                className="w-full pointer-events-none"
                aria-hidden="true"
              >
                <span className="flex w-full items-center justify-center gap-2">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  Continue with Google
                </span>
              </Button>
              <div className="absolute inset-0">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setServerError('Google sign-in was cancelled or failed.')}
                  type="standard"
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  text="continue_with"
                  logo_alignment="center"
                  containerProps={{ style: { width: '100%', height: '100%', opacity: 0 } }}
                />
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled
              title="Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-hairline bg-control text-base font-medium text-fg-muted opacity-60"
            >
              <Icon name="account_circle" className="text-base" />
              Continue with Google
            </button>
          )}
        </div>

        <p className="mt-8 text-center text-base text-fg-muted">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <Link
            to={isRegister ? '/signin' : '/register'}
            className="font-semibold text-brand-fg hover:underline"
          >
            {isRegister ? 'Sign in' : 'Create one'}
          </Link>
        </p>
      </div>
    </div>
  )
}
