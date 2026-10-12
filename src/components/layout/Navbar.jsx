import BrandMark from '../ui/BrandMark'
import RailsMenu from '../ui/RailsMenu'

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
 * Structure only — every value and callback arrives via props. Below `lg` the
 * quick actions move into the Net balance card so the header stays uncluttered.
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
          <RailsMenu rails={rails} onSelectRail={onSelectRail} className="hidden lg:block" />
        )}

        {(onDeposit || onSpend) && (
          <div className="hidden items-center gap-1.5 sm:gap-2 lg:flex">
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
                className="hidden size-8 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-hover hover:text-fg lg:grid"
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
