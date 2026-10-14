import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { railSchema } from '../../schemas/milestone'
import { RAIL_KINDS } from '../../schemas/enums'
import { Button } from '../ui/Button'

/**
 * Connect-a-rail form. All rules live in `schemas/milestone.js` (`railSchema`);
 * the kind vocabulary is imported from the schema layer. Rails are Naira-only.
 *
 * @param {object} props
 * @param {(values: object) => Promise<void>} props.onSubmit
 * @param {boolean} [props.isSubmitting]
 * @param {boolean} [props.disabled] true once the account has hit its rail limit
 */
export default function ConnectRailForm({ onSubmit, isSubmitting = false, disabled = false }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(railSchema),
    defaultValues: { name: '', kind: 'bank', last4: '' },
  })

  const submit = async (values) => {
    try {
      await onSubmit(values)
      reset()
    } catch {
      // Surfaced by the Context (toast + rollback); keep the values for a retry.
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Rail name" error={errors.name?.message}>
          <input
            type="text"
            placeholder="GTBank"
            disabled={disabled}
            className={inputClass(errors.name)}
            {...register('name')}
          />
        </Field>

        <Field label="Kind" error={errors.kind?.message}>
          <select disabled={disabled} className={inputClass(errors.kind)} {...register('kind')}>
            {RAIL_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Last four digits" error={errors.last4?.message}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          placeholder="0000"
          disabled={disabled}
          className={inputClass(errors.last4)}
          {...register('last4')}
        />
      </Field>

      <div className="flex justify-end pt-1">
        <Button variant="primary" type="submit" disabled={disabled || isSubmitting}>
          {isSubmitting ? 'Connecting…' : 'Connect rail'}
        </Button>
      </div>
    </form>
  )
}

/** @param {{ label: string, error?: string, children: React.ReactNode }} props */
function Field({ label, error, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">{label}</span>
      {children}
      {error && (
        <span role="alert" className="text-xs font-medium text-negative-fg">
          {error}
        </span>
      )}
    </label>
  )
}

function inputClass(error) {
  return `h-10 w-full rounded-lg border bg-control px-3 text-sm text-fg placeholder:text-fg-faint focus:outline-none disabled:opacity-60 ${
    error ? 'border-negative focus:border-negative' : 'border-hairline focus:border-brand'
  }`
}
