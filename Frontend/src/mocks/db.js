/**
 * Per-account mock database backing the MSW handlers.
 *
 * Data is partitioned by account id and persisted to `localStorage` so a reload
 * (which resets this module) does not forget a user's edits. A real backend would
 * own this persistence; here the mock keeps it client-side to complete the
 * auth story until the API exists.
 */

import { load, save, STORAGE_KEYS } from '../utils/storage'

/**
 * A brand-new account starts completely empty — no sample transactions,
 * envelopes, milestones or rails. Each account's data is independent, so
 * whatever a user creates is theirs alone.
 */
function freshUserData() {
  return { transactions: [], budgets: [], milestones: [], rails: [] }
}

function loadUsers() {
  const users = load(STORAGE_KEYS.mockDb, {})
  return users && typeof users === 'object' && !Array.isArray(users) ? users : {}
}

export const db = { users: loadUsers() }

function persist() {
  save(STORAGE_KEYS.mockDb, db.users)
}

/**
 * Returns the account's data, seeding its starter copy on first access.
 * @param {string} accountId
 */
export function getUserData(accountId) {
  if (!db.users[accountId]) {
    db.users[accountId] = freshUserData()
    persist()
  }
  return db.users[accountId]
}

/** Persists the in-memory users map to `localStorage`. */
export function persistDb() {
  persist()
}

/** Test helper: drops every account's data and clears the persisted copy. */
export function resetDb() {
  db.users = {}
  persist()
}

let counter = Date.now()

/** Monotonic, collision-free id that sorts by creation order. */
export function nextId(prefix) {
  counter += 1
  return `${prefix}_${counter.toString(36)}`
}

/** Simulated round-trip latency so skeletons and pending states are visible. */
export function delay(ms = 260) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
