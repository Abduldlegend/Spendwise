import { Icon } from '../../components/ui/Button'

/**
 * Ops page heading with an optional action slot.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {string} [props.eyebrow]
 * @param {import('react').ReactNode} [props.actions]
 */
export default function AdminPageHeader({ title, description, eyebrow, actions }) {
  return (
    <header className="flex flex-col gap-3 border-b border-hairline pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-fg-faint">
            <Icon name="arrow_forward" className="text-[12px]" />
            {eyebrow}
          </p>
        )}
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-0.5 text-xs text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
