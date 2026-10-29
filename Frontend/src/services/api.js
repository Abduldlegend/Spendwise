/**
 * The single network boundary for the application.
 *
 * AGENTS.md: "Never have a component or Context action call anything outside
 * `services/api.js`." No other module may call `fetch`.
 */

import { load, STORAGE_KEYS } from '../utils/storage'
import { API_BASE_URL } from '../config'

/**
 * Base path. Defaults to the bundled MSW mock (`/api`); set `VITE_API_BASE_URL`
 * (e.g. `http://localhost:4000/api/v1`) to target the real backend instead.
 */
const BASE = API_BASE_URL

/**
 * Reads the bearer token for the active session, if any.
 *
 * The token is stored alongside the session by `AuthContext`; scoping requests to
 * it is what gives every account its own rows on the mock backend.
 */
function authHeader() {
  const token = load(STORAGE_KEYS.session, null)?.token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Wraps fetch and normalises error handling.
 *
 * @param {string} path
 * @param {RequestInit} [init]
 * @returns {Promise<any>}
 * @throws {Error} with `.status` and `.body` attached
 */
async function request(path, init = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...authHeader(),
    ...init.headers,
  }

  let response
  try {
    response = await fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' })
  } catch (cause) {
    const error = new Error('Network request failed')
    error.cause = cause
    error.status = 0
    throw error
  }

  if (response.status === 204) return null

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(body?.message ?? `Request failed with ${response.status}`)
    error.status = response.status
    error.body = body
    throw error
  }

  return body
}

/** @param {string} query */
function toQuery(query) {
  if (!query) return ''
  const params = new URLSearchParams(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
  const text = params.toString()
  return text ? `?${text}` : ''
}

// ------------------------------------------------------------------- categories

/**
 * Public taxonomy. Does not require a session, so it can load before sign-in.
 * @returns {Promise<Array<object>>}
 */
export function fetchCategories() {
  return request('/categories')
}

// ------------------------------------------------------------------ transactions

/**
 * @param {object} [query] `{ cycle, category }`
 * @returns {Promise<Array<object>>}
 */
export function fetchTransactions(query) {
  return request(`/transactions${toQuery(query)}`)
}

/**
 * @param {object} payload validated transaction input
 * @returns {Promise<object>} the server record, with a real id
 */
export function createTransaction(payload) {
  return request('/transactions', { method: 'POST', body: JSON.stringify(payload) })
}

/** @param {string} id */
export function updateTransaction(id, payload) {
  return request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

/** @param {string} id */
export function deleteTransaction(id) {
  return request(`/transactions/${id}`, { method: 'DELETE' })
}

// ---------------------------------------------------------------------- budgets

/** @returns {Promise<Array<object>>} */
export function fetchBudgets() {
  return request('/budgets')
}

/** @param {object} payload */
export function createBudget(payload) {
  return request('/budgets', { method: 'POST', body: JSON.stringify(payload) })
}

/** @param {string} id @param {object} payload */
export function updateBudget(id, payload) {
  return request(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

// ------------------------------------------------------------------- milestones

/** @returns {Promise<Array<object>>} */
export function fetchMilestones() {
  return request('/milestones')
}

/** @param {object} payload */
export function createMilestone(payload) {
  return request('/milestones', { method: 'POST', body: JSON.stringify(payload) })
}

/** @param {string} id @param {object} payload */
export function updateMilestone(id, payload) {
  return request(`/milestones/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

// ------------------------------------------------------------------------ rails

/** @returns {Promise<Array<object>>} */
export function fetchRails() {
  return request('/rails')
}

/**
 * Connects a new clearing rail. The server enforces the per-account limit.
 * @param {object} payload validated rail input
 * @returns {Promise<object>} the stored rail, with a real id
 */
export function connectRail(payload) {
  return request('/rails', { method: 'POST', body: JSON.stringify(payload) })
}

/** @param {string} id */
export function disconnectRail(id) {
  return request(`/rails/${id}`, { method: 'DELETE' })
}

// --------------------------------------------------------------------- profile

/** @returns {Promise<object>} */
export function fetchProfile() {
  return request('/profile')
}

/** @param {object} payload */
export function updateProfile(payload) {
  return request('/profile', { method: 'PUT', body: JSON.stringify(payload) })
}

// ------------------------------------------------------------------------ admin

/**
 * Macro platform telemetry. Admin-only; counts and composition, never rows.
 * @param {{ window?: '7d'|'30d'|'90d' }} [query]
 */
export function fetchAdminOverview(query) {
  return request(`/admin/overview${toQuery(query)}`)
}

/**
 * @param {object} [query] `{ search, status, role, kycTier, page, limit, sort }`
 * @returns {Promise<{ items: Array<object>, page: number, limit: number, total: number, pages: number }>}
 */
export function fetchAdminUsers(query) {
  return request(`/admin/users${toQuery(query)}`)
}

/** @param {string} id */
export function fetchAdminUser(id) {
  return request(`/admin/users/${id}`)
}

/**
 * Applies a privileged account action. The reason is mandatory and lands in the
 * audit trail.
 *
 * @param {string} id
 * @param {{ action: 'suspend'|'reinstate'|'role'|'kycTier', reason: string, role?: 'user'|'admin', kycTier?: number }} payload
 */
export function updateAdminUser(id, payload) {
  return request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
}

/**
 * Aggregate ledger telemetry, bucketed by day or ISO week.
 * @param {{ granularity?: 'day'|'week', window?: '30d'|'90d' }} [query]
 */
export function fetchAdminAnalytics(query) {
  return request(`/admin/analytics${toQuery(query)}`)
}

/**
 * @param {object} [query] `{ action, actorEmail, targetType, targetId, page, limit }`
 */
export function fetchAdminAudit(query) {
  return request(`/admin/audit${toQuery(query)}`)
}

/** Full taxonomy, including disabled and system rows. */
export function fetchAdminCategories() {
  return request('/admin/categories')
}

/** @param {object} payload `{ key, label, icon, accent, kind, status, sortOrder, reason }` */
export function createAdminCategory(payload) {
  return request('/admin/categories', { method: 'POST', body: JSON.stringify(payload) })
}

/** @param {string} key @param {object} payload */
export function updateAdminCategory(key, payload) {
  return request(`/admin/categories/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/** Currency, rail aggregates, exposure limits, credential and runtime posture. */
export function fetchAdminSettings() {
  return request('/admin/settings')
}

/** Credential metadata only — never the secret. */
export function fetchAdminCredentials() {
  return request('/admin/credentials')
}

/**
 * Rotates the webhook-signing secret. Returns the plaintext exactly once.
 * @param {{ reason: string }} payload
 */
export function rotateAdminCredential(payload) {
  return request('/admin/credentials', { method: 'PUT', body: JSON.stringify(payload) })
}

// ------------------------------------------------------------------------- auth
/** @param {{ email: string, password: string }} credentials */
export function login(credentials) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
}

/** @param {object} payload */
export function register(payload) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}

/**
 * Exchanges a Google Identity Services ID token for an application session.
 *
 * In production this endpoint would verify the token signature against Google's
 * JWKS; here the MSW handler decodes the payload instead (see `mocks/handlers`).
 *
 * @param {string} credential the Google ID token (JWT)
 */
export function loginWithGoogle(credential) {
  return request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) })
}

export function logout() {
  return request('/auth/logout', { method: 'POST' })
}
