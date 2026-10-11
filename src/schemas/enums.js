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
 * The unified category set. `income` is the only category that can never carry
 * a budget cap — it is the inflow side of the ledger.
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

/** Categories eligible for an envelope budget cap. */
export const BUDGETABLE_CATEGORIES = CATEGORIES.filter((value) => value !== 'income')

export const TRANSACTION_TYPES = ['income', 'expense']

export const RAIL_KINDS = ['bank', 'digital', 'international', 'cash']

export const RAIL_STATUSES = ['connected', 'degraded', 'offline']

/** A user may keep at most this many clearing rails connected at once. */
export const MAX_RAILS = 5

export const THEMES = ['system', 'light', 'dark']

export const KYC_TIERS = [1, 2, 3]

export const CURRENCY_SCHEMA = z.literal(BASE_CURRENCY)
export const CATEGORY_SCHEMA = z.enum(CATEGORIES)
export const TRANSACTION_TYPE_SCHEMA = z.enum(TRANSACTION_TYPES)
export const RAIL_KIND_SCHEMA = z.enum(RAIL_KINDS)
export const RAIL_STATUS_SCHEMA = z.enum(RAIL_STATUSES)
export const THEME_SCHEMA = z.enum(THEMES)
