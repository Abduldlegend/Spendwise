import { useEffect, useState } from 'react'
import { Icon } from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import { useToast } from '../../context/ToastContext'
import { fetchAdminSettings, rotateAdminCredential } from '../../services/api'
import { formatCount, formatCurrency } from '../../utils/format'
import AdminPageHeader from './AdminPageHeader'

const RAIL_TONES = { connected: 'bg-positive', degraded: 'bg-warning', offline: 'bg-negative' }

/** Currency, rails, exposure limits and credential posture. */
export default function AdminSettingsPage() {
  const toast = useToast()
  const [state, setState] = useState({ data: null, error: null })
  const [nonce, setNonce] = useState(0)
  const [rotation, setRotation] = useState({ open: false, reason: '', isSaving: false, error: null, secret: null })

  useEffect(() => {
    let active = true
    fetchAdminSettings()
      .then((payload) => {
        if (active) setState({ data: payload, error: null })
      })
      .catch((cause) => {
        if (active) setState((current) => ({ data: current.data, error: cause.message }))
      })
    return () => {
      active = false
    }
  }, [nonce])

  const data = state.data

  const openRotation = () => setRotation({ open: true, reason: '', isSaving: false, error: null, secret: null })
  const closeRotation = () => {
    if (rotation.isSaving) return
    setRotation((current) => ({ ...current, open: false }))
  }

  const submitRotation = async (event) => {
    event.preventDefault()
    setRotation((current) => ({ ...current, isSaving: true, error: null }))
    try {
      const result = await rotateAdminCredential({ reason: rotation.reason.trim() })
      setRotation((current) => ({ ...current, isSaving: false, secret: result.secret }))
      setNonce((value) => value + 1)
      toast.success('Signing secret rotated')
    } catch (cause) {
      setRotation((current) => ({ ...current, isSaving: false, error: cause.message }))
    }
  }

  const copySecret = async () => {
    if (!rotation.secret) return
    try {
      await navigator.clipboard.writeText(rotation.secret)
      toast.success('Secret copied — store it in your vault now')
    } catch {
      toast.error('Clipboard unavailable; select and copy the secret manually')
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4">
      <AdminPageHeader
        eyebrow="Settlement"
        title="Currencies & rails"
        description="Platform-wide settlement configuration. Currency changes are policy decisions, not console toggles."
        actions={
          <button
            type="button"
            onClick={() => setNonce((value) => value + 1)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline bg-card px-2.5 text-[11px] font-semibold text-fg-muted hover:text-fg"
          >
            <Icon name="refresh" className="text-[15px]" />
            Refresh
          </button>
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
            <p className="mt-2 text-sm font-semibold text-negative-fg">Settings unavailable</p>
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
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-md border border-hairline bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold">Settlement currency</h2>
                <span className="inline-flex items-center gap-1 rounded-sm border border-hairline bg-surface-soft px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-fg-muted">
                  <Icon name="lock" className="text-[11px]" />
                  Locked
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {data.currency.symbol}
                    {data.currency.code}
                  </p>
                  <p className="mt-0.5 text-[11px] text-fg-muted">Nigerian Naira · single currency</p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-wider text-positive-fg">
                  Enabled
                </span>
              </div>
              <p className="mt-3 rounded-sm border border-hairline bg-surface-soft px-2.5 py-2 text-[10px] leading-relaxed text-fg-muted">
                {data.currency.note}
              </p>
            </section>

            <section className="rounded-md border border-hairline bg-card p-4">
              <h2 className="text-sm font-semibold">Clearing rails</h2>
              <p className="mt-0.5 text-[11px] text-fg-muted">Connected rails across all accounts</p>
              <p className="mt-3 text-2xl font-semibold tabular-nums">{formatCount(data.rails.total)}</p>
              <ul className="mt-2 space-y-1.5">
                {data.rails.byStatus.length === 0 ? (
                  <li className="text-[11px] text-fg-muted">No rails connected yet.</li>
                ) : (
                  data.rails.byStatus.map((row) => (
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
              <p className="mt-3 border-t border-hairline-soft pt-2 font-mono text-[10px] text-fg-muted">
                Max {data.limits.maxRailsPerAccount} rails per account
              </p>
            </section>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-md border border-hairline bg-card p-4">
              <h2 className="text-sm font-semibold">KYC exposure limits</h2>
              <p className="mt-0.5 text-[11px] text-fg-muted">Defaults applied on tier change</p>
              <dl className="mt-3 divide-y divide-hairline-soft">
                {data.limits.kycTiers.map((tier) => (
                  <div key={tier.tier} className="flex items-center justify-between gap-2 py-1.5">
                    <dt className="text-[11px] text-fg-muted">Tier {tier.tier}</dt>
                    <dd className="font-mono text-[11px] tabular-nums text-fg">
                      {formatCurrency(tier.limit)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="rounded-md border border-hairline bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold">Webhook signing key</h2>
                  <p className="mt-0.5 text-[11px] text-fg-muted">Hashed at rest; shown once on rotation</p>
                </div>
                <Icon name="key" className="text-[18px] text-fg-faint" />
              </div>
              {data.credentials.exists ? (
                <dl className="mt-3 divide-y divide-hairline-soft">
                  <Row label="Prefix" value={`${data.credentials.prefix}…`} />
                  <Row label="Last four" value={`••••${data.credentials.lastFour}`} />
                  <Row label="Rotated" value={formatDateTime(data.credentials.rotatedAt)} />
                  <Row label="By" value={data.credentials.rotatedByEmail || '—'} />
                </dl>
              ) : (
                <p className="mt-3 text-[11px] text-fg-muted">No key has been issued yet.</p>
              )}
              <button
                type="button"
                onClick={openRotation}
                className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-hairline bg-surface-soft text-[11px] font-semibold text-fg hover:bg-hover"
              >
                <Icon name="autorenew" className="text-[15px]" />
                Rotate signing key
              </button>
            </section>

            <section className="rounded-md border border-hairline bg-card p-4">
              <h2 className="text-sm font-semibold">Environment</h2>
              <p className="mt-0.5 text-[11px] text-fg-muted">Read-only runtime posture</p>
              <dl className="mt-3 divide-y divide-hairline-soft">
                <Row label="Database" value={data.environment.db} capitalize />
                <Row label="Environment" value={data.environment.env} />
                <Row label="Node" value={data.environment.node} />
                <Row label="Uptime" value={formatUptime(data.environment.uptimeSeconds)} />
              </dl>
            </section>
          </div>
        </>
      )}

      <Modal
        open={rotation.open}
        onClose={closeRotation}
        title={rotation.secret ? 'Store the new secret' : 'Rotate signing key'}
        description={
          rotation.secret
            ? 'This is the only time the plaintext will be shown. Existing webhook consumers must be updated immediately.'
            : 'Rotation invalidates the previous key immediately. State the reason for the audit trail.'
        }
        dismissible={!rotation.secret}
        footer={
          rotation.secret ? (
            <>
              <button
                type="button"
                onClick={copySecret}
                className="inline-flex h-9 items-center gap-1 rounded-md border border-hairline px-3 text-xs font-semibold text-fg hover:bg-hover"
              >
                <Icon name="content_copy" className="text-[15px]" />
                Copy
              </button>
              <button
                type="button"
                onClick={closeRotation}
                className="inline-flex h-9 items-center rounded-md bg-brand px-3 text-xs font-semibold text-fg-on-brand hover:bg-brand-hover"
              >
                I stored it
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={closeRotation}
                disabled={rotation.isSaving}
                className="inline-flex h-9 items-center rounded-md border border-hairline px-3 text-xs font-semibold text-fg-muted hover:text-fg"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="rotate-form"
                disabled={rotation.isSaving || rotation.reason.trim().length < 3}
                className="inline-flex h-9 items-center rounded-md bg-negative px-3 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50"
              >
                {rotation.isSaving ? 'Rotating…' : 'Rotate key'}
              </button>
            </>
          )
        }
      >
        {rotation.secret ? (
          <div className="space-y-3">
            <pre className="overflow-x-auto rounded-md border border-warning-border bg-warning-subtle p-3 font-mono text-[11px] text-warning-fg">
              {rotation.secret}
            </pre>
            <p className="text-[11px] text-fg-muted">
              The server stores only a SHA-256 hash. Losing this value means rotating again.
            </p>
          </div>
        ) : (
          <form id="rotate-form" onSubmit={submitRotation} className="space-y-3">
            <p className="rounded-sm border border-warning-border bg-warning-subtle px-2.5 py-2 text-[11px] text-warning-fg">
              Every integration using the current secret will fail until it is reconfigured.
            </p>
            <label className="block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-fg-faint">
                Reason (required, audited)
              </span>
              <textarea
                value={rotation.reason}
                onChange={(event) =>
                  setRotation((current) => ({ ...current, reason: event.target.value }))
                }
                rows={3}
                maxLength={280}
                placeholder="Ticket reference or incident that requires rotation."
                className="w-full rounded-md border border-hairline bg-surface-soft px-2.5 py-2 text-xs text-fg placeholder:text-fg-faint focus:border-brand-border focus:outline-none"
              />
            </label>
            {rotation.error && (
              <p className="rounded-sm border border-negative-border bg-negative-subtle px-2.5 py-2 text-[11px] text-negative-fg">
                {rotation.error}
              </p>
            )}
          </form>
        )}
      </Modal>
    </div>
  )
}

function Row({ label, value, capitalize = false }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <dt className="text-[11px] text-fg-muted">{label}</dt>
      <dd className={`truncate font-mono text-[11px] text-fg ${capitalize ? 'capitalize' : ''}`}>{value}</dd>
    </div>
  )
}

function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${date.toISOString().slice(0, 16).replace('T', ' ')} UTC`
}

function formatUptime(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m ${seconds % 60}s`
}
