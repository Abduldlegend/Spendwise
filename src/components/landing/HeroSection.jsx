import { Link } from 'react-router-dom'
import Container from './Container'
import DashboardPreview from './DashboardPreview'

/**
 * Above-the-fold hero: announcement pill, headline, sub-headline, the two
 * primary calls to action, a privacy assurance line, and the product preview.
 */
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-hairline pb-16 pt-12 md:pb-24 md:pt-20">
      <Container>
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-soft px-3 py-1 font-mono text-xs text-fg-muted">
            <span className="size-2 animate-pulse rounded-full bg-brand" />
            <span>Introducing SpendWise 2.0 • Local-first Personal Financial Ledger</span>
          </div>

          <h1 className="text-3xl font-semibold leading-[1.12] tracking-tight text-fg sm:text-4xl md:text-5xl lg:text-6xl">
            See your whole financial picture at a glance.
          </h1>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
            Consolidated balances, real-time category envelope budgets, and crystal-clear cashflow metrics
            designed for professionals and creators.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            <Link
              to="/register"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-fg-on-brand transition-transform active:scale-[0.99] sm:w-auto"
            >
              <span>Get started</span>
              <span aria-hidden="true" className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </Link>
            <Link
              to="/signin"
              className="w-full rounded-lg border border-hairline bg-card px-6 py-2.5 text-center text-sm font-medium text-fg transition-colors hover:bg-hover sm:w-auto"
            >
              Sign in
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1 font-mono text-xs text-fg-muted">
            <span aria-hidden="true" className="material-symbols-outlined text-[15px] text-brand">
              verified_user
            </span>
            <span>No bank login required • 100% private &amp; client-side ledger</span>
          </div>
        </div>

        <DashboardPreview />
      </Container>
    </section>
  )
}
