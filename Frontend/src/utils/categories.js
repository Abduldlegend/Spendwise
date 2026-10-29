import { CATEGORIES } from '../schemas/enums'

/**
 * Per-category presentation metadata.
 *
 * The accent ramp and Material Symbols glyphs are design data lifted from the
 * Stitch reference export. They are the fallback for the seeded taxonomy; custom
 * categories carry their own label/icon/accent from the API.
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

/**
 * Seeded taxonomy in display order.
 *
 * The source of truth is the `Category` collection; these records are the
 * offline/fallback shape used before `GET /categories` resolves, in MSW mode, and
 * by presentational components when they are rendered without Context.
 */
export const DEFAULT_CATEGORY_RECORDS = CATEGORIES.map((key, index) => ({
  id: `cat_${key}`,
  key,
  label: CATEGORY_LABELS[key] ?? key,
  icon: CATEGORY_ICONS[key] ?? 'category',
  accent: CATEGORY_ACCENTS[key] ?? 'neutral-muted',
  kind: key === 'income' ? 'income' : 'expense',
  status: 'enabled',
  isSystem: true,
  sortOrder: index * 10,
}))

export const DEFAULT_EXPENSE_CATEGORIES = DEFAULT_CATEGORY_RECORDS.filter(
  (category) => category.kind === 'expense',
)

/**
 * @param {Array<object>} categories
 * @returns {Map<string, object>} key -> category record
 */
export function indexCategories(categories = []) {
  return new Map(categories.map((category) => [category.key, category]))
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
