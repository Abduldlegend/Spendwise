import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Icon } from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import { useToast } from '../../context/ToastContext'
import { fetchAdminUser, updateAdminUser } from '../../services/api'
import { formatCount, formatCurrency } from '../../utils/format'
import AdminPageHeader from './AdminPageHeader'
import { AUDIT_LABELS } from './auditLabels'

const ACTION_COPY = {
  suspend: {
    title: 'Suspend account',
    description: 'The user is signed out on the next request and cannot use the ledger until reinstated.',
    confirm: 'Suspend account',
    tone: 'negative',
  },
  reinstate: {
    title: 'Reinstate account',
    description: 'Restores full ledger access for this account.',
    confirm: 'Reinstate account',
    tone: 'primary',
  },
  role: {
    title: 'Change staff role',
    description: 'Admin grants access to this console. The change applies on the next token refresh.',
    confirm: 'Update role',
    tone: 'primary',
  },
  kycTier: {
    title: 'Change KYC tier',
    description: 'The tier default replaces the current exposure limit.',
    confirm: 'Update tier',
    tone: 'primary',
  },
}

/** Per-account dossier with metadata, counts and privileged actions. */
export default function AdminUserDetailPage() {
  const { id } = useParams()
  const toast = useToast()
  const [state, setState] = useState({ data: null, error: null, key: null })
  const [nonce, setNonce] = useState(0)

  const [action, setAction] = useState(null)
  const [reason, setReason] = useState('')
  const [roleValue, setRoleValue] = useState('user')
  const [kycValue, setKycValue] = useState(1)
  const [isSaving, setIsSaving] = useState(false)
  const [actionError, setActionError] = useState(null)

  const requestKey = `${id}:${nonce}`

  useEffect(() => {
    let active = true
    fetchAdminUser(id)
      .then((payload) => {
        if (active) setState({ data: payload, error: null, key: requestKey })
      })
      .catch((cause) => {
        if (active) {
          setState((current) => ({ ...current, error: cause.message, key: requestKey }))
        }
      })
    return () => {
      active = false
    }
  }, [id, requestKey])

  const isLoading = state.key !== requestKey
  const user = state.data
  const error = state.error

  const openAction = (type) => {
    if (!user) return
    setAction(type)
    setReason('')
    setActionError(null)
    setRoleValue(user.role === 'admin' ? 'user' : 'admin')
    setKycValue(user.kycTier === 3 ? 2 : user.kycTier + 1)
  }

  const closeAction = () => {
    if (isSaving) return
    setAction(null)
    setActionError(null)
  }

  const submitAction = async (event) => {
    event.preventDefault()
    if (!action) return
    setIsSaving(true)
    setActionError(null)
    try {
      const payload = { action, reason: reason.trim() }
      if (action === 'role') payload.role = roleValue
      if (action === 'kycTier') payload.kycTier = Number(kycValue)
      const updated = await updateAdminUser(id, payload)
      setState((current) => ({ ...current, data: { ...current.data, ...updated } }))
      setAction(null)
      setNonce((value) => value + 1)
      toast.success('Account updated and logged to the audit trail')
    } catch (cause) {
      setActionError(cause.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading && !user) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <Skeleton count={2} variant="text" itemClassName="w-48" />
        <Skeleton count={4} variant="card" />
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="mx-auto max-w-2xl rounded-md border border-negative-border bg-negative-subtle p-6 text-center">
        <Icon name="person_off" className="text-3xl text-negative-fg" />
        <p className="mt-2 text-sm font-semibold text-negative-fg">Account unavailable</p>
        <p className="mt-1 text-xs text-fg-muted">{error}</p>
        <Link
          to="/admin/users"
          className="mt-4 inline-flex h-8 items-center rounded-md border border-hairline bg-card px-3 text-xs font-semibold text-fg hover:bg-hover"
        >
          Back to directory
        </Link>
      </div>
    )
  }

  if (!user) return null

  const copy = action ? ACTION_COPY[action] : null

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <AdminPageHeader
        eyebrow="Account dossier"
        title={user.name}
        description={user.email}
        actions={
          <>
            <Link
              to="/admin/users"
              className="inline-flex h-8 items-center gap-1 rounded-md border border-hairline bg-card px-2.5 text-[11px] font-semibold text-fg-muted hover:text-fg"
            >
              <Icon name="arrow_back" className="text-[15px]" />
              Directory
            </Link>
            <button
              type="button"
              onClick={() => openAction('role')}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-hairline bg-card px-2.5 text-[11px] font-semibold text-fg hover:bg-hover"
            >
              <Icon name="manage_accounts" className="text-[15px]" />
              Role
            </button>
            <button
              type="button"
              onClick={() => openAction('kycTier')}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-hairline bg-card px-2.5 text-[11px] font-semibold text-fg hover:bg-hover"
            >
              <Icon name="verified" className="text-[15px]" />
              KYC
            </button>
            <button
              type="button"
              onClick={() => openAction(user.isActive ? 'suspend' : 'reinstate')}
              className={`inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-[11px] font-semibold ${
                user.isActive
                  ? 'border border-negative-border bg-negative-subtle text-negative-fg hover:bg-negative-subtle'
                  : 'bg-brand text-fg-on-brand hover:bg-brand-hover'
              }`}
            >
              <Icon name={user.isActive ? 'block' : 'check_circle'} className="text-[15px]" />
              {user.isActive ? 'Suspend' : 'Reinstate'}
            </button>
          </>
        }
      />

      {error && user && (
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

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={user.isActive ? 'positive' : 'negative'}>
          {user.isActive ? 'Active' : 'Suspended'}
        </Badge>
        <Badge tone={user.role === 'admin' ? 'warning' : 'neutral'}>{user.role}</Badge>
        <Badge tone="neutral">KYC tier {user.kycTier}</Badge>
        <Badge tone="neutral">{user.provider}</Badge>
        <span className="font-mono text-[10px] text-fg-faint">ID {user.id}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Fact label="Exposure limit" value={formatCurrency(user.kycLimit, user.baseCurrency)} />
        <Fact label="Base currency" value={user.baseCurrency} />
        <Fact label="Joined" value={formatDateTime(user.createdAt)} />
        <Fact label="Last sign-in" value={formatDateTime(user.lastLoginAt)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="min-w-0 rounded-md border border-hairline bg-card p-4 lg:col-span-2">
          <h2 className="text-sm font-semibold">Ledger footprint</h2>
          <p className="mt-0.5 text-[11px] text-fg-muted">
            Record counts only — no amounts, descriptions or notes are readable by staff.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <CountTile icon="receipt_long" label="Transactions" value={user.counts.transactions} />
            <CountTile icon="donut_large" label="Budgets" value={user.counts.budgets} />
            <CountTile icon="flag" label="Milestones" value={user.counts.milestones} />
            <CountTile icon="account_balance" label="Rails" value={user.counts.rails} />
          </div>
          <p className="mt-3 flex items-center gap-1.5 rounded-sm border border-hairline bg-surface-soft px-2.5 py-2 text-[10px] text-fg-muted">
            <Icon name="lock" className="text-[13px] text-brand-fg" />
            Zero-knowledge policy enforced server-side. Account id:{' '}
            <code className="font-mono text-fg-faint">{user.accountId ?? 'not provisioned'}</code>
          </p>
        </section>

        <section className="min-w-0 rounded-md border border-hairline bg-card p-4">
          <h2 className="text-sm font-semibold">Compliance posture</h2>
          <dl className="mt-2 divide-y divide-hairline-soft">
            <FactRow label="Role" value={user.role} capitalize />
            <FactRow label="KYC tier" value={`Tier ${user.kycTier}`} />
            <FactRow label="Provider" value={user.provider} capitalize />
            <FactRow label="Status" value={user.isActive ? 'Active' : 'Suspended'} />
            <FactRow label="Currency" value={user.baseCurrency} />
          </dl>
        </section>
      </div>

      <section className="rounded-md border border-hairline bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold">Privileged audit trail</h2>
            <p className="mt-0.5 text-[11px] text-fg-muted">Most recent actions targeting this account.</p>
          </div>
          <Icon name="history" className="text-[18px] text-fg-faint" />
        </div>
        {user.audit.length === 0 ? (
          <p className="mt-3 border-t border-hairline-soft pt-3 text-[11px] text-fg-muted">
            No privileged actions recorded for this account yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-hairline-soft border-t border-hairline-soft">
            {user.audit.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-fg">
                    {AUDIT_LABELS[entry.action] ?? entry.action}
                  </p>
                  <p className="text-[10px] text-fg-muted">
                    by {entry.actorEmail || 'unknown actor'}
                    {entry.reason ? ` — ${entry.reason}` : ''}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-fg-faint">
                  {formatDateTime(entry.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal
        open={Boolean(action)}
        onClose={closeAction}
        title={copy?.title ?? 'Account action'}
        description={copy?.description}
        footer={
          <>
            <button
              type="button"
              onClick={closeAction}
              disabled={isSaving}
              className="inline-flex h-9 items-center rounded-md border border-hairline px-3 text-xs font-semibold text-fg-muted hover:text-fg"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="admin-action-form"
              disabled={isSaving || reason.trim().length < 3}
              className={`inline-flex h-9 items-center gap-1 rounded-md px-3 text-xs font-semibold disabled:opacity-50 ${
                copy?.tone === 'negative'
                  ? 'bg-negative text-white hover:brightness-110'
                  : 'bg-brand text-fg-on-brand hover:bg-brand-hover'
              }`}
            >
              {isSaving ? 'Applying…' : copy?.confirm}
            </button>
          </>
        }
      >
        <form id="admin-action-form" onSubmit={submitAction} className="space-y-3">
          {action === 'role' && (
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-fg-faint">
                New role
              </span>
              <select
                value={roleValue}
                onChange={(event) => setRoleValue(event.target.value)}
                className="h-9 w-full rounded-md border border-hairline bg-surface-soft px-2 text-xs text-fg focus:border-brand-border focus:outline-none"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          {action === 'kycTier' && (
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-fg-faint">
                New tier
              </span>
              <select
                value={kycValue}
                onChange={(event) => setKycValue(event.target.value)}
                className="h-9 w-full rounded-md border border-hairline bg-surface-soft px-2 text-xs text-fg focus:border-brand-border focus:outline-none"
              >
                <option value={1}>Tier 1 — ₦5,000,000.00</option>
                <option value={2}>Tier 2 — ₦20,000,000.00</option>
                <option value={3}>Tier 3 — ₦100,000,000.00</option>
              </select>
            </label>
          )}

          <label className="block">
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-fg-faint">
              Reason (required, audited)
            </span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              maxLength={280}
              placeholder="Reference the ticket, report or policy that justifies this action."
              className="w-full rounded-md border border-hairline bg-surface-soft px-2.5 py-2 text-xs text-fg placeholder:text-fg-faint focus:border-brand-border focus:outline-none"
            />
            <span className="mt-1 block text-right font-mono text-[9px] text-fg-faint">
              {reason.trim().length}/280
            </span>
          </label>

          {actionError && (
            <p className="rounded-sm border border-negative-border bg-negative-subtle px-2.5 py-2 text-[11px] text-negative-fg">
              {actionError}
            </p>
          )}
        </form>
      </Modal>
    </div>
  )
}

function Badge({ tone, children }) {
  const styles = {
    positive: 'border-positive-border bg-positive-subtle text-positive-fg',
    negative: 'border-negative-border bg-negative-subtle text-negative-fg',
    warning: 'border-warning-border bg-warning-subtle text-warning-fg',
    neutral: 'border-hairline bg-surface-soft text-fg-muted',
  }
  return (
    <span
      className={`inline-flex rounded-sm border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${styles[tone]}`}
    >
      {children}
    </span>
  )
}

function Fact({ label, value }) {
  return (
    <div className="rounded-md border border-hairline bg-card p-3">
      <p className="font-mono text-[9px] uppercase tracking-widest text-fg-faint">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function FactRow({ label, value, capitalize = false }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <dt className="text-[11px] text-fg-muted">{label}</dt>
      <dd className={`font-mono text-[11px] text-fg ${capitalize ? 'capitalize' : ''}`}>{value}</dd>
    </div>
  )
}

function CountTile({ icon, label, value }) {
  return (
    <div className="rounded-sm border border-hairline bg-surface-soft p-2.5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] uppercase tracking-wider text-fg-faint">{label}</p>
        <Icon name={icon} className="text-[14px] text-fg-faint" />
      </div>
      <p className="mt-1.5 text-lg font-semibold tabular-nums">{formatCount(value)}</p>
    </div>
  )
}

function formatDateTime(value) {
  if (!value) return 'Never'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
}
