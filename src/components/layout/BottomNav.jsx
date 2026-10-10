import { NavLink } from 'react-router-dom'

/**
 * Bottom navigation bar, shown below `lg` (tablet + mobile) where the desktop
 * rail is hidden.
 *
 * Structural only — it renders a route list and holds no business logic. Mirrors
 * the reference's mobile tab bar (`ref/code.html`).
 *
 * @param {object} props
 * @param {Array<{ to: string, label: string, icon: string }>} props.links
 */
export default function BottomNav({ links }) {
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="flex items-stretch justify-around px-2 py-1">
        {links.map((link) => (
          <li key={link.to} className="flex-1">
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-brand-fg' : 'text-fg-muted hover:text-fg'
                }`
              }
            >
              <span aria-hidden="true" className="material-symbols-outlined text-lg">
                {link.icon}
              </span>
              <span className="max-w-full truncate">{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
