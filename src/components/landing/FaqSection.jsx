import { useState } from 'react'
import SectionHeading from './SectionHeading'
import { FAQS } from './content'

/**
 * Accordion FAQ. Open state is a local `Set` so any number of answers can be
 * expanded independently, matching the reference behaviour.
 */
export default function FaqSection() {
  const [open, setOpen] = useState(() => new Set())

  const toggle = (id) => {
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section id="faq" className="border-b border-hairline bg-panel/20 py-16 md:py-24">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          center
          eyebrow="Common Inquiries"
          title="Frequently Asked Questions"
          subtitle="Transparent clarity regarding security, pricing, and architecture."
          className="mb-12"
        />

        <div className="space-y-3">
          {FAQS.map((faq) => {
            const isOpen = open.has(faq.id)
            return (
              <div key={faq.id} className="overflow-hidden rounded-lg border border-hairline bg-card">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${faq.id}`}
                  onClick={() => toggle(faq.id)}
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-medium text-fg transition-colors hover:bg-hover/50 sm:text-base"
                >
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    className={`material-symbols-outlined text-fg-muted transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div
                    id={`faq-${faq.id}`}
                    className="border-t border-hairline-soft px-4 pb-4 pt-3 text-xs leading-relaxed text-fg-muted sm:text-sm"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
