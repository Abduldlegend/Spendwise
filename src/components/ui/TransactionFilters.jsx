import { CATEGORIES } from '../../schemas/enums'
import { getCategoryLabel } from '../../utils/categories'
import { Icon } from './Button'

/**
 * Ledger toolbar: search, type filter, category chips and cycle scope.
 *
 * Local UI state lives in the page; this component only renders and reports
 * changes upward. No Context, no API call on filter.
 *
 * @param {object} props
 * @param {string} props.query
 * @param {(value: string) => void} props.onQueryChange
 * @param {'all'|'income'|'expense'} props.type
 * @param {(value: 'all'|'income'|'expense') => void} props.onTypeChange
 * @param {string[]} props.categories selected category filters
 * @param {(categories: string[]) => void} props.onCategoriesChange
 * @param {string} [props.resultCount]
 */
export default function TransactionFilters({
  query,
  onQueryChange,
  type,
  onTypeChange,
  categories,
  onCategoriesChange,
  resultCount,
}) {
  const toggleCategory = (category) => {
    onCategoriesChange(
      categories.includes(category)
        ? categories.filter((value) => value !== category)
        : [...categories, category],
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search transactions</span>
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint">
            <Icon name="search" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search description, note or category"
            className="h-10 w-full rounded-lg border border-hairline bg-control pl-10 pr-3 text-sm text-fg placeholder:text-fg-faint focus:border-brand focus:outline-none"
          />
        </label>

        <div className="flex rounded-lg border border-hairline bg-control p-0.5" role="group" aria-label="Transaction type">
          {['all', 'income', 'expense'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onTypeChange(option)}
              aria-pressed={type === option}
              className={`h-9 rounded-md px-3 text-sm font-medium capitalize transition-colors ${
                type === option ? 'bg-brand text-fg-on-brand' : 'text-fg-muted hover:text-fg'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORIES.filter((category) => category !== 'income').map((category) => {
          const active = categories.includes(category)
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              aria-pressed={active}
              className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                active
                  ? 'border-brand bg-brand-subtle text-brand-fg'
                  : 'border-hairline text-fg-muted hover:border-hairline-strong hover:text-fg'
              }`}
            >
              {getCategoryLabel(category)}
            </button>
          )
        })}
        {resultCount && <span className="ml-auto text-xs text-fg-muted">{resultCount}</span>}
      </div>
    </div>
  )
}
