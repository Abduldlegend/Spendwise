/**
 * Section eyebrow + title + optional subtitle.
 *
 * The same three-line lockup opens almost every landing section, so it lives
 * here rather than being re-typed in each one.
 *
 * @param {object} props
 * @param {string} props.eyebrow
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {boolean} [props.center=false]
 * @param {string} [props.className]
 */
export default function SectionHeading({ eyebrow, title, subtitle, center = false, className = '' }) {
  return (
    <div className={`${center ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl'} space-y-3 ${className}`}>
      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brand">{eyebrow}</span>
      <h2 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl md:text-4xl">{title}</h2>
      {subtitle && <p className="text-sm text-fg-muted sm:text-base">{subtitle}</p>}
    </div>
  )
}
