/**
 * The single network boundary for the application.
 *
 * AGENTS.md: "Never have a component or Context action call anything outside
 * `services/api.js`." No other module may call `fetch`.
 */

import { load, STORAGE_KEYS } from '../utils/storage'

/** Base path. Every endpoint below is registered 1:1 in `src/mocks/handlers.js`. */
const BASE = '/api'

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
    response = await fetch(`${BASE}${path}`, { ...init, headers })
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
