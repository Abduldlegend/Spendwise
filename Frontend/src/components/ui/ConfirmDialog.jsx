import Modal from './Modal'
import { Button } from './Button'

/**
 * Confirmation dialog for irreversible or destructive actions.
 *
 * Presentational only: it owns no state and reads no Context. The caller
 * controls `open` and supplies the confirm/cancel handlers, so the same dialog
 * serves sign-out, deletes, and any future guarded action.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {import('react').ReactNode} [props.children] extra body content
 * @param {string} [props.confirmLabel='Confirm']
 * @param {string} [props.cancelLabel='Cancel']
 * @param {'danger'|'primary'} [props.tone='danger'] confirm button variant
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
