import { useEffect, useState } from 'react'
import { Icon } from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { fetchAdminOverview } from '../../services/api'
import { formatCount } from '../../utils/format'
import AdminPageHeader from './AdminPageHeader'

const WINDOWS = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '90d', label: '90 days' },
]

const PROVIDER_LABELS = { password: 'Email & password', google: 'Google identity' }
const RAIL_TONES = {
  connected: 'bg-positive',
  degraded: 'bg-warning',
  offline: 'bg-negative',
}

/**
 * Platform overview.
 *
 * Every figure on this page is an aggregate produced by `/admin/overview`; no
 * transaction row, amount or note is ever fetched here.
 */
export default function AdminOverviewPage() {
  const [windowKey, setWindowKey] = useState('30d')
  const [state, setState] = useState({ data: null, error: null })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let active = true
    fetchAdminOverview({ window: windowKey })
      .then((payload) => {
        if (active) setState({ data: payload, error: null })
      })
      .catch((cause) => {
        if (active) setState((current) => ({ data: current.data, error: cause.message }))
      })
    return () => {
      active = false
    }
  }, [windowKey, nonce])

  const retry = () => setNonce((value) => value + 1)
  const isLoading = !state.data || state.data.window.key !== windowKey

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <AdminPageHeader
        eyebrow="Live telemetry"
        title="Platform overview"
        description="Anonymized, aggregate-only operations across every liquidity zone."
        actions={
          <>
            <div className="inline-flex rounded-md border border-hairline bg-card p-0.5">
              {WINDOWS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setWindowKey(option.key)}
                  className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    windowKey === option.key
                      ? 'bg-brand-subtle text-brand-fg'
                      : 'text-fg-muted hover:text-fg'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={retry}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline bg-card px-2.5 text-[11px] font-semibold text-fg-muted hover:text-fg"
            >
              <Icon name="refresh" className="text-[15px]" />
              Refresh
            </button>
          </>
        }
      />

      {isLoading && !state.data ? (
        <Skeleton count={6} variant="card" />
      ) : state.error && !state.data ? (
        <ErrorPanel message={state.error} onRetry={retry} />
      ) : (
        state.data && (
          <>
            {state.error && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-negative-border bg-negative-subtle px-3 py-2 text-[11px] text-negative-fg">
                <span>{state.error}</span>
                <button type="button" onClick={retry} className="font-semibold underline">
                  Retry
                </button>
              </div>
            )}
            <OverviewBody data={state.data} isRefreshing={isLoading} />
          </>
        )
      )}
    </div>
  )
}

