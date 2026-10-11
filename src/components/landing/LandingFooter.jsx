import { Link } from 'react-router-dom'
import BrandMark from '../ui/BrandMark'
import Container from './Container'
import { LANDING_NAV } from './content'

/** Institutional footer: brand narrative, link columns and a compliance strip. */
export default function LandingFooter() {
  return (
    <footer className="border-t border-hairline bg-card py-12">
      <Container>
        <div className="grid grid-cols-1 gap-8 border-b border-hairline pb-10 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <BrandMark link={false} />
            <p className="max-w-sm text-xs leading-relaxed text-fg-muted sm:text-sm">
              Calm, architectural personal finance ledger for modern professionals. Designed for
              mathematical accuracy, complete data privacy, and zero bank friction.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 rounded border border-hairline bg-surface-soft px-2 py-0.5 font-mono text-[10px] text-fg-muted">
                <span className="size-1.5 rounded-full bg-brand" />
                AES-256 CLIENT ENCRYPTION
              </span>
              <span className="inline-flex items-center gap-1 rounded border border-hairline bg-surface-soft px-2 py-0.5 font-mono text-[10px] text-fg-muted">
                NDPR COMPLIANT
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-fg">Navigation</span>
            <ul className="space-y-1.5 text-xs text-fg-muted">
              {LANDING_NAV.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition-colors hover:text-brand">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-fg">Access</span>
            <ul className="space-y-1.5 text-xs text-fg-muted">
              <li>
                <Link to="/signin" className="transition-colors hover:text-brand">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="transition-colors hover:text-brand">
                  Get started
                </Link>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-brand">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-brand">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-brand">
                  Security Whitepaper
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-8 font-mono text-xs text-fg-muted sm:flex-row">
          <div>© 2025 SpendWise Technologies Inc. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>LATENCY: 0.12ms</span>
            <span>STORAGE: LOCAL ONLY</span>
          </div>
        </div>
      </Container>
    </footer>
  )
}
