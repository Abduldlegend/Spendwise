import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { fetchAdminAudit } from '../../services/api'
import { formatCount } from '../../utils/format'
import AdminPageHeader from './AdminPageHeader'
import { AUDIT_ACTIONS, AUDIT_LABELS, AUDIT_TARGET_TYPES } from './auditLabels'

/** Immutable, paginated audit trail of every privileged action. */
export default function AdminAuditPage() {
  const [actorInput, setActorInput] = useState('')
  const [actorEmail, setActorEmail] = useState('')
  const [action, setAction] = useState('')
  const [targetType, setTargetType] = useState('')
  const [page, setPage] = useState(1)
  const [state, setState] = useState({ data: null, error: null, key: null })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setActorEmail(actorInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [actorInput])

  const query = useMemo(
    () => ({
      actorEmail: actorEmail || undefined,
      action: action || undefined,
      targetType: targetType || undefined,
      page,
      limit: 25,
    }),
    [actorEmail, action, targetType, page],
  )
  const queryKey = JSON.stringify(query)

  useEffect(() => {
    let active = true
    fetchAdminAudit(query)
      .then((payload) => {
        if (active) setState({ data: payload, error: null, key: queryKey })
      })
      .catch((cause) => {
        if (active) setState((current) => ({ ...current, error: cause.message, key: queryKey }))
      })
    return () => {
      active = false
    }
  }, [query, queryKey, nonce])

  const isLoading = state.key !== queryKey
  const data = state.data
  const hasFilters = Boolean(actorInput || action || targetType)

  const reset = () => {
    setActorInput('')
    setActorEmail('')
    setAction('')
    setTargetType('')
    setPage(1)
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <AdminPageHeader
        eyebrow="Compliance"
        title="Audit log"
        description="Append-only record of privileged actions, their actor and the stated reason."
        actions={
          <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline bg-card px-2.5 font-mono text-[11px] text-fg-muted">
            <Icon name="history" className="text-[14px] text-brand-fg" />
            {data ? `${formatCount(data.total)} events` : 'Loading'}
          </span>
        }
      />

      <div className="grid gap-2 rounded-md border border-hairline bg-card p-2.5 sm:grid-cols-3">
        <label className="relative block">
          <span className="sr-only">Filter by actor email</span>
          <Icon
            name="search"
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[16px] text-fg-faint"
          />
          <input
            type="search"
            value={actorInput}
            onChange={(event) => setActorInput(event.target.value)}
            placeholder="Actor email"
            className="h-8 w-full rounded-sm border border-hairline bg-surface-soft pl-8 pr-2 text-xs text-fg placeholder:text-fg-faint focus:border-brand-border focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="sr-only">Filter by action</span>
          <select
            value={action}
            onChange={(event) => {
              setAction(event.target.value)
              setPage(1)
            }}
            className="h-8 w-full rounded-sm border border-hairline bg-surface-soft px-2 text-xs text-fg focus:border-brand-border focus:outline-none"
          >
            <option value="">All actions</option>
            {AUDIT_ACTIONS.map((value) => (
              <option key={value} value={value}>
                {AUDIT_LABELS[value]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">Filter by target type</span>
          <select
            value={targetType}
            onChange={(event) => {
              setTargetType(event.target.value)
              setPage(1)
            }}
            className="h-8 w-full rounded-sm border border-hairline bg-surface-soft px-2 text-xs text-fg focus:border-brand-border focus:outline-none"
          >
            <option value="">All targets</option>
            {AUDIT_TARGET_TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>

      {hasFilters && (
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-fg-faint">Filters applied</p>
          <button type="button" onClick={reset} className="text-[11px] font-semibold text-brand-fg hover:underline">
            Clear filters
          </button>
        </div>
      )}

      {state.error && !data ? (
        <div className="rounded-md border border-negative-border bg-negative-subtle p-6 text-center">
          <Icon name="error" className="text-2xl text-negative-fg" />
          <p className="mt-2 text-sm font-semibold text-negative-fg">Audit trail unavailable</p>
          <p className="mt-1 text-xs text-fg-muted">{state.error}</p>
          <button
            type="button"
            onClick={() => setNonce((value) => value + 1)}
            className="mt-4 inline-flex h-8 items-center rounded-md border border-hairline bg-card px-3 text-xs font-semibold text-fg hover:bg-hover"
          >
            Try again
          </button>
        </div>
      ) : !data ? (
        <Skeleton count={6} variant="row" />
      ) : data.items.length === 0 ? (
        <div className="rounded-md border border-hairline bg-card p-10 text-center">
          <Icon name="fact_check" className="text-3xl text-fg-faint" />
          <p className="mt-2 text-sm font-semibold">No events recorded</p>
          <p className="mt-1 text-xs text-fg-muted">
            {hasFilters ? 'No action matches these filters.' : 'Privileged actions will appear here as they happen.'}
          </p>
        </div>
      ) : (
        <>
          <div
            className={`overflow-x-auto rounded-md border border-hairline bg-card ${isLoading ? 'opacity-60' : ''}`}
          >
            <table className="w-full min-w-[960px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline bg-surface-soft">
                  <Th>Timestamp</Th>
                  <Th>Actor</Th>
                  <Th>Action</Th>
                  <Th>Target</Th>
                  <Th>Reason</Th>
                  <Th>Context</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft">
                {data.items.map((entry) => (
                  <tr key={entry.id} className="align-top transition-colors hover:bg-hover">
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[10px] text-fg-muted">
                      {formatDateTime(entry.createdAt)}
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-mono text-[10px] text-fg">{entry.actorEmail || 'unknown'}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex rounded-sm border border-hairline bg-surface-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold text-fg-muted">
                        {AUDIT_LABELS[entry.action] ?? entry.action}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {entry.targetType === 'user' && entry.targetId ? (
                        <Link
                          to={`/admin/users/${entry.targetId}`}
                          className="font-mono text-[10px] text-brand-fg hover:underline"
                        >
                          user · {shortId(entry.targetId)}
                        </Link>
                      ) : (
                        <span className="font-mono text-[10px] text-fg-muted">
                          {entry.targetType}
                          {entry.targetId ? ` · ${entry.targetId}` : ''}
                        </span>
                      )}
                    </td>
                    <td className="max-w-[260px] px-3 py-2.5 text-[11px] text-fg-muted">
                      <span className="line-clamp-2" title={entry.reason}>
                        {entry.reason || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <details>
                        <summary className="cursor-pointer font-mono text-[9px] uppercase tracking-wider text-fg-faint hover:text-fg">
                          Inspect
                        </summary>
                        <pre className="mt-1 max-w-[240px] overflow-x-auto rounded-sm border border-hairline bg-surface-soft p-1.5 font-mono text-[9px] text-fg-muted">
                          {JSON.stringify(
                            { ip: entry.ip || null, userAgent: entry.userAgent || null, metadata: entry.metadata },
                            null,
                            2,
                          )}
                        </pre>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[10px] text-fg-muted">
              Page {data.page} of {data.pages} · {formatCount(data.total)} events
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                disabled={data.page <= 1 || isLoading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="inline-flex h-7 items-center gap-0.5 rounded-sm border border-hairline bg-card px-2 text-[10px] font-semibold text-fg-muted hover:text-fg disabled:pointer-events-none disabled:opacity-40"
              >
                <Icon name="chevron_left" className="text-[14px]" />
                Previous
              </button>
              <button
                type="button"
                disabled={data.page >= data.pages || isLoading}
                onClick={() => setPage((value) => Math.min(data.pages, value + 1))}
                className="inline-flex h-7 items-center gap-0.5 rounded-sm border border-hairline bg-card px-2 text-[10px] font-semibold text-fg-muted hover:text-fg disabled:pointer-events-none disabled:opacity-40"
              >
                Next
                <Icon name="chevron_right" className="text-[14px]" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Th({ children }) {
  return (
    <th
      scope="col"
      className="whitespace-nowrap px-3 py-2 font-mono text-[9px] font-medium uppercase tracking-widest text-fg-faint"
    >
      {children}
    </th>
  )
}

function shortId(id) {
  return String(id).slice(-8)
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`
}
