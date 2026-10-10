import { NavLink } from 'react-router-dom'

/**
 * Desktop navigation rail.
 *
 * Structural only: it renders a route list and chrome, and holds no business
 * logic. Every Context value it needs (user, connected rails) arrives as a prop
 * from `pages/AuthenticatedLayout.jsx`, which is the only place chrome may read
 * global state.
 *
 * Theme and sign-out live in the top header (`Navbar`); the rail's foot shows the
 * connected bank rails, mirroring the reference sidebar.
 *
 * @param {object} props
 * @param {Array<{ to: string, label: string, icon: string }>} props.links
 * @param {Array<{ id: string, name: string, currency: string, last4?: string, status?: string }>} [props.rails]
 * @param {{ name: string, email: string }} [props.user]
 */
export default function Sidebar({ links, rails = [], user }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-hairline bg-card px-4 py-6 lg:flex">
      <div className="flex items-center gap-2.5 px-2">
        <span aria-hidden="true" className="grid size-9 place-items-center rounded-xl bg-brand text-fg-on-brand">
          <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-fg">Vault</p>
          <p className="truncate text-xs text-fg-muted">Personal finance OS</p>
        </div>
      </div>

      <nav className="flex-1" aria-label="Main">
        <ul className="flex flex-col gap-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-subtle text-brand-fg'
                      : 'text-fg-muted hover:bg-hover hover:text-fg'
                  }`
                }
              >
                <span aria-hidden="true" className="material-symbols-outlined text-lg">
                  {link.icon}
                </span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col gap-3 border-t border-hairline pt-4">
        {rails.length > 0 && (
          <div>
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-fg-faint">
              Connected rails
            </p>
            <ul className="flex flex-col gap-0.5">
              {rails.map((rail) => (
                <li
                  key={rail.id}
                  className="flex items-center justify-between gap-2 px-2 py-1 text-xs text-fg-muted"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`size-2 shrink-0 rounded-full ${
                        rail.status === 'degraded' ? 'bg-warning' : 'bg-positive'
                      }`}
                    />
                    <span className="truncate">{rail.name}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-fg-faint">
                    {rail.last4 ? `..${rail.last4}` : rail.currency}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {user && (
          <div className="flex items-center gap-2.5 rounded-xl bg-surface-soft px-3 py-2.5">
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-fg-on-brand"
            >
              {user.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-fg">{user.name}</p>
              <p className="truncate text-xs text-fg-muted">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
