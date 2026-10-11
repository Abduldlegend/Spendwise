import { useState } from 'react'
import { Link } from 'react-router-dom'
import BrandMark from '../ui/BrandMark'
import Container from './Container'
import { LANDING_NAV } from './content'
import { useTheme } from '../../context/ThemeContext'

/** Header theme switch — the glyph reflects the resolved theme. */
function ThemeToggle({ dark, onToggle, className = '' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`grid size-9 place-items-center rounded-lg border border-hairline text-fg-muted transition-colors hover:bg-hover hover:text-fg ${className}`}
    >
      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
        {dark ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  )
}

/**
 * Landing top bar.
 *
 * Brand, in-page anchors, a theme switch and the two auth entry points. Below
 * `md` the anchors fold into a disclosure menu. The theme control is the app's
 * shared `ThemeContext`, so the landing and the product stay in sync.
 */
export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { resolvedTheme, toggle } = useTheme()
  const dark = resolvedTheme === 'dark'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-surface/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <BrandMark withBadge />

        <nav className="hidden items-center gap-7 text-sm font-medium text-fg-muted md:flex">
          {LANDING_NAV.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-brand">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle dark={dark} onToggle={toggle} />
          <Link
            to="/signin"
            className="rounded-lg border border-hairline px-3.5 py-1.5 text-sm font-medium text-fg transition-colors hover:bg-hover"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-fg-on-brand transition-colors hover:bg-brand-hover"
          >
            Get started
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle dark={dark} onToggle={toggle} />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            className="grid size-9 place-items-center rounded-lg text-fg"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-2xl">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </Container>

      {menuOpen && (
        <div className="border-t border-hairline bg-card px-4 pb-6 pt-3 md:hidden">
          <nav className="flex flex-col">
            {LANDING_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-hover hover:text-brand"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-hairline pt-3">
            <Link
              to="/signin"
              onClick={() => setMenuOpen(false)}
              className="w-full rounded-lg border border-hairline py-2 text-center text-sm font-medium text-fg"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="w-full rounded-lg bg-brand py-2 text-center text-sm font-medium text-fg-on-brand"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
