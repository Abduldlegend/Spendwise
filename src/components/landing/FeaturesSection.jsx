import Container from './Container'
import SectionHeading from './SectionHeading'
import { FEATURES } from './content'

/** The six-pillar bento grid of core capabilities. */
export default function FeaturesSection() {
  return (
    <section id="features" className="border-b border-hairline bg-panel/30 py-16 md:py-24">
      <Container>
        <SectionHeading
          center
          eyebrow="Engineered Precision"
          title="Everything you need for uncompromising financial control."
          subtitle="Six architectural pillars tailored to replace fragile spreadsheets and chaotic banking apps."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col justify-between gap-4 rounded-xl border border-hairline bg-card p-6 transition-colors hover:border-hairline-strong"
            >
              <div className="space-y-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <span aria-hidden="true" className="material-symbols-outlined text-xl">
                    {feature.icon}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-fg">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-fg-muted">{feature.body}</p>
              </div>
              <div className="border-t border-hairline-soft pt-2 font-mono text-xs text-brand">
                {feature.tag}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
