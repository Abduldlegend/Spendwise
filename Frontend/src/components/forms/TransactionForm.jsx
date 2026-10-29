import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema } from '../../schemas/transaction'
import { DEFAULT_CATEGORY_RECORDS } from '../../utils/categories'
import { Button, Icon } from '../ui/Button'

/**
 * Add / edit transaction form.
 *
 * Owns only its local input state via React Hook Form; the parent page supplies
 * `onSubmit`. Every validation rule lives in `schemas/transaction.js`, and the
 * category options are imported from the schema layer rather than hard-coded
 * here. Amounts are always in Naira.
 *
 * @param {object} props
 * @param {(values: object) => Promise<void>} props.onSubmit
 * @param {object} [props.defaultValues] used when editing
 * @param {Array<object>} props.rails available payment rails
 * @param {Array<object>} [props.categories] runtime categories from the page
 * @param {boolean} [props.isSubmitting]
 * @param {boolean} [props.isEditing]
 * @param {() => void} [props.onCancel]
 */
export default function TransactionForm({
  onSubmit,
  defaultValues,
  rails = [],
  categories = DEFAULT_CATEGORY_RECORDS,
  isSubmitting = false,
  isEditing = false,
  onCancel,
}) {
  const source = categories?.length ? categories : DEFAULT_CATEGORY_RECORDS
  const fallbackCategory =
    source.find((option) => option.kind === 'expense' && option.status !== 'disabled')?.key ?? 'food'

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      category: fallbackCategory,
      description: '',
      note: '',
      railId: rails[0]?.id ?? '',
      occurredAt: new Date().toISOString().slice(0, 10),
      ...defaultValues,
    },
  })

  // React Compiler cannot memoise RHF's `watch`, so the compiler skips this
  // component. That is preferable to mirroring `type`/`category` into further
  // state, which is exactly the duplication AGENTS.md forbids.
  // eslint-disable-next-line react-hooks/incompatible-library
  const type = watch('type')
  const category = watch('category')

  // Only categories matching the direction are offered; an envelope/row already
  // using a now-disabled category keeps it selectable so editing stays lossless.
  const visibleCategories = useMemo(() => {
    const matching = source.filter((option) => option.kind === type)
    const offered = matching.filter((option) => option.status !== 'disabled')
    if (category && !offered.some((option) => option.key === category)) {
      const current = matching.find((option) => option.key === category)
      if (current) offered.push(current)
    }
    return offered.length > 0 ? offered : DEFAULT_CATEGORY_RECORDS.filter((option) => option.kind === type)
  }, [source, type, category])

  useEffect(() => {
    if (!visibleCategories.some((option) => option.key === category)) {
      setValue('category', visibleCategories[0]?.key ?? '')
    }
  }, [visibleCategories, category, setValue])

  const submit = async (values) => {
    await onSubmit(values)
    if (!isEditing) reset()
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
      <fieldset className="flex gap-2">
        <legend className="sr-only">Transaction type</legend>
        {['expense', 'income'].map((option) => (
          <label
            key={option}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-colors ${
              type === option
                ? 'border-brand bg-brand-subtle text-brand-fg'
                : 'border-hairline text-fg-muted hover:border-hairline-strong'
            }`}
          >
            <input type="radio" value={option} className="sr-only" {...register('type')} />
            <Icon name={option === 'income' ? 'south_west' : 'north_east'} className="text-base" />
            {option}
          </label>
        ))}
      </fieldset>

      <Field label="Amount (₦)" error={errors.amount?.message}>
        <input
          type="number"
          step="0.01"
          inputMode="decimal"
          placeholder="0.00"
          className={inputClass(errors.amount)}
          {...register('amount')}
        />
      </Field>

      <Field label="Category" error={errors.category?.message}>
        <select className={inputClass(errors.category)} {...register('category')}>
          {visibleCategories.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <input
          type="text"
          placeholder="What was this for?"
          className={inputClass(errors.description)}
          {...register('description')}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date" error={errors.occurredAt?.message}>
          <input type="date" className={inputClass(errors.occurredAt)} {...register('occurredAt')} />
        </Field>

        <Field label="Rail" error={errors.railId?.message}>
          <select className={inputClass(errors.railId)} {...register('railId')}>
            <option value="">Select a rail</option>
            {rails.map((rail) => (
              <option key={rail.id} value={rail.id}>
                {rail.name} ({rail.currency})
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Note (optional)" error={errors.note?.message}>
        <textarea rows={2} className={`${inputClass(errors.note)} resize-none`} {...register('note')} />
      </Field>

      <div className="flex justify-end gap-2 pt-1">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add transaction'}
        </Button>
      </div>
    </form>
  )
}

function inputClass(error) {
  return `h-10 w-full rounded-lg border bg-control px-3 text-sm text-fg placeholder:text-fg-faint focus:outline-none ${
    error ? 'border-negative focus:border-negative' : 'border-hairline focus:border-brand'
  }`
}

/**
 * @param {object} props
 * @param {string} props.label
 * @param {string} [props.error]
 * @param {import('react').ReactNode} props.children
 */
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
