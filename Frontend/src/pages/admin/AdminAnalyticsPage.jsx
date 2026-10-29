import { useEffect, useState } from 'react'
import { Icon } from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { fetchAdminAnalytics } from '../../services/api'
import { formatCount } from '../../utils/format'
import AdminPageHeader from './AdminPageHeader'

/** Aggregate telemetry: bucketed counts, never ledger rows or amounts. */
export default function AdminAnalyticsPage() {
  const [windowKey, setWindowKey] = useState('30d')
  const [granularity, setGranularity] = useState('day')
  const [state, setState] = useState({ data: null, error: null, key: null })
  const [nonce, setNonce] = useState(0)

  const requestKey = `${windowKey}:${granularity}:${nonce}`

  useEffect(() => {
    let active = true
    fetchAdminAnalytics({ window: windowKey, granularity })
      .then((payload) => {
        if (active) setState({ data: payload, error: null, key: requestKey })
      })
      .catch((cause) => {
        if (active) setState((current) => ({ ...current, error: cause.message, key: requestKey }))
      })
    return () => {
      active = false
    }
  }, [windowKey, granularity, requestKey])

  const isLoading = state.key !== requestKey
  const data = state.data

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <AdminPageHeader
        eyebrow="Aggregate telemetry"
        title="Platform telemetry"
        description="Bucketed signups and ledger post counts. Individual rows and monetary values are out of scope."
        actions={
          <>
            <Segmented
              options={[
                { key: '30d', label: '30 days' },
                { key: '90d', label: '90 days' },
              ]}
              value={windowKey}
              onChange={setWindowKey}
            />
            <Segmented
              options={[
                { key: 'day', label: 'Daily' },
                { key: 'week', label: 'Weekly' },
              ]}
              value={granularity}
              onChange={setGranularity}
            />
            <button
              type="button"
              onClick={() => setNonce((value) => value + 1)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline bg-card px-2.5 text-[11px] font-semibold text-fg-muted hover:text-fg"
            >
              <Icon name="refresh" className="text-[15px]" />
              Refresh
            </button>
          </>
        }
      />

      {state.error && data && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-negative-border bg-negative-subtle px-3 py-2 text-[11px] text-negative-fg">
          <span>{state.error}</span>
          <button
            type="button"
            onClick={() => setNonce((value) => value + 1)}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {!data ? (
        state.error ? (
          <div className="rounded-md border border-negative-border bg-negative-subtle p-6 text-center">
            <Icon name="error" className="text-2xl text-negative-fg" />
            <p className="mt-2 text-sm font-semibold text-negative-fg">Telemetry unavailable</p>
            <p className="mt-1 text-xs text-fg-muted">{state.error}</p>
            <button
              type="button"
              onClick={() => setNonce((value) => value + 1)}
              className="mt-4 inline-flex h-8 items-center rounded-md border border-hairline bg-card px-3 text-xs font-semibold text-fg hover:bg-hover"
            >
              Try again
            </button>
          </div>
        ) : (
          <Skeleton count={6} variant="card" />
        )
      ) : (
        <>
          <div className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${isLoading ? 'opacity-60' : ''}`}>
            <Stat label="New accounts" value={formatCount(data.totals.usersNew)} icon="person_add" />
            <Stat label="Ledger posts" value={formatCount(data.totals.posts)} icon="receipt_long" />
            <Stat label="Inflow posts" value={formatCount(data.totals.income)} icon="south_west" tone="positive" />
            <Stat label="Outflow posts" value={formatCount(data.totals.expense)} icon="north_east" tone="negative" />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <section className="min-w-0 rounded-md border border-hairline bg-card p-4 xl:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold">Post velocity</h2>
                  <p className="mt-0.5 text-[11px] text-fg-muted">
                    Inflow and outflow post counts per {granularity === 'week' ? 'ISO week' : 'day'}.
                  </p>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-fg-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-positive" />
                    Inflow
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-negative" />
                    Outflow
                  </span>
                </div>
              </div>
              <PostChart series={data.series} />
              <div className="mt-2 flex justify-between font-mono text-[10px] text-fg-faint">
                <span>{data.series[0]?.date}</span>
                <span>{data.series[data.series.length - 1]?.date}</span>
              </div>
              <details className="mt-3 border-t border-hairline-soft pt-2">
                <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-widest text-fg-faint hover:text-fg">
                  View as table
                </summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-hairline-soft">
                        <Th>Bucket</Th>
                        <Th className="text-right">Signups</Th>
                        <Th className="text-right">Inflow</Th>
                        <Th className="text-right">Outflow</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline-soft">
                      {data.series.map((point) => (
                        <tr key={point.date}>
                          <td className="px-2 py-1.5 font-mono text-[10px] text-fg-muted">{point.date}</td>
                          <td className="px-2 py-1.5 text-right font-mono text-[10px] tabular-nums">
                            {formatCount(point.signups)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono text-[10px] tabular-nums text-positive-fg">
                            {formatCount(point.income)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono text-[10px] tabular-nums text-negative-fg">
                            {formatCount(point.expense)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </section>

            <div className="flex min-w-0 flex-col gap-4">
              <section className="rounded-md border border-hairline bg-card p-4">
                <h2 className="text-sm font-semibold">Signup cadence</h2>
                <p className="mt-0.5 text-[11px] text-fg-muted">New accounts per bucket</p>
                <SignupChart series={data.series} />
                <p className="mt-2 font-mono text-[10px] text-fg-muted">
                  {formatCount(data.totals.usersNew)} signups in {data.window.key}
                </p>
              </section>

              <section className="rounded-md border border-hairline bg-card p-4">
                <h2 className="text-sm font-semibold">Category mix</h2>
                <p className="mt-0.5 text-[11px] text-fg-muted">Post counts, top categories</p>
                {data.categories.length === 0 ? (
                  <p className="mt-3 text-[11px] text-fg-muted">No posts in this window.</p>
                ) : (
                  <ul className="mt-3 space-y-2.5">
                    {data.categories.map((row) => {
                      const share = data.totals.posts > 0 ? row.count / data.totals.posts : 0
                      return (
                        <li key={row.key}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="truncate text-[11px] text-fg-muted">{row.label}</span>
                            <span className="font-mono text-[10px] tabular-nums text-fg">
                              {formatCount(row.count)}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-track">
                            <span
                              className="block h-full rounded-full bg-brand"
                              style={{ width: `${Math.min(100, share * 100)}%` }}
                            />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-md border border-hairline bg-card p-0.5">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={`rounded-sm px-2.5 py-1 text-[11px] font-semibold transition-colors ${
            value === option.key ? 'bg-brand-subtle text-brand-fg' : 'text-fg-muted hover:text-fg'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Stat({ label, value, icon, tone = 'default' }) {
  const color =
    tone === 'positive' ? 'text-positive-fg' : tone === 'negative' ? 'text-negative-fg' : 'text-fg'
  return (
    <article className="rounded-md border border-hairline bg-card p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-fg-muted">{label}</p>
        <Icon name={icon} className="text-[16px] text-fg-faint" />
      </div>
      <p className={`mt-2 text-2xl font-semibold tabular-nums tracking-tight ${color}`}>{value}</p>
    </article>
  )
}

function PostChart({ series }) {
  const max = Math.max(1, ...series.map((point) => point.income + point.expense))
  return (
    <div className="mt-4 flex h-40 items-end gap-px overflow-hidden">
      {series.map((point) => {
        const total = point.income + point.expense
        const incomeHeight = (point.income / max) * 100
        const expenseHeight = (point.expense / max) * 100
        return (
          <div
            key={point.date}
            className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
            title={`${point.date}: ${point.income} inflow, ${point.expense} outflow`}
          >
            {total === 0 ? (
              <span className="h-px w-full bg-hairline" />
            ) : (
              <>
                <span className="w-full bg-negative/80" style={{ height: `${expenseHeight}%` }} />
                <span className="w-full bg-positive/80" style={{ height: `${incomeHeight}%` }} />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

function SignupChart({ series }) {
  const width = 280
  const height = 90
  const pad = 4
  const max = Math.max(1, ...series.map((point) => point.signups))
  const step = series.length > 1 ? (width - pad * 2) / (series.length - 1) : 0
  const path = series
    .map((point, index) => {
      const x = pad + index * step
      const y = height - pad - (point.signups / max) * (height - pad * 2)
      return `${index === 0 ? 'M' : 'L'}${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-24 w-full" role="img" aria-label="Signups per bucket">
      <line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} className="stroke-hairline" />
      <path d={path} fill="none" className="stroke-brand" strokeWidth="2" />
    </svg>
  )
}

function Th({ children, className = '' }) {
  return (
    <th
      scope="col"
      className={`px-2 py-1.5 font-mono text-[9px] font-medium uppercase tracking-widest text-fg-faint ${className}`}
    >
      {children}
    </th>
  )
}
