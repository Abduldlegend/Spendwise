import { useEffect } from 'react'
import { Button, Icon } from './Button'

/**
 * Accessible modal dialog.
 *
 * Closes on Escape and on backdrop click, moves focus inside on mount and traps
 * Tab while open, and restores focus to the trigger on unmount.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {boolean} [props.dismissible=true] allow Escape/backdrop to close
 * @param {import('react').ReactNode} [props.footer]
 * @param {import('react').ReactNode} props.children
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  dismissible = true,
  footer,
  children,
}) {
  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && dismissible) {
        event.stopPropagation()
        onClose()
      }
      if (event.key === 'Tab') {
        const focusable = event.currentTarget.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    // Focus the panel itself so screen readers announce the dialog.
    const panel = document.querySelector('[data-modal-panel]')
    panel?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = overflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [open, onClose, dismissible])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={dismissible ? onClose : undefined}
        className="absolute inset-0 cursor-default bg-overlay"
      />
      <div
        data-modal-panel
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        tabIndex={-1}
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-t-2xl border border-hairline bg-card p-5 shadow-popover-light animate-fade-in focus:outline-none sm:rounded-2xl dark:shadow-popover-dark"
      >
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="modal-title" className="text-lg font-semibold text-fg">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1 text-sm text-fg-muted">
                {description}
              </p>
            )}
          </div>
          {dismissible && (
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <Icon name="close" />
            </Button>
          )}
        </header>

        <div className="flex-1">{children}</div>

        {footer && <footer className="flex justify-end gap-2 pt-1">{footer}</footer>}
      </div>
    </div>
  )
}
