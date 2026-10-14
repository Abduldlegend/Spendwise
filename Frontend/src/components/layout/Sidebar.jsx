import { NavLink } from 'react-router-dom'
import BrandMark from '../ui/BrandMark'
import RailList from '../ui/RailList'

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
 * @param {Array<{ id: string, name: string, currency: string, last4?: string, status?: string, balance?: number }>} [props.rails]
 * @param {{ name: string, email: string }} [props.user]
 * @param {(rail: object) => void} [props.onSelectRail]
 */
export default function Sidebar({ links, rails = [], user, onSelectRail }) {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-hairline bg-card px-4 py-6 lg:flex">
      <div className="px-2">
        <BrandMark to="/dashboard" />
        <p className="mt-1.5 truncate text-xs text-fg-muted">Personal finance OS</p>
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
            <RailList rails={rails} onSelectRail={onSelectRail} />
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
