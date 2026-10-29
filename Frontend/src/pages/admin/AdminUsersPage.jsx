import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { fetchAdminUsers } from '../../services/api'
import { formatCount } from '../../utils/format'
import AdminPageHeader from './AdminPageHeader'

const ROLE_BADGES = {
  admin: 'border-warning-border bg-warning-subtle text-warning-fg',
  user: 'border-hairline bg-surface-soft text-fg-muted',
}

const KYC_LABELS = { 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' }

/** Directory of user accounts: metadata and counts only, never ledger rows. */
export default function AdminUsersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [role, setRole] = useState('')
  const [kycTier, setKycTier] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [state, setState] = useState({ data: null, error: null, key: null })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const query = useMemo(
    () => ({
      search: search || undefined,
      status: status || undefined,
      role: role || undefined,
      kycTier: kycTier || undefined,
      sort,
      page,
      limit: 20,
    }),
    [search, status, role, kycTier, sort, page],
  )
  const queryKey = JSON.stringify(query)

  useEffect(() => {
    let active = true
    fetchAdminUsers(query)
      .then((payload) => {
        if (active) setState({ data: payload, error: null, key: queryKey })
      })
      .catch((cause) => {
        if (active) {
          setState((current) => ({ ...current, error: cause.message, key: queryKey }))
        }
      })
    return () => {
      active = false
    }
  }, [query, queryKey, nonce])

  const isLoading = state.key !== queryKey
  const { data, error } = state

  const resetFilters = () => {
    setSearchInput('')
    setSearch('')
    setStatus('')
    setRole('')
    setKycTier('')
    setSort('newest')
    setPage(1)
  }

  const hasFilters = Boolean(searchInput || status || role || kycTier)

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4">
      <AdminPageHeader
        eyebrow="Account directory"
        title="User accounts"
        description="Macro metadata only. Transaction rows, balances and notes are never exposed to staff."
        actions={
          <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline bg-card px-2.5 font-mono text-[11px] text-fg-muted">
            <Icon name="verified_user" className="text-[14px] text-brand-fg" />
            {data ? `${formatCount(data.total)} accounts` : 'Loading'}
          </span>
        }
      />

      <div className="grid gap-2 rounded-md border border-hairline bg-card p-2.5 sm:grid-cols-2 xl:grid-cols-5">
        <label className="relative block sm:col-span-2 xl:col-span-1">
          <span className="sr-only">Search accounts</span>
          <Icon
            name="search"
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[16px] text-fg-faint"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search name or email"
            className="h-8 w-full rounded-sm border border-hairline bg-surface-soft pl-8 pr-2 text-xs text-fg placeholder:text-fg-faint focus:border-brand-border focus:outline-none"
          />
        </label>

        <FilterSelect label="Status" value={status} onChange={(value) => { setStatus(value); setPage(1) }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </FilterSelect>

        <FilterSelect label="Role" value={role} onChange={(value) => { setRole(value); setPage(1) }}>
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </FilterSelect>

        <FilterSelect label="KYC tier" value={kycTier} onChange={(value) => { setKycTier(value); setPage(1) }}>
          <option value="">All tiers</option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
        </FilterSelect>

        <FilterSelect label="Sort" value={sort} onChange={(value) => { setSort(value); setPage(1) }}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
          <option value="last_login">Last sign-in</option>
        </FilterSelect>
      </div>

      {hasFilters && (
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-fg-faint">
            Filters applied
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] font-semibold text-brand-fg hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {isLoading && !data ? (
        <Skeleton count={5} variant="row" />
      ) : error && !data ? (
        <div className="rounded-md border border-negative-border bg-negative-subtle p-6 text-center">
          <Icon name="error" className="text-2xl text-negative-fg" />
          <p className="mt-2 text-sm font-semibold text-negative-fg">Directory unavailable</p>
          <p className="mt-1 text-xs text-fg-muted">{error}</p>
          <button
            type="button"
            onClick={() => setNonce((value) => value + 1)}
            className="mt-4 inline-flex h-8 items-center rounded-md border border-hairline bg-card px-3 text-xs font-semibold text-fg hover:bg-hover"
          >
            Try again
          </button>
        </div>
      ) : data && data.items.length === 0 ? (
        <div className="rounded-md border border-hairline bg-card">
          <EmptyState
            icon="person_search"
            title="No accounts match"
            description="Broaden the search or clear the filters to see the full directory."
            actionLabel={hasFilters ? 'Clear filters' : undefined}
            onAction={hasFilters ? resetFilters : undefined}
          />
        </div>
      ) : (
        data && (
          <>
            {error && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-negative-border bg-negative-subtle px-3 py-2 text-[11px] text-negative-fg">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setNonce((value) => value + 1)}
                  className="font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}
            <div className={`overflow-x-auto rounded-md border border-hairline bg-card ${isLoading ? 'opacity-60' : ''}`}>
              <table className="w-full min-w-[920px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-hairline bg-surface-soft">
                    <Th>Staff identity</Th>
                    <Th>Role</Th>
                    <Th>KYC</Th>
                    <Th>Provider</Th>
                    <Th className="text-right">Ledger counts</Th>
                    <Th>Status</Th>
                    <Th>Joined</Th>
                    <Th className="text-right">Detail</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-soft">
                  {data.items.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-hover">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-brand-subtle font-mono text-[10px] font-semibold text-brand-fg">
                            {initials(user.name, user.email)}
                          </span>
                          <div className="min-w-0">
                            <Link
                              to={`/admin/users/${user.id}`}
                              className="block truncate text-xs font-semibold text-fg hover:text-brand-fg hover:underline"
                            >
                              {user.name}
                            </Link>
                            <p className="truncate font-mono text-[10px] text-fg-muted">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${
                            ROLE_BADGES[user.role] ?? ROLE_BADGES.user
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-fg-muted">
                        {KYC_LABELS[user.kycTier] ?? `Tier ${user.kycTier}`}
                      </td>
                      <td className="px-3 py-2.5 text-[11px] capitalize text-fg-muted">
                        {user.provider}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="font-mono text-[11px] tabular-nums text-fg">
                          {formatCount(user.counts.transactions)}
                        </span>
                        <span className="ml-1 font-mono text-[10px] text-fg-faint">
                          / {formatCount(user.counts.budgets)}b / {formatCount(user.counts.milestones)}m /{' '}
                          {formatCount(user.counts.rails)}r
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                            user.isActive ? 'text-positive-fg' : 'text-negative-fg'
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${user.isActive ? 'bg-positive' : 'bg-negative'}`}
                          />
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[10px] text-fg-muted">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Link
                          to={`/admin/users/${user.id}`}
                          aria-label={`Open ${user.name}`}
                          className="inline-grid size-7 place-items-center rounded-sm border border-hairline text-fg-muted hover:border-brand-border hover:text-brand-fg"
                        >
                          <Icon name="chevron_right" className="text-[16px]" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-[10px] text-fg-muted">
                Page {data.page} of {data.pages} · {formatCount(data.total)} matching accounts
              </p>
              <div className="flex gap-1.5">
                <PagerButton
                  icon="chevron_left"
                  label="Previous"
                  disabled={data.page <= 1 || isLoading}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                />
                <PagerButton
                  icon="chevron_right"
                  label="Next"
                  disabled={data.page >= data.pages || isLoading}
                  onClick={() => setPage((value) => Math.min(data.pages, value + 1))}
                />
              </div>
            </div>
          </>
        )
      )}
    </div>
  )
}

function Th({ children, className = '' }) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap px-3 py-2 font-mono text-[9px] font-medium uppercase tracking-widest text-fg-faint ${className}`}
    >
      {children}
    </th>
  )
}

function FilterSelect({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-sm border border-hairline bg-surface-soft px-2 text-xs text-fg focus:border-brand-border focus:outline-none"
      >
        {children}
      </select>
    </label>
  )
}

function PagerButton({ icon, label, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-7 items-center gap-0.5 rounded-sm border border-hairline bg-card px-2 text-[10px] font-semibold text-fg-muted hover:text-fg disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon name={icon} className="text-[14px]" />
      {label}
    </button>
  )
}

function initials(name, email) {
  return String(name || email || '?')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toISOString().slice(0, 10)
}
