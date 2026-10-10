import CategoryBadge from './CategoryBadge'
import { Icon } from './Button'
import { formatCurrency } from '../../utils/format'

/**
 * Ledger table.
 *
 * Purely presentational — rows, sorting callbacks and row actions all arrive as
 * props, and filtering/sorting state lives in the page (local state only, per
 * AGENTS.md). Testable with static mock props and no Context.
 *
 * @param {object} props
 * @param {Array<object>} props.rows
 * @param {string} [props.currency='NGN']
 * @param {{ key: 'date'|'amount', label: string }} [props.sort]
 * @param {'asc'|'desc'} [props.sortDir]
 * @param {(key: 'date'|'amount') => void} [props.onSort]
 * @param {(row: object) => void} [props.onEdit]
 * @param {(row: object) => void} [props.onDelete]
 * @param {string[]} [props.pendingIds] rows awaiting server confirmation
 */
export default function TransactionTable({
  rows,
  currency = 'NGN',
  sort = 'date',
  sortDir = 'desc',
  onSort,
  onEdit,
  onDelete,
  pendingIds = [],
}) {
  const isPending = (id) => pendingIds.includes(id)

  const sortIcon = (key) => {
    if (sort !== key) return 'unfold_more'
    return sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'
  }

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[46rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-hairline text-left text-xs uppercase tracking-wide text-fg-muted">
            <th scope="col" className="py-2.5 pr-3 font-semibold">Date</th>
            <th scope="col" className="px-3 py-2.5 font-semibold">Description</th>
            <th scope="col" className="px-3 py-2.5 font-semibold">Category</th>
            <th scope="col" className="px-3 py-2.5 font-semibold">Rail</th>
            <th scope="col" className="px-3 py-2.5 text-right font-semibold">
              <button
                type="button"
                onClick={() => onSort?.('amount')}
                className="inline-flex items-center gap-1 hover:text-fg"
              >
                Amount
                <Icon name={sortIcon('amount')} className="text-sm" />
              </button>
            </th>
            <th scope="col" className="py-2.5 pl-3 text-right font-semibold">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const pending = isPending(row.id)
            const isIncome = row.type === 'income'
            return (
              <tr
                key={row.id}
                className={`border-b border-hairline-soft last:border-0 hover:bg-hover ${pending ? 'opacity-60' : ''}`}
              >
                <td className="whitespace-nowrap py-3 pr-3 text-fg-muted">
                  <time dateTime={row.occurredAt}>
                    {new Date(row.occurredAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: '2-digit',
                    })}
                  </time>
                </td>

                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-fg">{row.description}</span>
                    {pending && (
                      <span
                        className="material-symbols-outlined animate-spin text-sm text-fg-faint"
                        aria-label="Saving"
                      >
                        progress_activity
                      </span>
                    )}
                  </div>
                  {row.note && <p className="mt-0.5 truncate text-xs text-fg-muted">{row.note}</p>}
                </td>

                <td className="px-3 py-3">
                  <CategoryBadge category={row.category} size="sm" />
                </td>

                <td className="whitespace-nowrap px-3 py-3 text-xs text-fg-muted">{row.railName}</td>

                <td
                  className={`whitespace-nowrap px-3 py-3 text-right font-semibold tabular-nums ${
                    isIncome ? 'text-positive-fg' : 'text-fg'
                  }`}
                >
                  {isIncome ? '+' : '−'}
                  {formatCurrency(row.amount, row.currency ?? currency)}
                </td>

                <td className="py-3 pl-3 text-right">
                  <div className="flex justify-end gap-1">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        aria-label={`Edit ${row.description}`}
                        className="grid size-8 place-items-center rounded-lg text-fg-muted hover:bg-track hover:text-fg"
                      >
                        <Icon name="edit" className="text-base" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        aria-label={`Delete ${row.description}`}
                        className="grid size-8 place-items-center rounded-lg text-fg-muted hover:bg-negative-subtle hover:text-negative-fg"
                      >
                        <Icon name="delete" className="text-base" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
        </table>
      </div>

      <ul className="flex flex-col divide-y divide-hairline-soft lg:hidden">
        {rows.map((row) => {
          const pending = isPending(row.id)
          const isIncome = row.type === 'income'
          return (
            <li
              key={row.id}
              className={`flex items-start gap-3 py-3 ${pending ? 'opacity-60' : ''}`}
            >
              <CategoryBadge category={row.category} size="sm" />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-fg">{row.description}</span>
                  {pending && (
                    <span
                      className="material-symbols-outlined animate-spin text-sm text-fg-faint"
                      aria-label="Saving"
                    >
                      progress_activity
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-fg-muted">
                  <time dateTime={row.occurredAt}>
                    {new Date(row.occurredAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: '2-digit',
                    })}
                  </time>{' '}
                  · {row.railName}
                </p>
                {row.note && <p className="truncate text-xs text-fg-muted">{row.note}</p>}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`font-semibold tabular-nums ${
                    isIncome ? 'text-positive-fg' : 'text-fg'
                  }`}
                >
                  {isIncome ? '+' : '−'}
                  {formatCurrency(row.amount, row.currency ?? currency)}
                </span>

                {(onEdit || onDelete) && (
                  <div className="flex gap-1">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        aria-label={`Edit ${row.description}`}
                        className="grid size-8 place-items-center rounded-lg text-fg-muted hover:bg-track hover:text-fg"
                      >
                        <Icon name="edit" className="text-base" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        aria-label={`Delete ${row.description}`}
                        className="grid size-8 place-items-center rounded-lg text-fg-muted hover:bg-negative-subtle hover:text-negative-fg"
                      >
                        <Icon name="delete" className="text-base" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
