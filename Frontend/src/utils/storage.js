/**
 * Namespaced localStorage helpers.
 *
 * Every read is defensive: a corrupt or absent entry must never crash a render.
 * AGENTS.md step 7 of the write sequence persists the updated resource array
 * here after a successful mutation.
 */

const PREFIX = 'spendwise:'

/** @param {string} key */
function fullKey(key) {
  return `${PREFIX}${key}`
}

/**
 * @template T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
export function load(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(fullKey(key))
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

/**
 * @param {string} key
 * @param {unknown} value
 */
export function save(key, value) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(fullKey(key), JSON.stringify(value))
  } catch {
    /* quota exceeded or private mode — persistence is best-effort */
  }
}

/** @param {string} key */
export function remove(key) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(fullKey(key))
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEYS = {
  transactions: 'transactions',
  budgets: 'budgets',
  milestones: 'milestones',
  rails: 'rails',
  user: 'user',
  theme: 'theme',
  currency: 'currency',
  session: 'session',
  cycles: 'seen-cycles',
  accounts: 'accounts',
  mockDb: 'mock-db',
}

/**
 * Namespaces a resource key by account id so each signed-in user only ever
 * reads and writes their own cached data.
 *
 * @param {string} base
 * @param {string | null | undefined} accountId
 */
export function accountKey(base, accountId) {
  if (!accountId) return base
  return `${base}:${accountId}`
}
