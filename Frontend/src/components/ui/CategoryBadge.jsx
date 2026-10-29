import {
  ACCENT_CLASSES,
  CATEGORY_ACCENTS,
  getCategoryIcon,
  getCategoryLabel,
} from '../../utils/categories'

/**
 * Category icon tile plus label.
 *
 * Presentational only — every value arrives via props, nothing is read from
 * Context. Used by the ledger rows, budget cards, spend bar and form previews.
 *
 * @param {object} props
 * @param {string} props.category category key
 * @param {{ label: string, icon: string, accent: string }} [props.meta] runtime
 *   category record from the API; falls back to the seeded display metadata
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.showLabel=true]
 * @param {boolean} [props.tile=true]
 */
export default function CategoryBadge({ category, meta, size = 'md', showLabel = true, tile = true }) {
  const role = meta?.accent ?? CATEGORY_ACCENTS[category] ?? 'neutral-muted'
  const accent = ACCENT_CLASSES[role] ?? ACCENT_CLASSES['neutral-muted']
  const icon = meta?.icon ?? getCategoryIcon(category)
  const label = meta?.label ?? getCategoryLabel(category)

  const sizes = {
    sm: { tile: 'size-7 rounded-lg', icon: 'text-[15px]', label: 'text-xs' },
    md: { tile: 'size-9 rounded-xl', icon: 'text-lg', label: 'text-sm' },
    lg: { tile: 'size-11 rounded-xl', icon: 'text-xl', label: 'text-base' },
  }
  const sizing = sizes[size] ?? sizes.md

  return (
    <span className="inline-flex min-w-0 items-center gap-2.5">
      {tile && (
        <span aria-hidden="true" className={`grid shrink-0 place-items-center ${sizing.tile} ${accent.tile}`}>
          <span className={`material-symbols-outlined ${sizing.icon} ${accent.text}`}>{icon}</span>
        </span>
      )}
      {showLabel && <span className={`truncate font-medium text-fg ${sizing.label}`}>{label}</span>}
    </span>
  )
}
