import { PREVIEW_METRICS, PREVIEW_ROWS, PREVIEW_SEGMENTS } from './content'

const VALUE_TONE = {
  fg: 'text-fg',
  brand: 'text-brand',
  negative: 'text-negative',
}

const NOTE_TONE = {
  muted: 'text-fg-muted',
  brand: 'text-brand',
  negative: 'text-negative',
}

/** Segmented-bar fills keyed by the semantic tone. */
const FILL = {
  brand: 'bg-brand',
  negative: 'bg-negative',
  muted: 'bg-fg-muted',
  outline: 'bg-hairline-strong',
}

const CATEGORY_BADGE = {
  brand: 'border-brand/20 bg-brand/10 text-brand',
  negative: 'border-negative/20 bg-negative/10 text-negative',
  muted: 'border-hairline bg-hairline/40 text-fg-muted',
}

/** One of the four institutional metric tiles. */
function PreviewMetric({ metric }) {
  const iconTone = metric.valueTone === 'negative' ? 'text-negative' : 'text-brand'

  return (
    <div className="rounded-lg border border-hairline bg-card p-3.5 sm:p-4">
      <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wider text-fg-muted">
        <span>{metric.label}</span>
        <span aria-hidden="true" className={`material-symbols-outlined text-[16px] ${iconTone}`}>
          {metric.icon}
        </span>
      </div>
      <div
        className={`mt-2 font-mono text-lg font-semibold tracking-tight tabular-nums sm:text-xl md:text-2xl ${VALUE_TONE[metric.valueTone]}`}
      >
        {metric.value}
      </div>
      {metric.noteLeft ? (
        <div className={`mt-1 flex items-center justify-between font-mono text-[11px] ${NOTE_TONE[metric.noteTone]}`}>
          <span>{metric.noteLeft}</span>
          <span className="font-bold">{metric.noteRight}</span>
        </div>
      ) : (
        <div className={`mt-1 flex items-center gap-1 font-mono text-[11px] ${NOTE_TONE[metric.noteTone]}`}>
          {metric.noteIcon && (
            <span aria-hidden="true" className="material-symbols-outlined text-[13px]">
              {metric.noteIcon}
            </span>
          )}
          <span>{metric.note}</span>
        </div>
      )}
    </div>
  )
}

/**
 * The hero's mock product window: a title bar, the four-metric strip, a
 * segmented category bar, an envelope warning and a dense ledger table.
 *
 * Entirely static — it is a visual affordance, not a live dashboard.
 */
export default function DashboardPreview() {
  return (
    <div
      id="preview"
      className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-xl border border-hairline bg-card shadow-lg md:mt-16"
    >
      <div className="flex items-center justify-between border-b border-hairline bg-panel px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-hairline-strong" />
          <span className="size-2.5 rounded-full bg-hairline-strong" />
          <span className="size-2.5 rounded-full bg-hairline-strong" />
          <span className="ml-3 font-mono text-[11px] text-fg-muted">
            spendwise-ledger // personal-workspace.sw
          </span>
        </div>
        <div className="flex items-center gap-2 rounded border border-brand/20 bg-brand/10 px-2 py-0.5 font-mono text-xs text-brand">
          <span className="size-1.5 rounded-full bg-brand" />
          <span>STATE: BALANCED</span>
        </div>
      </div>

      <div className="space-y-6 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {PREVIEW_METRICS.map((metric) => (
            <PreviewMetric key={metric.id} metric={metric} />
          ))}
        </div>

        <div className="space-y-3 rounded-lg border border-hairline bg-panel/60 p-4">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-medium text-fg">Category Outflow Velocity</span>
            <span className="text-fg-muted">₦680,450.00 logged</span>
          </div>
          <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-sm bg-track">
            {PREVIEW_SEGMENTS.map((segment) => (
              <div
                key={segment.label}
                className={`h-full ${FILL[segment.tone]}`}
                style={{ width: `${segment.pct}%` }}
                title={`${segment.label} (${segment.pct}%)`}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] sm:grid-cols-4">
            {PREVIEW_SEGMENTS.map((segment) => (
              <div key={segment.label} className="flex items-center gap-1.5">
                <span className={`size-2 rounded-xs ${FILL[segment.tone]}`} />
                <span className="text-fg-muted">
                  {segment.short}: {segment.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-negative/20 bg-negative-subtle p-3">
          <span aria-hidden="true" className="material-symbols-outlined mt-0.5 text-lg text-negative">
            warning
          </span>
          <div className="flex-1 text-xs">
            <div className="font-medium text-negative">Food &amp; Sustenance envelope at 86% capacity</div>
            <div className="mt-0.5 text-fg-muted">
              ₦190,500.00 spent of ₦220,000 monthly limit. 11 days remaining in cycle. Recommended burn
              ceiling: ₦2,680/day.
            </div>
          </div>
          <button
            type="button"
            className="rounded border border-negative/30 px-2 py-1 font-mono text-[11px] text-negative transition-colors hover:bg-negative/10"
          >
            Inspect
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-hairline">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-hairline bg-panel font-mono text-fg-muted">
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider">Timestamp</th>
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider">Entity &amp; Narrative</th>
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider">Category Envelope</th>
                <th className="px-3 py-2.5 font-medium uppercase tracking-wider">Channel</th>
                <th className="px-3 py-2.5 text-right font-medium uppercase tracking-wider">Magnitude</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {PREVIEW_ROWS.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-hover/60">
                  <td className="px-3 py-2.5 font-mono text-fg-muted">{row.timestamp}</td>
                  <td className="px-3 py-2.5 font-medium text-fg">{row.name}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex rounded border px-1.5 py-0.5 font-mono text-[10px] ${CATEGORY_BADGE[row.categoryTone]}`}
                    >
                      {row.category}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-fg-muted">{row.channel}</td>
                  <td
                    className={`px-3 py-2.5 text-right font-mono font-semibold tabular-nums ${
                      row.tone === 'brand' ? 'text-brand' : 'text-negative'
                    }`}
                  >
                    {row.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
