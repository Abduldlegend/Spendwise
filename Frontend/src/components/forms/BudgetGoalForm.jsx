import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { budgetSchema } from '../../schemas/budget'
import { DEFAULT_EXPENSE_CATEGORIES } from '../../utils/categories'
import { Button } from '../ui/Button'

/**
 * Budget envelope form.
 *
 * Validation lives entirely in `schemas/budget.js`; category options are
 * imported from the schema layer. Owns only local form state. Caps are in Naira.
 *
 * @param {object} props
 * @param {(values: object) => Promise<void>} props.onSubmit
 * @param {object} [props.existing] envelope being edited, for default values
 * @param {Array<object>} [props.categories] runtime categories from the page
 * @param {boolean} [props.isSubmitting]
 * @param {string} [props.cycle]
 * @param {() => void} [props.onCancel]
 */
export default function BudgetGoalForm({
  onSubmit,
  existing,
  categories = DEFAULT_EXPENSE_CATEGORIES,
  isSubmitting = false,
  onCancel,
}) {
  const source = categories?.length ? categories : DEFAULT_EXPENSE_CATEGORIES
  const options = source.filter(
    (option) => option.kind === 'expense' && (option.status !== 'disabled' || option.key === existing?.category),
  )
  const fallbackCategory = existing?.category ?? options[0]?.key ?? 'food'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: existing
      ? {
          category: existing.category,
          allocated: existing.allocated,
          cadence: 'monthly',
          isLocked: existing.isLocked,
          policy: existing.policy,
        }
      : {
          category: fallbackCategory,
          allocated: '',
          cadence: 'monthly',
          isLocked: false,
          policy: { autoSweep: { enabled: false, threshold: 0 }, hardLimitPct: 105 },
        },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Category</span>
        <select
          disabled={Boolean(existing)}
          className={inputClass(errors.category)}
          {...register('category')}
        >
          {options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <span role="alert" className="text-xs font-medium text-negative-fg">
            {errors.category.message}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Monthly cap (₦)</span>
        <input
          type="number"
          step="0.01"
          inputMode="decimal"
          placeholder="150000"
          className={inputClass(errors.allocated)}
          {...register('allocated')}
        />
        {errors.allocated && (
          <span role="alert" className="text-xs font-medium text-negative-fg">
            {errors.allocated.message}
          </span>
        )}
      </label>

      <label className="flex items-start gap-3 rounded-lg border border-hairline p-3">
        <input type="checkbox" className="mt-0.5 size-4 accent-brand" {...register('policy.autoSweep.enabled')} />
        <span className="flex-1">
          <span className="block text-sm font-medium text-fg">Auto-sweep surplus</span>
          <span className="block text-xs text-fg-muted">
            Move unspent balance into savings when the cycle closes. Locked envelopes cannot sweep.
          </span>
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">Sweep threshold</span>
        <input
          type="number"
          step="0.01"
          inputMode="decimal"
          placeholder="40000"
          className={inputClass(errors.policy?.autoSweep?.threshold)}
          {...register('policy.autoSweep.threshold')}
        />
      </label>

      <label className="flex items-start gap-3 rounded-lg border border-hairline p-3">
        <input type="checkbox" className="mt-0.5 size-4 accent-brand" {...register('isLocked')} />
        <span className="flex-1">
          <span className="block text-sm font-medium text-fg">Lock envelope</span>
          <span className="block text-xs text-fg-muted">
            Prevent changes and disable auto-sweep for this category.
          </span>
        </span>
      </label>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save envelope'}
        </Button>
      </div>
    </form>
  )
}

function inputClass(error) {
  return `h-10 w-full rounded-lg border bg-control px-3 text-sm text-fg placeholder:text-fg-faint focus:outline-none disabled:opacity-60 ${
    error ? 'border-negative focus:border-negative' : 'border-hairline focus:border-brand'
  }`
}
