import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Button'
import { isMockApiEnabled } from '../../config'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { ADMIN_NAV, ADMIN_SECURITY_NAV, getAdminMeta, LIVE_API_HINT } from './adminNav'

/**
 * The Ops Console chrome.
 *
 * Separate from the consumer `AuthenticatedLayout`: denser type, sharper radii,
 * a persistent sidebar and an explicit zero-knowledge privacy footer. It is the
 * only admin component allowed to read Auth/Theme context.
 */
export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const { resolvedTheme, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  // The console is intentionally live-API only: the MSW mock cannot serve macro
  // platform telemetry and must never pretend to.
  if (isMockApiEnabled) return <LiveApiRequired />

  const meta = getAdminMeta(location.pathname)
  const initials = (user?.name ?? user?.email ?? 'OP')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin', { replace: true })
  }

  return (
    <div className="flex min-h-dvh bg-surface text-fg">
      {navOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-hairline bg-card transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="overflow-y-auto p-3">
          <Link to="/admin" className="flex items-center gap-2 px-2 py-2" onClick={() => setNavOpen(false)}>
            <span className="grid size-8 place-items-center rounded-md bg-brand text-fg-on-brand">
              <Icon name="account_balance" className="text-[18px]" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Vault</span>
            <span className="rounded-sm bg-brand-subtle px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest text-brand-fg">
              Ops v2.4
            </span>
          </Link>

          <p className="px-2 pb-2 pt-4 font-mono text-[10px] uppercase tracking-widest text-fg-faint">
            Core Operations
          </p>
          <nav aria-label="Ops console" className="flex flex-col gap-0.5">
            {ADMIN_NAV.map((screen) => (
              <AdminNavLink key={screen.to} screen={screen} onNavigate={() => setNavOpen(false)} />
            ))}
          </nav>

          <p className="px-2 pb-2 pt-5 font-mono text-[10px] uppercase tracking-widest text-fg-faint">
            Emergency &amp; Security
          </p>
          <nav aria-label="Security" className="flex flex-col gap-0.5">
            {ADMIN_SECURITY_NAV.map((screen) => (
              <AdminNavLink key={screen.to} screen={screen} onNavigate={() => setNavOpen(false)} />
            ))}
          </nav>
        </div>

        <div className="border-t border-hairline p-3">
          <div className="rounded-md border border-hairline bg-surface-soft p-3">
            <p className="flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-wider text-brand-fg">
              <Icon name="encrypted" className="text-[14px]" />
              Privacy lock active
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-fg-muted">
              User transactions, balances and budgets are never exposed here. The console renders macro
              telemetry and per-account counts only.
            </p>
            <p className="mt-2 border-t border-hairline-soft pt-1.5 font-mono text-[9px] text-fg-faint">
              Node: ops-live | TLS 1.3
            </p>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-hairline bg-card px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label="Open navigation"
              className="grid size-8 place-items-center rounded-md border border-hairline text-fg-muted hover:text-fg lg:hidden"
              onClick={() => setNavOpen(true)}
            >
              <Icon name="menu" className="text-[18px]" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{meta.title}</p>
              <p className="hidden truncate text-[11px] text-fg-muted sm:block">{meta.description}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-sm border border-hairline bg-surface-soft px-2 py-1 font-mono text-[10px] text-fg-muted xl:inline-flex">
              <span className="size-1.5 rounded-full bg-positive" />
              Super Admin — Tier 3
            </span>
            <span className="hidden items-center gap-1 rounded-sm border border-hairline bg-surface-soft px-2 py-1 font-mono text-[10px] text-fg-muted 2xl:inline-flex">
              <Icon name="security" className="text-[13px] text-brand-fg" />
              Zero-Knowledge Ledger Policy
            </span>

            <button
              type="button"
              aria-label="Toggle theme"
              onClick={toggle}
              className="grid size-8 place-items-center rounded-md border border-hairline text-fg-muted transition-colors hover:bg-hover hover:text-fg"
            >
              <Icon name={resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'} className="text-[18px]" />
            </button>

            <div className="flex items-center gap-2 border-l border-hairline pl-2">
              <span className="grid size-7 place-items-center rounded-md bg-brand-subtle font-mono text-[11px] font-semibold text-brand-fg">
                {initials}
              </span>
              <div className="hidden text-left xl:block">
                <p className="text-xs font-medium leading-none">{user?.name ?? 'Ops staff'}</p>
                <p className="mt-0.5 font-mono text-[10px] text-fg-faint">SecOps Staff</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline px-2 text-xs font-semibold text-fg-muted transition-colors hover:border-negative hover:text-negative-fg"
            >
              <Icon name="logout" className="text-[16px]" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 bg-surface p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function AdminNavLink({ screen, onNavigate }) {
  return (
    <NavLink
      to={screen.to}
      end={screen.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors ${
          isActive ? 'bg-brand-subtle text-brand-fg' : 'text-fg-muted hover:bg-hover hover:text-fg'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon name={screen.icon} className={`text-[18px] ${isActive ? 'text-brand-fg' : 'text-fg-faint'}`} />
          <span>{screen.label}</span>
        </>
      )}
    </NavLink>
  )
}

function LiveApiRequired() {
  return (
    <div className="grid min-h-dvh place-items-center bg-surface p-6">
      <div className="w-full max-w-lg rounded-lg border border-hairline bg-card p-6">
        <span className="grid size-11 place-items-center rounded-md bg-warning-subtle text-warning-fg">
          <Icon name="database" className="text-2xl" />
        </span>
        <h1 className="mt-4 text-xl font-semibold">Live API required</h1>
        <p className="mt-2 text-sm text-fg-muted">
          The Ops Console reads real platform telemetry and privileged user metadata. The bundled mock
          API cannot serve it, so this surface is disabled while MSW is active.
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          Point the frontend at the server
        </p>
        <pre className="mt-2 overflow-x-auto rounded-md border border-hairline bg-surface-soft p-3 font-mono text-xs text-fg">
          VITE_API_BASE_URL={LIVE_API_HINT}
        </pre>
        <p className="mt-2 text-xs text-fg-muted">
          Add that to <code className="font-mono">Frontend/.env.local</code>, start{' '}
          <code className="font-mono">server/</code>, then restart <code className="font-mono">npm run dev</code>.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/dashboard"
            className="inline-flex h-9 items-center rounded-md bg-brand px-3 text-xs font-semibold text-fg-on-brand hover:bg-brand-hover"
          >
            Back to the app
          </Link>
          <Link
            to="/signin"
            className="inline-flex h-9 items-center rounded-md border border-hairline px-3 text-xs font-semibold text-fg-muted hover:text-fg"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
