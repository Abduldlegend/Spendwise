import { ACCENT_CLASSES, CATEGORY_ACCENTS } from '../../utils/categories'
import { formatCompact } from '../../utils/format'

/**
 * Segmented horizontal spend-distribution bar.
 *
 * Mirrors the prototype's stacked bar: one segment per category, widths from the
 * pre-computed `share`, and a legend rendered by the caller (or by `withLegend`).
 * Segments are interactive when `onSelect` is supplied, which is what the
 * dashboard uses to drive the category filter.
 *
 * @param {object} props
 * @param {Array<{ category: string, amount: number, share: number }>} props.segments
 * @param {string} [props.currency='NGN']
 * @param {(category: string) => void} [props.onSelect]
 * @param {boolean} [props.withLegend=false]
 * @param {string} [props.totalLabel]
 */
export default function SpendingDistributionBar({
  segments = [],
  currency = 'NGN',
  onSelect,
  withLegend = false,
  totalLabel,
}) {
  const total = segments.reduce((sum, segment) => sum + segment.amount, 0)

  if (segments.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <div className="h-3 w-full rounded-full bg-track" />
        <p className="text-sm text-fg-muted">No spending recorded this cycle yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-track">
        {segments.map((segment) => {
          const role = CATEGORY_ACCENTS[segment.category] ?? 'neutral-muted'
          const accent = ACCENT_CLASSES[role]
          const isInteractive = Boolean(onSelect)

          const content = (
            <span
              className={`block h-full ${accent.dot} ${isInteractive ? 'transition-opacity hover:opacity-80' : ''}`}
              // Dynamic width — see the note in BudgetProgressBar.
              style={{ width: `${Math.max(segment.share * 100, 1)}%` }}
            />
          )

          if (!isInteractive) {
            return (
              <span key={segment.category} className="contents">
                {content}
              </span>
            )
          }

          return (
            <button
              key={segment.category}
              type="button"
              onClick={() => onSelect(segment.category)}
              className="group h-full"
              title={`${segment.category}: ${formatCompact(segment.amount, currency)}`}
            >
              {content}
            </button>
          )
        })}
      </div>

      {withLegend && (
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-2">
          {segments.map((segment) => {
            const role = CATEGORY_ACCENTS[segment.category] ?? 'neutral-muted'
            const accent = ACCENT_CLASSES[role]
            return (
              <li key={segment.category} className="flex items-center gap-2 text-xs">
                <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${accent.dot}`} />
                <span className="min-w-0 truncate text-fg-muted capitalize">{segment.category}</span>
                <span className="ml-auto shrink-0 font-semibold tabular-nums text-fg sm:ml-0">
                  {formatCompact(segment.amount, currency)}
                </span>
              </li>
            )
          })}
        </ul>
      )}

      {totalLabel && (
        <p className="text-xs text-fg-muted">
          {totalLabel} <span className="font-semibold tabular-nums text-fg">{formatCompact(total, currency)}</span>
        </p>
      )}
    </div>
  )
}
