import { Link } from 'react-router-dom'
import { Icon } from '../../components/ui/Button'

/** 403 state for a signed-in user whose role is not `admin`. */
export default function AdminForbidden() {
  return (
    <div className="grid min-h-dvh place-items-center bg-surface p-6">
      <div className="w-full max-w-md rounded-lg border border-hairline bg-card p-6 text-center">
        <span className="mx-auto grid size-11 place-items-center rounded-md bg-negative-subtle text-negative-fg">
          <Icon name="gpp_bad" className="text-2xl" />
        </span>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-fg-faint">Error 403</p>
        <h1 className="mt-1 text-xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-fg-muted">
          This account does not carry the <code className="font-mono">admin</code> role. The attempt has been
          recorded against your staff identity.
        </p>
        <Link
          to="/dashboard"
          className="mt-5 inline-flex h-9 items-center rounded-md bg-brand px-3 text-xs font-semibold text-fg-on-brand hover:bg-brand-hover"
        >
          Return to your dashboard
        </Link>
      </div>
    </div>
  )
}
