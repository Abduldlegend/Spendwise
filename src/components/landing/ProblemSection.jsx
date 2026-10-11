import Container from './Container'
import SectionHeading from './SectionHeading'
import { PROBLEM_QUESTIONS } from './content'

/** The problem statement plus the three core questions the product answers. */
export default function ProblemSection() {
  return (
    <section className="border-b border-hairline py-16 md:py-24">
      <Container>
        <SectionHeading
          eyebrow="The Friction of Modern Money"
          title="Money scattered across disparate apps makes clarity impossible."
          subtitle="Bank push notifications, debit slips, digital wallets, and split-bills create optical confusion. Traditional budgeting apps lock your balance behind invasive credentials and sluggish synchronization. SpendWise cuts through the noise with instant, ledger-grade clarity."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PROBLEM_QUESTIONS.map((entry) => (
            <div key={entry.number} className="space-y-3 rounded-lg border border-hairline bg-card p-6">
              <div className="flex size-8 items-center justify-center rounded border border-hairline font-mono text-xs font-semibold text-brand">
                {entry.number}
              </div>
              <h3 className="text-base font-semibold text-fg">{entry.title}</h3>
              <p className="text-sm leading-relaxed text-fg-muted">{entry.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
