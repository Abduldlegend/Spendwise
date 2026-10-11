import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Card from '../components/ui/Card'
import PageContainer from '../components/layout/PageContainer'
import { Button } from '../components/ui/Button'
import ConnectRailForm from '../components/forms/ConnectRailForm'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { BASE_CURRENCY, CURRENCY_META, MAX_RAILS, THEMES } from '../schemas/enums'
import { userSchema } from '../schemas/milestone'

/**
 * Settings.
 *
 * The theme control is local-only (Context + localStorage, never sent to the
 * API, per AGENTS.md); the profile form goes through the optimistic write path.
 */
export default function SettingsPage() {
  const { user, rails, updateProfile, connectRail, disconnectRail, currency } = useData()
  const { theme, setTheme } = useTheme()
  const { signOut } = useAuth()
  const [connecting, setConnecting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(userSchema),
    values: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      kycTier: user?.kycTier ?? 1,
      kycLimit: user?.kycLimit ?? 0,
    },
  })

  const onSubmit = async (values) => {
    try {
      await updateProfile(values)
    } catch {
      /* rolled back and toasted by the Context */
    }
  }

  const handleConnect = async (values) => {
    setConnecting(true)
    try {
      await connectRail(values)
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async (id) => {
    try {
      await disconnectRail(id)
    } catch {
      /* rolled back and toasted by the Context */
    }
  }

  return (
    <PageContainer title="Settings" width="md">
      <div className="flex flex-col gap-4">
        <Card title="Profile" subtitle="How your name and limits are recorded">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Full name</span>
                <input type="text" className={inputClass(errors.name)} {...register('name')} />
                {errors.name && (
                  <span role="alert" className="text-xs font-medium text-negative-fg">
                    {errors.name.message}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Email</span>
                <input type="email" className={inputClass(errors.email)} {...register('email')} />
                {errors.email && (
                  <span role="alert" className="text-xs font-medium text-negative-fg">
                    {errors.email.message}
                  </span>
                )}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Base currency</span>
                <p className="flex h-10 items-center rounded-lg border border-hairline bg-control px-3 text-sm text-fg">
                  {BASE_CURRENCY} · {CURRENCY_META[BASE_CURRENCY].label}
                </p>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">KYC limit</span>
                <input
                  type="number"
                  className={inputClass(errors.kycLimit)}
                  {...register('kycLimit')}
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-hairline-soft pt-4">
              {isDirty && <span className="text-xs text-fg-muted">Unsaved changes</span>}
              <Button variant="primary" type="submit" disabled={!isDirty}>
                Save profile
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Appearance" subtitle="Stored locally on this device">
          <fieldset>
            <legend className="sr-only">Theme</legend>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTheme(option)}
                  aria-pressed={theme === option}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    theme === option
                      ? 'border-brand bg-brand-subtle text-brand-fg'
                      : 'border-hairline text-fg-muted hover:border-hairline-strong hover:text-fg'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
          <p className="mt-3 text-xs text-fg-muted">
            Theme is never sent to the API — it stays in localStorage.
          </p>
        </Card>

        <Card title="Connected rails" subtitle="Clearing sources available to the ledger">
          <div className="flex items-center justify-between gap-3 pb-1">
            <p className="text-xs text-fg-muted">
              {rails.length} of {MAX_RAILS} connected
            </p>
            {rails.length >= MAX_RAILS && (
              <p className="text-xs font-medium text-warning-fg">Rail limit reached</p>
            )}
          </div>

          <ul className="flex flex-col divide-y divide-hairline-soft">
            {rails.map((rail) => (
              <li key={rail.id} className="flex items-center gap-3 py-3">
                <span
                  aria-hidden="true"
                  className={`size-2 shrink-0 rounded-full ${
                    rail.status === 'connected'
                      ? 'bg-positive'
                      : rail.status === 'degraded'
                        ? 'bg-warning'
                        : 'bg-negative'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">{rail.name}</p>
                  <p className="truncate text-xs capitalize text-fg-muted">
                    {rail.kind} · {rail.currency}
                    {rail.last4 && ` •••• ${rail.last4}`}
                  </p>
                </div>
                <span className="shrink-0 text-xs capitalize text-fg-muted">{rail.status}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDisconnect(rail.id)}
                  aria-label={`Disconnect ${rail.name}`}
                >
                  Disconnect
                </Button>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t border-hairline-soft pt-4">
            {rails.length >= MAX_RAILS ? (
              <p className="text-sm text-fg-muted">
                You have reached the limit of {MAX_RAILS} rails. Disconnect one to connect another.
              </p>
            ) : (
              <>
                <p className="pb-3 text-sm font-medium text-fg">Connect a rail</p>
                <ConnectRailForm onSubmit={handleConnect} isSubmitting={connecting} />
              </>
            )}
          </div>
        </Card>

        <Card title="Session" subtitle={`Signed in as ${user?.email ?? 'guest'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-fg-muted">
              Figures are shown in <span className="font-semibold text-fg">{currency}</span>. Derived values are
              recalculated on every render and never stored.
            </p>
            <Button variant="secondary" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}

function inputClass(error) {
  return `h-10 w-full rounded-lg border bg-control px-3 text-sm text-fg focus:outline-none ${
    error ? 'border-negative focus:border-negative' : 'border-hairline focus:border-brand'
  }`
}
