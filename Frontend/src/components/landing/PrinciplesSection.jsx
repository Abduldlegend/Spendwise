import Container from './Container'
import SectionHeading from './SectionHeading'
import { PILLARS } from './content'

/** The three institutional principles behind the product. */
export default function PrinciplesSection() {
  return (
    <section id="architecture" className="border-b border-hairline py-16 md:py-24">
      <Container>
        <SectionHeading
          center
          eyebrow="Institutional Principles"
          title="Engineered on three foundational values."
          subtitle="Zero financial hype, no gratuitous animations, no credential leaks."
        />

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="space-y-3 rounded-lg border border-hairline bg-card p-6">
              <div className="font-mono text-xs font-semibold uppercase tracking-widest text-brand">
                {pillar.tag}
              </div>
              <h3 className="text-xl font-semibold text-fg">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-fg-muted">{pillar.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
