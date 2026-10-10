import { Button, Icon } from './Button'

/**
 * Empty state with an optional call to action.
 *
 * @param {object} props
 * @param {string} [props.icon] Material Symbols glyph name
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {string} [props.actionLabel]
 * @param {() => void} [props.onAction]
 */
export default function EmptyState({ icon = 'inbox', title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="grid size-12 place-items-center rounded-xl bg-track text-fg-faint"
      >
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </span>
      <div className="space-y-1">
        <p className="text-base font-semibold text-fg">{title}</p>
        {description && <p className="mx-auto max-w-sm text-sm text-fg-muted">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} className="mt-1">
          <Icon name="add" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
