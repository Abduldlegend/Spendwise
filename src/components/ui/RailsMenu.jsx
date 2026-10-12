import { useEffect, useRef, useState } from 'react'
import RailList from './RailList'

/**
 * Rails switcher: a trigger button that opens the connected rails and their
 * balances. Selecting a row reports the rail through `onSelectRail`.
 *
 * Presentational — data and callbacks arrive as props; only the open/closed
 * disclosure state is local. Shared by the desktop header and, on mobile, the
 * Net balance card.
 *
 * @param {object} props
 * @param {Array<object>} [props.rails]
 * @param {(rail: object) => void} [props.onSelectRail]
 * @param {string} [props.className] extra classes on the wrapper
 */
export default function RailsMenu({ rails = [], onSelectRail, className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const handleSelect = (rail) => {
    setOpen(false)
    onSelectRail?.(rail)
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
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

      {open && (
        <div
          role="menu"
          className="fixed inset-x-3 top-16 z-40 max-h-[70vh] overflow-y-auto rounded-xl border border-hairline bg-card p-2 shadow-popover-light dark:shadow-popover-dark sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-none sm:w-72"
        >
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-wider text-fg-faint">
            Connected rails
          </p>
          {rails.length > 0 ? (
            <RailList variant="menu" rails={rails} onSelectRail={handleSelect} />
          ) : (
            <p className="px-3 py-2 text-sm text-fg-muted">No rails connected yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
