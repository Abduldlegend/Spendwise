import { formatPercent } from '../../utils/format'

/**
 * Headline number with an optional month-over-month delta.
 *
 * All monetary output uses `tabular-nums` and 2 decimal places
 * (`docs/DESIGN.md`). The caller passes the already-formatted string so this
 * component stays free of currency logic.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.value pre-formatted, e.g. '₦1,250,000.00'
 * @param {string} [props.hint] secondary line under the value
 * @param {number|null} [props.delta] ratio, e.g. 0.082 for +8.2%
 * @param {'auto'|'up'|'down'} [props.deltaTone='auto'] which direction reads as good
 * @param {import('react').ReactNode} [props.icon] Material Symbols glyph name
 * @param {boolean} [props.tone='default'] 'default' | 'accent'
 * @param {import('react').ReactNode} [props.children] optional controls under the value
 */
export default function MetricCard({
  label,
  value,
  hint,
  delta,
  deltaTone = 'auto',
  icon,
  tone = 'default',
  children,
}) {
  const hasDelta = delta !== undefined && delta !== null && Number.isFinite(delta)
  const rising = hasDelta && delta > 0
  const flat = hasDelta && delta === 0

  // A rise in spend is bad; a rise in inflow is good. `deltaTone` lets each call
  // site declare which way is up instead of hard-coding colour here.
  const positive = deltaTone === 'up' ? rising : deltaTone === 'down' ? !rising : rising
  const deltaColor = !hasDelta || flat ? 'text-fg-muted' : positive ? 'text-positive-fg' : 'text-negative-fg'
  const arrow = flat ? 'east' : rising ? 'north_east' : 'south_east'

  return (
    <article
      className={`flex min-w-0 flex-col gap-3 rounded-xl border border-hairline p-4 ${
        tone === 'accent' ? 'bg-brand-subtle border-brand-border' : 'bg-card'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-fg-muted">{label}</p>
        {icon && (
          <span aria-hidden="true" className="material-symbols-outlined text-lg text-fg-faint">
            {icon}
          </span>
        )}
      </div>

      <p className="break-words text-xl font-semibold tabular-nums text-fg sm:text-2xl">{value}</p>

      <div className="flex items-center gap-2 text-xs">
        {hasDelta && (
          <span className={`inline-flex items-center gap-1 font-semibold tabular-nums ${deltaColor}`}>
            <span aria-hidden="true" className="material-symbols-outlined text-sm">
              {arrow}
            </span>
            {formatPercent(delta)}
          </span>
        )}
        {hint && <span className="truncate text-fg-muted">{hint}</span>}
      </div>

      {children}
    </article>
  )
}
