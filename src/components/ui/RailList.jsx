import { formatCompact } from '../../utils/format'

const STATUS_DOT = {
  connected: 'bg-positive',
  degraded: 'bg-warning',
  offline: 'bg-negative',
}

/**
 * Presentational list of connected rails showing each derived balance. Every row
 * is a button that reports the clicked rail to `onSelectRail`.
 *
 * Reads no Context and fetches nothing — all data and callbacks arrive as props,
 * so it renders in tests with plain objects.
 *
 * @param {object} props
 * @param {Array<{ id: string, name: string, kind: string, currency: string,
 *   last4?: string, status?: string, balance?: number }>} props.rails
 * @param {(rail: object) => void} [props.onSelectRail]
 * @param {'sidebar'|'menu'} [props.variant='sidebar']
 */
export default function RailList({ rails = [], onSelectRail, variant = 'sidebar' }) {
  if (rails.length === 0) return null
  const isMenu = variant === 'menu'

  return (
    <ul className="flex flex-col gap-0.5">
      {rails.map((rail) => (
        <li key={rail.id}>
          <button
            type="button"
            onClick={() => onSelectRail?.(rail)}
            className={`flex w-full items-center justify-between gap-3 rounded-lg text-left transition-colors hover:bg-hover ${
              isMenu ? 'px-3 py-2.5' : 'px-2 py-1.5'
            }`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className={`size-2 shrink-0 rounded-full ${STATUS_DOT[rail.status] ?? 'bg-positive'}`}
              />
              <span className="min-w-0">
                <span className={`block truncate text-fg ${isMenu ? 'text-sm font-medium' : 'text-xs'}`}>
                  {rail.name}
                </span>
                {isMenu && (
                  <span className="block truncate text-xs capitalize text-fg-muted">
                    {rail.kind}
                    {rail.last4 ? ` •••• ${rail.last4}` : ''}
                  </span>
                )}
              </span>
            </span>
            <span
              className={`shrink-0 font-mono tabular-nums text-fg-muted ${isMenu ? 'text-xs' : 'text-[11px]'}`}
            >
              {formatCompact(rail.balance ?? 0, rail.currency)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