function OverviewBody({ data, isRefreshing }) {
  const { users, accounts, ledger, resources, categories, audit, composition, activity, system } =
    data
  const totalProvider = composition.byProvider.reduce((total, row) => total + row.count, 0) || 1
  const totalTier = composition.byKycTier.reduce((total, row) => total + row.count, 0) || 1
  const ledgerTotal = ledger.byType.income + ledger.byType.expense || 1
  const topCategoryMax = ledger.topCategories[0]?.count || 1

  return (
    <>
      {isRefreshing && (
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-fg-faint">
          <Icon name="sync" className="animate-spin text-[13px]" />
          Refreshing window
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStat
          label="Total users"
          value={formatCount(users.total)}
          hint={`${formatCount(users.newInWindow)} joined in ${data.window.key}`}
          icon="group"
        />
        <AdminStat
          label="Active accounts"
          value={formatCount(accounts.activeInWindow)}
          hint={`${formatCount(accounts.total)} provisioned`}
          icon="account_balance_wallet"
        />
        <AdminStat
          label="Ledger posts"
          value={formatCount(ledger.inWindow)}
          hint={`${formatCount(ledger.transactions)} all time`}
          icon="receipt_long"
        />
        <AdminStat
          label="Audit events"
          value={formatCount(audit.eventsInWindow)}
          hint="Privileged actions in window"
          icon="shield"
          tone={audit.eventsInWindow > 0 ? 'warning' : 'default'}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="min-w-0 rounded-md border border-hairline bg-card p-4 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Network activity</h2>
              <p className="mt-0.5 text-[11px] text-fg-muted">
                Daily signups and ledger posts, last {data.window.days} days
              </p>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-fg-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-brand" />
                Users
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-positive" />
                Posts
              </span>
            </div>
          </div>
          <ActivityChart points={activity} />
          <div className="mt-2 flex justify-between font-mono text-[10px] text-fg-faint">
            <span>{activity[0]?.date}</span>
            <span>{activity[activity.length - 1]?.date}</span>
          </div>
        </section>

        <section className="min-w-0 rounded-md border border-hairline bg-card p-4">
          <h2 className="text-sm font-semibold">Platform health</h2>
          <p className="mt-0.5 text-[11px] text-fg-muted">Runtime and data-store posture</p>
          <dl className="mt-3 divide-y divide-hairline-soft">
            <HealthRow label="Database" value={system.db} tone={system.db === 'connected' ? 'positive' : 'warning'} />
            <HealthRow label="Environment" value={system.env} />
            <HealthRow label="Runtime" value={system.node} />
            <HealthRow label="Uptime" value={formatUptime(system.uptimeSeconds)} />
            <HealthRow label="Process RSS" value={`${formatCount(system.memoryMb)} MB`} />
            <HealthRow label="Categories" value={`${formatCount(categories.total)} keys`} />
          </dl>
          <div className="mt-3 rounded-sm border border-hairline bg-surface-soft p-2.5">
            <p className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-brand-fg">
              <Icon name="encrypted" className="text-[12px]" />
              Zero-knowledge policy
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-fg-muted">
              Amounts, notes and descriptions stay inside the user&apos;s ledger.
            </p>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="min-w-0 rounded-md border border-hairline bg-card p-4">
          <h2 className="text-sm font-semibold">Account composition</h2>
          <p className="mt-0.5 text-[11px] text-fg-muted">Provider and KYC distribution</p>
          <div className="mt-3 space-y-2.5">
            {composition.byProvider.map((row) => (
              <BarRow
                key={row.key}
                label={PROVIDER_LABELS[row.key] ?? row.key}
                value={formatCount(row.count)}
                ratio={row.count / totalProvider}
                tone="bg-brand"
              />
            ))}
          </div>
          <div className="mt-4 space-y-2.5 border-t border-hairline-soft pt-3">
            {composition.byKycTier.map((row) => (
              <BarRow
                key={row.tier}
                label={`KYC tier ${row.tier}`}
                value={formatCount(row.count)}
                ratio={row.count / totalTier}
                tone="bg-info"
              />
            ))}
          </div>
          <p className="mt-3 flex items-center justify-between border-t border-hairline-soft pt-2 font-mono text-[10px] text-fg-muted">
            <span>Suspended</span>
            <span className={users.suspended > 0 ? 'text-negative-fg' : 'text-fg'}>
              {formatCount(users.suspended)}
            </span>
          </p>
        </section>

        <section className="min-w-0 rounded-md border border-hairline bg-card p-4">
          <h2 className="text-sm font-semibold">Ledger shape</h2>
          <p className="mt-0.5 text-[11px] text-fg-muted">Post counts by direction</p>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-track">
            <span
              className="bg-positive"
              style={{ width: `${(ledger.byType.income / ledgerTotal) * 100}%` }}
            />
            <span
              className="bg-negative"
              style={{ width: `${(ledger.byType.expense / ledgerTotal) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px]">
            <span className="text-positive-fg">
              {formatCount(ledger.byType.income)} inflow
            </span>
            <span className="text-negative-fg">
              {formatCount(ledger.byType.expense)} outflow
            </span>
          </div>
          <div className="mt-4 space-y-2 border-t border-hairline-soft pt-3">
            {ledger.topCategories.length === 0 ? (
              <p className="py-4 text-center text-[11px] text-fg-muted">No posts in this window.</p>
            ) : (
              ledger.topCategories.map((row) => (
                <BarRow
                  key={row.key}
                  label={row.label}
                  value={formatCount(row.count)}
                  ratio={row.count / topCategoryMax}
                  tone="bg-brand-accent"
                />
              ))
            )}
          </div>
        </section>

        <section className="min-w-0 rounded-md border border-hairline bg-card p-4">
          <h2 className="text-sm font-semibold">Resource footprint</h2>
          <p className="mt-0.5 text-[11px] text-fg-muted">Stored records across the platform</p>
          <dl className="mt-3 divide-y divide-hairline-soft">
            <HealthRow label="Budgets" value={formatCount(resources.budgets)} />
            <HealthRow label="Milestones" value={formatCount(resources.milestones)} />
            <HealthRow label="Clearing rails" value={formatCount(resources.rails.total)} />
            <HealthRow label="Categories" value={formatCount(categories.total)} />
          </dl>
          <div className="mt-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-fg-faint">
              Rail status
            </p>
            <ul className="mt-2 space-y-1.5">
              {resources.rails.byStatus.length === 0 ? (
                <li className="text-[11px] text-fg-muted">No rails connected yet.</li>
              ) : (
                resources.rails.byStatus.map((row) => (
                  <li key={row.status} className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] capitalize text-fg-muted">
                      <span className={`size-1.5 rounded-full ${RAIL_TONES[row.status] ?? 'bg-track'}`} />
                      {row.status}
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-fg">
                      {formatCount(row.count)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </div>
    </>
  )
}

function AdminStat({ label, value, hint, icon, tone = 'default' }) {
  return (
    <article
      className={`rounded-md border p-3.5 ${
        tone === 'warning' ? 'border-warning-border bg-warning-subtle' : 'border-hairline bg-card'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">{label}</p>
        <Icon name={icon} className="text-[16px] text-fg-faint" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="mt-1 text-[10px] text-fg-muted">{hint}</p>
    </article>
  )
}

function ActivityChart({ points }) {
  const width = 640
  const height = 160
  const pad = 10
  const max = Math.max(1, ...points.flatMap((point) => [point.users, point.transactions]))
  const step = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0
  const y = (value) => height - pad - (value / max) * (height - pad * 2)
  const line = (key) =>
    points
      .map((point, index) => `${index === 0 ? 'M' : 'L'}${pad + index * step},${y(point[key])}`)
      .join(' ')

  return (
    <div className="mt-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-44 w-full"
        role="img"
        aria-label="Daily users and ledger posts"
      >
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={pad}
            x2={width - pad}
            y1={height - pad - ratio * (height - pad * 2)}
            y2={height - pad - ratio * (height - pad * 2)}
            className="stroke-hairline-soft"
            strokeDasharray="3 5"
          />
        ))}
        <path d={line('transactions')} fill="none" className="stroke-positive" strokeWidth="2" />
        <path d={line('users')} fill="none" className="stroke-brand" strokeWidth="2" />
      </svg>
    </div>
  )
}

function BarRow({ label, value, ratio, tone }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-[11px] text-fg-muted">{label}</span>
        <span className="font-mono text-[11px] tabular-nums text-fg">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-track">
        <span
          className={`block h-full rounded-full ${tone}`}
          style={{ width: `${Math.min(100, Math.max(0, ratio * 100))}%` }}
        />
      </div>
    </div>
  )
}

function HealthRow({ label, value, tone = 'default' }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <dt className="text-[11px] text-fg-muted">{label}</dt>
      <dd
        className={`font-mono text-[11px] capitalize tabular-nums ${
          tone === 'positive'
            ? 'text-positive-fg'
            : tone === 'warning'
              ? 'text-warning-fg'
              : 'text-fg'
        }`}
      >
        {value}
      </dd>
    </div>
  )
}

function ErrorPanel({ message, onRetry }) {
  return (
    <div className="rounded-md border border-negative-border bg-negative-subtle p-6 text-center">
      <Icon name="error" className="text-2xl text-negative-fg" />
      <p className="mt-2 text-sm font-semibold text-negative-fg">Telemetry unavailable</p>
      <p className="mt-1 text-xs text-fg-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex h-8 items-center rounded-md border border-hairline bg-card px-3 text-xs font-semibold text-fg hover:bg-hover"
      >
        Try again
      </button>
    </div>
  )
}

function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m ${seconds % 60}s`
}
