import { Icon } from '../../components/ui/Button'
import AdminPageHeader from './AdminPageHeader'

const PREVIEWS = [
  {
    code: '403',
    title: 'Access denied',
    body: 'Signed in, but the role claim is not admin. The attempt is recorded against the staff identity.',
    icon: 'gpp_bad',
    tone: 'negative',
  },
  {
    code: '404',
    title: 'Record not found',
    body: 'The requested account or category no longer exists. Offer a route back, never a dead end.',
    icon: 'search_off',
    tone: 'warning',
  },
  {
    code: '503',
    title: 'Telemetry degraded',
    body: 'The database is reachable but the aggregate query failed. Show the last good data and a retry action.',
    icon: 'cloud_off',
    tone: 'warning',
  },
  {
    code: 'EMPTY',
    title: 'No matching accounts',
    body: 'Filters produced an empty set. Keep the filter bar visible and offer a one-click reset.',
    icon: 'person_search',
    tone: 'neutral',
  },
]

/** Presentation standards for access and failure states. */
export default function AdminStatesPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <AdminPageHeader
        eyebrow="Interaction standards"
        title="Access & error states"
        description="How the console behaves when a request is forbidden, missing, degraded or empty."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {PREVIEWS.map((preview) => (
          <Preview key={preview.code} {...preview} />
        ))}
      </div>

      <section className="rounded-md border border-hairline bg-card p-4">
        <h2 className="text-sm font-semibold">Rules</h2>
        <ul className="mt-2 space-y-2 text-[11px] leading-relaxed text-fg-muted">
          <li className="flex gap-2">
            <Icon name="chevron_right" className="mt-px text-[14px] text-brand-fg" />
            Every failure names what happened and offers the next action; no bare toasts as the only signal.
          </li>
          <li className="flex gap-2">
            <Icon name="chevron_right" className="mt-px text-[14px] text-brand-fg" />
            403 never reveals whether the target exists.
          </li>
          <li className="flex gap-2">
            <Icon name="chevron_right" className="mt-px text-[14px] text-brand-fg" />
            Stale data is labelled, never silently presented as fresh.
          </li>
          <li className="flex gap-2">
            <Icon name="chevron_right" className="mt-px text-[14px] text-brand-fg" />
            Empty states preserve context (filters, search term) so the user can undo them.
          </li>
        </ul>
      </section>
    </div>
  )
}

function Preview({ code, title, body, icon, tone }) {
  const styles = {
    negative: 'border-negative-border bg-negative-subtle text-negative-fg',
    warning: 'border-warning-border bg-warning-subtle text-warning-fg',
    neutral: 'border-hairline bg-surface-soft text-fg-muted',
  }
  return (
    <article className="rounded-md border border-hairline bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[9px] uppercase tracking-widest text-fg-faint">{code} preview</p>
        <span className={`grid size-8 place-items-center rounded-sm border ${styles[tone]}`}>
          <Icon name={icon} className="text-[17px]" />
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">{body}</p>
      <div className="mt-3 flex gap-2">
        <span className="inline-flex h-7 items-center rounded-sm border border-hairline bg-surface-soft px-2 text-[10px] font-semibold text-fg-muted">
          Primary action
        </span>
        <span className="inline-flex h-7 items-center rounded-sm px-2 text-[10px] font-semibold text-fg-faint">
          Secondary
        </span>
      </div>
    </article>
  )
}
