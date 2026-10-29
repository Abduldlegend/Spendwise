import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../../components/ui/Button'
import { isMockApiEnabled } from '../../config'
import { useAuth } from '../../context/AuthContext'
import AdminPageHeader from './AdminPageHeader'

/** Staff session posture. Shows claims and policy, never the token itself. */
export default function AdminGatewayPage() {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/signin', { replace: true })
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <AdminPageHeader
        eyebrow="Security"
        title="Staff sign-in gateway"
        description="Session, role and transport posture for this console. Tokens are never displayed."
      />

      {!isAdmin && !isMockApiEnabled && (
        <p className="rounded-md border border-negative-border bg-negative-subtle px-3 py-2 text-[11px] text-negative-fg">
          This session does not carry the admin role.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-hairline bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Active session</h2>
            <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-positive-fg">
              <span className="size-1.5 rounded-full bg-positive" />
              Authenticated
            </span>
          </div>
          <dl className="mt-3 divide-y divide-hairline-soft">
            <Row label="Staff identity" value={user?.name ?? '—'} />
            <Row label="Email" value={user?.email ?? '—'} />
            <Row label="Role claim" value={user?.role ?? 'not present'} capitalize />
            <Row label="Provider" value={user?.provider ?? '—'} capitalize />
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline px-2.5 text-[11px] font-semibold text-fg-muted hover:border-negative hover:text-negative-fg"
            >
              <Icon name="logout" className="text-[15px]" />
              End session
            </button>
            <Link
              to="/admin/settings"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline px-2.5 text-[11px] font-semibold text-fg-muted hover:text-fg"
            >
              <Icon name="key" className="text-[15px]" />
              Credentials
            </Link>
          </div>
        </section>

        <section className="rounded-md border border-hairline bg-card p-4">
          <h2 className="text-sm font-semibold">Transport & token policy</h2>
          <p className="mt-0.5 text-[11px] text-fg-muted">Defaults enforced by the API server</p>
          <dl className="mt-3 divide-y divide-hairline-soft">
            <Row label="Access token TTL" value="15 minutes" />
            <Row label="Refresh token TTL" value="7 days" />
            <Row label="Transport" value="Bearer · HTTPS in production" />
            <Row label="Storage" value="localStorage (this browser)" />
            <Row label="Role source" value="JWT claim, reissued on refresh" />
          </dl>
          <p className="mt-3 rounded-sm border border-hairline bg-surface-soft px-2.5 py-2 text-[10px] leading-relaxed text-fg-muted">
            A demotion takes effect when the next access token is issued. Ending the session revokes the
            browser token immediately; the refresh token is cleared with it.
          </p>
        </section>
      </div>

      <section className="rounded-md border border-hairline bg-card p-4">
        <h2 className="text-sm font-semibold">Zero-knowledge ledger policy</h2>
        <ul className="mt-2 space-y-2 text-[11px] leading-relaxed text-fg-muted">
          <li className="flex gap-2">
            <Icon name="check" className="mt-px text-[14px] text-positive-fg" />
            Admin endpoints return counts and metadata, never transaction rows, amounts, descriptions or notes.
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="mt-px text-[14px] text-positive-fg" />
            User actions require a written reason and are appended to an immutable audit log.
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="mt-px text-[14px] text-positive-fg" />
            Platform secrets are stored as SHA-256 hashes and shown once at rotation.
          </li>
          <li className="flex gap-2">
            <Icon name="check" className="mt-px text-[14px] text-positive-fg" />
            The console refuses to run against the bundled mock API.
          </li>
        </ul>
      </section>
    </div>
  )
}

function Row({ label, value, capitalize = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <dt className="text-[11px] text-fg-muted">{label}</dt>
      <dd className={`truncate font-mono text-[11px] text-fg ${capitalize ? 'capitalize' : ''}`}>{value}</dd>
    </div>
  )
}
