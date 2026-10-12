import { formatCurrency } from '../../utils/format'

/**
 * Presentational balance card for a single rail, rendered inside the rail-details
 * modal. It only formats the values it is given — no Context, no fetching.
 *
 * @param {object} props
 * @param {{ name: string, kind: string, currency: string, last4?: string,
 *   status?: string, balance?: number }} props.rail
 */
export default function RailBalanceCard({ rail }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-soft p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Available balance</p>
      <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-fg">
        {formatCurrency(rail.balance ?? 0, rail.currency)}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-muted">
        <span className="capitalize">{rail.kind}</span>
        {rail.last4 && <span className="font-mono">•••• {rail.last4}</span>}
        <span aria-hidden="true">·</span>
        <span className="capitalize">{rail.status ?? 'connected'}</span>
      </div>
    </div>
  )
}
