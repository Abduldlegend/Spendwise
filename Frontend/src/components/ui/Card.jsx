/**
 * The base surface for every panel in the app.
 *
 * `rounded-xl` with a 1px hairline border and no heavy shadow, per
 * `docs/DESIGN.md`.
 *
 * @param {object} props
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {import('react').ReactNode} [props.action] right-aligned header slot
 * @param {boolean} [props.flush=false] remove body padding
 * @param {string} [props.className] extra classes on the root
 * @param {import('react').ReactNode} props.children
 */
export default function Card({
  title,
  subtitle,
  action,
  flush = false,
  className = '',
  children,
}) {
  const hasHeader = Boolean(title || subtitle || action)

  return (
    <section className={`flex flex-col gap-4 rounded-xl border border-hairline bg-card p-4 ${className}`}>
      {hasHeader && (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-fg">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>}
          </div>
          {action && <div className="sm:shrink-0">{action}</div>}
        </header>
      )}
      <div className={flush ? '' : 'px-1 pb-1'}>{children}</div>
    </section>
  )
}
