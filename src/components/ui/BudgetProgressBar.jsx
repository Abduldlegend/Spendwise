/**
 * Envelope progress bar with a health state.
 *
 * The thresholds live in `utils/derived` (`BUDGET_THRESHOLDS`); the colours are
 * mapped here so the same state renders identically everywhere.
 *
 * @param {object} props
 * @param {number} props.ratio spent / allocated
 * @param {'healthy'|'warning'|'critical'|'locked'} [props.state] pre-computed health state
 * @param {boolean} [props.over=false] render the over-budget treatment
 * @param {string} [props.label] accessible name
 * @param {boolean} [props.showOverhang=true] draw the overflow segment
 */
export default function BudgetProgressBar({ ratio, state = 'healthy', over = false, label, showOverhang = true }) {
  const percent = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0)) * 100
  const overflow = Math.max(0, (Number.isFinite(ratio) ? ratio : 0) - 1) * 100

  const fill = {
    healthy: 'bg-brand',
    warning: 'bg-warning',
    critical: 'bg-negative',
    locked: 'bg-negative',
  }[state] ?? 'bg-brand'

  // The two `style` props below are the only inline styles in the app: a
  // percentage is arbitrary at runtime and cannot be expressed as a static
  // Tailwind class. Everything else stays utility-only per AGENTS.md.
  return (
    <div
      className="h-2 w-full min-w-0 overflow-hidden rounded-full bg-track"
      role="progressbar"
      aria-valuenow={Math.round(percent)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={over ? `${Math.round(percent)}% of budget used, over budget` : `${Math.round(percent)}% of budget used`}
      aria-label={label ?? 'Budget used'}
    >
      <div className="flex h-full w-full">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${fill}`}
          style={{ width: `${percent}%` }}
        />
        {showOverhang && overflow > 0 && (
          <div
            className="h-full border-l-2 border-card bg-negative/40"
            style={{ width: `${Math.min(overflow, 100)}%` }}
            title={`${Math.round(overflow)}% over budget`}
          />
        )}
      </div>
    </div>
  )
}
