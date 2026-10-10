import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { milestoneSchema } from '../../schemas/milestone'
import { CURRENCIES } from '../../schemas/enums'
import { Button } from '../ui/Button'

/**
 * Milestone form. All rules live in `schemas/milestone.js`.
 *
 * @param {object} props
 * @param {(values: object) => Promise<void>} props.onSubmit
 * @param {object} [props.existing]
 * @param {boolean} [props.isSubmitting]
 * @param {() => void} [props.onCancel]
 */
export default function MilestoneForm({ onSubmit, existing, isSubmitting = false, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(milestoneSchema),
    defaultValues: existing
      ? {
          title: existing.title,
          targetAmount: existing.targetAmount,
          savedAmount: existing.savedAmount,
          currency: existing.currency,
          cadence: existing.cadence,
        }
      : { title: '', targetAmount: '', savedAmount: 0, currency: 'NGN', cadence: 0 },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Name</span>
        <input
          type="text"
          placeholder="Emergency buffer"
          className={inputClass(errors.title)}
          {...register('title')}
        />
        {errors.title && (
          <span role="alert" className="text-xs font-medium text-negative-fg">
            {errors.title.message}
          </span>
        )}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Target" error={errors.targetAmount?.message}>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="6000000"
            className={inputClass(errors.targetAmount)}
            {...register('targetAmount')}
          />
        </Field>

        <Field label="Already saved" error={errors.savedAmount?.message}>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="0"
            className={inputClass(errors.savedAmount)}
            {...register('savedAmount')}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Monthly contribution" error={errors.cadence?.message}>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            placeholder="350000"
            className={inputClass(errors.cadence)}
            {...register('cadence')}
          />
        </Field>

        <Field label="Currency" error={errors.currency?.message}>
          <select className={inputClass(errors.currency)} {...register('currency')}>
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : existing ? 'Update milestone' : 'Create milestone'}
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
  return `h-10 w-full rounded-lg border bg-control px-3 text-sm text-fg placeholder:text-fg-faint focus:outline-none ${
    error ? 'border-negative focus:border-negative' : 'border-hairline focus:border-brand'
  }`
}
