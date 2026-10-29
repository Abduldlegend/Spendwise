import { z } from 'zod'

/**
 * Canonical enumerations.
 *
 * The reference prototype carried three conflicting category vocabularies
 * (5 in the spend bar, 5 in the budget cards, 6 in the form select, plus 4 ad-hoc
 * filter-chip values). AGENTS.md requires a single `z.enum` so a typo cannot
 * create an orphan category with no matching budget, so all of them now derive
 * from this one list.
 */

/**
 * The single currency the ledger operates in. The app is Naira-only: there is no
 * currency switching and no cross-currency conversion.
 */
export const BASE_CURRENCY = 'NGN'

export const CURRENCY_META = {
  NGN: { code: 'NGN', symbol: '₦', label: 'Nigerian Naira' },
}

/**
 * The category taxonomy is runtime data owned by the backend (`GET /categories`)
 * and cached in `CategoriesContext`. `CATEGORIES` remains the seeded default key
 * order, used for fallbacks and for ordering before the API responds. Keys are
 * immutable; labels, icons, accents and enabled/disabled status can change.
 */
export const CATEGORIES = [
  'income',
  'housing',
  'food',
  'groceries',
  'transport',
  'utilities',
  'tech',
  'leisure',
  'subscriptions',
  'health',
  'education',
  'other',
]

/** Default categories eligible for an envelope budget cap. */
export const BUDGETABLE_CATEGORIES = CATEGORIES.filter((value) => value !== 'income')

export const CATEGORY_KINDS = ['income', 'expense']

export const CATEGORY_STATUSES = ['enabled', 'disabled']

export const CATEGORY_ACCENT_ROLES = [
  'brand',
  'brand-accent-soft',
  'neutral-strong',
  'neutral-soft',
  'neutral-muted',
  'info',
  'positive',
  'warning',
  'negative',
]

export const CATEGORY_KEY_PATTERN = /^[a-z][a-z0-9_]{0,31}$/

export const TRANSACTION_TYPES = ['income', 'expense']

export const RAIL_KINDS = ['bank', 'digital', 'international', 'cash']

export const RAIL_STATUSES = ['connected', 'degraded', 'offline']

/** A user may keep at most this many clearing rails connected at once. */
export const MAX_RAILS = 5

export const THEMES = ['system', 'light', 'dark']

export const KYC_TIERS = [1, 2, 3]

export const CURRENCY_SCHEMA = z.literal(BASE_CURRENCY)

/**
 * Shape-only category validation.
 *
 * Existence, enabled/disabled status and income-vs-expense direction are enforced
 * by the API service layer, which is the only authority that knows the runtime
 * taxonomy. Forms restrict input to a `<select>`; this schema prevents malformed
 * keys from ever leaving the client.
 */
export const CATEGORY_SCHEMA = z
  .string()
  .trim()
  .regex(CATEGORY_KEY_PATTERN, 'Select a category')
export const TRANSACTION_TYPE_SCHEMA = z.enum(TRANSACTION_TYPES)
export const RAIL_KIND_SCHEMA = z.enum(RAIL_KINDS)
export const RAIL_STATUS_SCHEMA = z.enum(RAIL_STATUSES)
export const THEME_SCHEMA = z.enum(THEMES)
