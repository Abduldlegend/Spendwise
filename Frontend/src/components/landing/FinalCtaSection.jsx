import { Link } from 'react-router-dom'

/** Closing banner: the final conversion prompt before the footer. */
export default function FinalCtaSection() {
  return (
    <section className="border-b border-hairline py-16 md:py-24">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-hairline bg-card p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto max-w-2xl space-y-4">
            <span className="inline-flex rounded border border-brand/20 bg-brand/10 px-2 py-0.5 font-mono text-[11px] font-medium text-brand">
              COMMENCE RECONCILIATION
            </span>
            <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl md:text-4xl">
              Take complete control of your financial ledger today.
            </h2>
            <p className="text-sm leading-relaxed text-fg-muted sm:text-base">
              No credit card, no bank links, no intrusive data telemetry. Just you and your pristine
              mathematical balance sheet.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 pt-4 sm:flex-row">
              <Link
                to="/register"
                className="w-full rounded-lg bg-brand px-6 py-2.5 text-sm font-medium text-fg-on-brand transition-all hover:bg-brand-hover active:scale-[0.98] sm:w-auto"
              >
                Get started
              </Link>
              <Link
                to="/signin"
                className="w-full rounded-lg border border-hairline px-6 py-2.5 text-center text-sm font-medium text-fg transition-colors hover:bg-hover sm:w-auto"
              >
                Already have a ledger? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
