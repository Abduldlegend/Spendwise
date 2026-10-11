import { useToast } from '../../context/ToastContext'
import { Button, Icon } from './Button'

const TONES = {
  success: { icon: 'check_circle', bar: 'bg-positive', iconColor: 'text-positive-fg' },
  error: { icon: 'error', bar: 'bg-negative', iconColor: 'text-negative-fg' },
  info: { icon: 'info', bar: 'bg-brand', iconColor: 'text-brand-fg' },
}

/**
 * Toast viewport.
 *
 * Reads the toast queue from `ToastContext` — the one deliberate exception to
 * "components/ui never touch Context", because the toast queue is presentation
 * state rather than app data. Everything it renders comes from that queue.
 */
export default function ToastViewport() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-60 flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const tone = TONES[toast.tone] ?? TONES.info
        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border border-hairline bg-card pr-2 shadow-popover-light animate-fade-in dark:shadow-popover-dark"
          >
            <span aria-hidden="true" className={`w-1 self-stretch ${tone.bar}`} />
            <Icon name={tone.icon} className={`mt-3.5 text-lg ${tone.iconColor}`} />
            <p className="flex-1 py-3 text-sm text-fg">{toast.message}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="my-2"
            >
              <Icon name="close" className="text-base" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
