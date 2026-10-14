import Container from './Container'
import SectionHeading from './SectionHeading'
import { STEPS } from './content'

/** The three-step operating workflow, each with a terminal-style snippet. */
export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-b border-hairline py-16 md:py-24">
      <Container>
        <SectionHeading
          center
          eyebrow="Workflow Discipline"
          title="How SpendWise operates in three simple steps."
          subtitle="Designed for frictionless daily maintenance in under 60 seconds."
        />

        <div className="relative mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number} className="space-y-4 rounded-lg border border-hairline bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold tabular-nums text-brand">{step.number}</span>
                <span aria-hidden="true" className="material-symbols-outlined text-fg-muted">
                  {step.icon}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-fg">{step.title}</h3>
              <p className="text-sm leading-relaxed text-fg-muted">{step.body}</p>
              <div
                className={`rounded border p-2.5 font-mono text-[11px] ${
                  step.tone === 'brand'
                    ? 'border-brand/20 bg-brand/5 text-brand'
                    : 'border-hairline bg-panel text-fg-muted'
                }`}
              >
                {step.command}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
