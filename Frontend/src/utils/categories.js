/**
 * Per-category presentation metadata.
 *
 * The accent ramp and Material Symbols glyphs are design data lifted from the
 * Stitch reference export. Keeping them beside the enum (rather than inside a
 * component) is what lets the spend bar, the ledger rows, the budget cards and
 * the filter chips all render the same category identically.
 */

export const CATEGORY_ACCENTS = {
  housing: 'brand',
  food: 'brand-accent-soft',
  utilities: 'neutral-strong',
  tech: 'info',
  leisure: 'neutral-soft',
  groceries: 'positive',
  transport: 'warning',
  subscriptions: 'info',
  health: 'negative',
  education: 'info',
  other: 'neutral-muted',
  income: 'positive',
}

export const CATEGORY_ICONS = {
  housing: 'home',
  food: 'restaurant',
  utilities: 'bolt',
  tech: 'cloud',
  leisure: 'movie',
  groceries: 'shopping_basket',
  transport: 'directions_car',
  subscriptions: 'autorenew',
  health: 'favorite',
  education: 'school',
  other: 'category',
  income: 'payments',
}

export const CATEGORY_LABELS = {
  housing: 'Housing & Rent',
  food: 'Food & Dining',
  utilities: 'Utilities & Power',
  tech: 'Tech & Cloud',
  leisure: 'Leisure & Personal',
  groceries: 'Groceries',
  transport: 'Transport',
  subscriptions: 'Subscriptions',
  health: 'Health',
  education: 'Education',
  other: 'Other',
  income: 'Income / Wire',
}

/**
 * Tailwind class fragments per accent role. Declared statically so the JIT
 * scanner can see every literal.
 */
export const ACCENT_CLASSES = {
  brand: { dot: 'bg-brand', text: 'text-brand-fg', tile: 'bg-brand-subtle' },
  'brand-accent-soft': {
    dot: 'bg-brand-accent',
    text: 'text-brand-fg',
    tile: 'bg-brand-subtle',
  },
  'neutral-strong': { dot: 'bg-fg-secondary', text: 'text-fg-secondary', tile: 'bg-track' },
  'neutral-soft': { dot: 'bg-fg-faint', text: 'text-fg-muted', tile: 'bg-track' },
  'neutral-muted': { dot: 'bg-fg-faint', text: 'text-fg-muted', tile: 'bg-track' },
  info: { dot: 'bg-info', text: 'text-info', tile: 'bg-info-subtle' },
  positive: { dot: 'bg-positive', text: 'text-positive-fg', tile: 'bg-positive-subtle' },
  warning: { dot: 'bg-warning', text: 'text-warning-fg', tile: 'bg-warning-subtle' },
  negative: { dot: 'bg-negative', text: 'text-negative-fg', tile: 'bg-negative-subtle' },
}

/** @param {string} category */
export function getCategoryAccent(category) {
  return CATEGORY_ACCENTS[category] ?? 'neutral-muted'
}

/** @param {string} category */
export function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] ?? 'category'
}

/** @param {string} category */
export function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] ?? 'Other'
}
