import { useEffect, useRef, useState } from 'react'
import BrandMark from '../ui/BrandMark'
import RailList from '../ui/RailList'

/**
 * Top bar, matching the reference system header.
 *
 * Desktop shows the active screen's title and description; on mobile it collapses
 * to the brand plus a time-of-day greeting. The right cluster holds the quick
 * Deposit / Spend actions and the account controls; section navigation lives in
 * `BottomNav` below `lg` and in the sidebar from `lg` up.
 *
 * Icon controls are sized to stay on one line down to the smallest phone.
 *
 * Structure only — every value and callback arrives via props; the rails
 * switcher keeps only its own open/closed disclosure state.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {string} [props.greeting] e.g. "Good morning, Dami" (mobile only)
 * @param {() => void} [props.onDeposit]
 * @param {() => void} [props.onSpend]
 * @param {() => void} [props.onSignOut]
 * @param {() => void} [props.onToggleTheme]
 * @param {boolean} [props.dark=false]
 * @param {number} [props.notificationCount=0]
 * @param {() => void} [props.onNotifications]
 * @param {Array<{ id: string, name: string, kind: string, currency: string,
 *   last4?: string, status?: string, balance?: number }>} [props.rails]
 * @param {(rail: object) => void} [props.onSelectRail]
 */
export default function Navbar({
  title,
  description,
  greeting,
  onDeposit,
  onSpend,
  onSignOut,
  onToggleTheme,
  dark = false,
  notificationCount = 0,
  onNotifications,
  rails = [],
  onSelectRail,
}) {
  const [railsOpen, setRailsOpen] = useState(false)
  const railsRef = useRef(null)

  useEffect(() => {
    if (!railsOpen) return undefined
    const onPointerDown = (event) => {
      if (railsRef.current && !railsRef.current.contains(event.target)) setRailsOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setRailsOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [railsOpen])

  const handleSelectRail = (rail) => {
    setRailsOpen(false)
    onSelectRail?.(rail)
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-hairline bg-surface/90 px-3 py-2.5 backdrop-blur sm:gap-4 sm:px-6 sm:py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="min-w-0 lg:hidden">
          <BrandMark to="/dashboard" />
          {greeting && <p className="mt-0.5 truncate text-[11px] font-medium text-fg-muted">{greeting}</p>}
        </div>

        <div className="hidden min-w-0 lg:block">
          <h1 className="truncate text-lg font-semibold tracking-tight text-fg">{title}</h1>
          {description && <p className="truncate text-xs text-fg-muted">{description}</p>}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
        {onSelectRail && (
          <div className="relative" ref={railsRef}>
            <button
              type="button"
              onClick={() => setRailsOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={railsOpen}
              title="Connected rails"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-hairline bg-card px-2 text-xs font-semibold text-fg-muted transition-colors hover:bg-hover hover:text-fg"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">
                account_balance_wallet
              </span>
              <span className="hidden sm:inline">Rails</span>
              {rails.length > 0 && (
                <span className="rounded-full bg-brand-subtle px-1.5 font-mono text-[10px] font-semibold text-brand-fg">
                  {rails.length}
                </span>
              )}
            </button>

            {railsOpen && (
              <div
                role="menu"
                className="fixed inset-x-3 top-16 z-40 max-h-[70vh] overflow-y-auto rounded-xl border border-hairline bg-card p-2 shadow-popover-light dark:shadow-popover-dark sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-none sm:w-72"
              >
                <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-fg-faint">
                  Connected rails
                </p>
                {rails.length > 0 ? (
                  <RailList variant="menu" rails={rails} onSelectRail={handleSelectRail} />
                ) : (
                  <p className="px-3 py-2 text-sm text-fg-muted">No rails connected yet.</p>
                )}
              </div>
            )}
          </div>
        )}

        {(onDeposit || onSpend) && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onDeposit && (
              <button
                type="button"
                onClick={onDeposit}
                aria-label="Record deposit"
                className="inline-flex h-8 w-8 items-center justify-center gap-1.5 rounded-lg bg-brand px-0 text-xs font-semibold text-fg-on-brand transition-colors hover:bg-brand-hover sm:w-auto sm:px-3"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">
                  add
                </span>
                <span className="hidden sm:inline">Deposit</span>
              </button>
            )}
            {onSpend && (
              <button
                type="button"
                onClick={onSpend}
                aria-label="Record spend"
                className="inline-flex h-8 w-8 items-center justify-center gap-1.5 rounded-lg border border-hairline bg-card px-0 text-xs font-semibold text-fg transition-colors hover:bg-hover sm:w-auto sm:px-3"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base text-negative-fg">
                  remove
                </span>
                <span className="hidden sm:inline">Spend</span>
              </button>
            )}
          </div>
        )}

        {(onSignOut || onToggleTheme || onNotifications) && (
          <div className="flex items-center gap-0.5 border-hairline pl-1 sm:gap-1 sm:border-l sm:pl-2">
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                title="Sign out"
                aria-label="Sign out"
                className="grid size-8 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-hover hover:text-fg"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">
                  logout
                </span>
              </button>
            )}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="grid size-8 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-hover hover:text-fg"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">
                  {dark ? 'light_mode' : 'dark_mode'}
                </span>
              </button>
            )}
            {onNotifications && (
              <button
                type="button"
                onClick={onNotifications}
                title="Alerts & activity"
                aria-label={
                  notificationCount > 0
                    ? `Alerts and activity, ${notificationCount} unread`
                    : 'Alerts and activity'
                }
                className="relative grid size-8 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-hover hover:text-fg"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">
                  notifications
                </span>
                {notificationCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-negative ring-2 ring-surface" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
