/**
 * Account store for the mock auth backend.
 *
 * Until a real backend exists, the "user table" lives in `localStorage`. It is
 * intentionally stateless (every call re-reads storage) so multiple MSW workers,
 * a reload, or a test reset can never see stale in-memory accounts.
 *
 * Passwords are never stored in plaintext: each account keeps a per-account salt
 * and a PBKDF2-SHA256 derived hash (see `utils/password`). This is still only
 * client-side protection — a real backend must own this table — but it means a
 * stolen `localStorage` dump does not hand over the raw passwords.
 */

import { hashPassword, randomSalt, saltToB64, b64ToSalt, verifyPassword } from '../utils/password'
import { load, save, STORAGE_KEYS } from '../utils/storage'

/** @typedef {'password'|'google'} AuthProvider */

let counter = 0

function nextAccountId() {
  counter += 1
  return `acc_${Date.now().toString(36)}_${counter.toString(36)}`
}

/** @returns {Array<object>} */
function readAccounts() {
  const list = load(STORAGE_KEYS.accounts, [])
  return Array.isArray(list) ? list : []
}

/** @param {Array<object>} list */
function writeAccounts(list) {
  save(STORAGE_KEYS.accounts, list)
}

/** @param {string} email */
function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

/**
 * Strips credential material before an account is sent to the client.
 * @param {object} account
 */
export function publicProfile(account) {
  if (!account) return null
  const { passwordHash: _passwordHash, salt: _salt, ...profile } = account
  return profile
}

/** @param {string} email */
export function findByEmail(email) {
  const target = normalizeEmail(email)
  return readAccounts().find((account) => account.email === target) ?? null
}

/** @param {string} id */
export function findById(id) {
  if (!id) return null
  return readAccounts().find((account) => account.id === id) ?? null
}

export function listAccounts() {
  return readAccounts()
}

/**
 * Creates a password account. Throws an `Error` with `.status = 409` when the
 * email is already registered.
 *
 * @param {{ name?: string, email: string, password: string }} input
 */
export async function createAccount({ name, email, password }) {
  const normalized = normalizeEmail(email)
  if (!normalized) {
    const error = new Error('Email is required')
    error.status = 400
    throw error
  }
  if (findByEmail(normalized)) {
    const error = new Error('An account with this email already exists')
    error.status = 409
    throw error
  }

  const salt = saltToB64(randomSalt())
  const passwordHash = await hashPassword(password, b64ToSalt(salt))
  const account = {
    id: nextAccountId(),
    name: name?.trim() || normalized.split('@')[0],
    email: normalized,
    passwordHash,
    salt,
    provider: 'password',
    avatarUrl: null,
    baseCurrency: 'NGN',
    kycTier: 1,
    kycLimit: 5_000_000,
    createdAt: new Date().toISOString(),
  }

  writeAccounts([...readAccounts(), account])
  return account
}

/**
 * Finds or creates the account backing a Google sign-in. Google accounts carry
 * no local password.
 *
 * @param {{ name?: string, email: string, avatarUrl?: string }} profile
 */
export async function upsertGoogleAccount({ name, email, avatarUrl }) {
  const normalized = normalizeEmail(email)
  if (!normalized) {
    const error = new Error('Google account did not include an email')
    error.status = 401
    throw error
  }

  const existing = findByEmail(normalized)
  if (existing) {
    const updated = {
      ...existing,
      name: name?.trim() || existing.name,
      avatarUrl: avatarUrl ?? existing.avatarUrl,
    }
    writeAccounts(readAccounts().map((account) => (account.id === existing.id ? updated : account)))
    return updated
  }

  const account = {
    id: nextAccountId(),
    name: name?.trim() || normalized.split('@')[0],
    email: normalized,
    passwordHash: null,
    salt: null,
    provider: 'google',
    avatarUrl: avatarUrl ?? null,
    baseCurrency: 'NGN',
    kycTier: 1,
    kycLimit: 5_000_000,
    createdAt: new Date().toISOString(),
  }
  writeAccounts([...readAccounts(), account])
  return account
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object|null>} the account, or null when the credentials do not match
 */
export async function verifyCredentials(email, password) {
  const account = findByEmail(email)
  if (!account || !account.passwordHash || !account.salt) return null
  const ok = await verifyPassword(password, b64ToSalt(account.salt), account.passwordHash)
  return ok ? account : null
}

/**
 * Merges profile fields onto an account.
 *
 * @param {string} id
 * @param {object} patch
 */
export function updateAccountProfile(id, patch) {
  let updated = null
  writeAccounts(
    readAccounts().map((account) => {
      if (account.id !== id) return account
      updated = {
        ...account,
        ...patch,
        id: account.id,
        email: account.email,
        passwordHash: account.passwordHash,
        salt: account.salt,
        provider: account.provider,
      }
      return updated
    }),
  )
  return updated
}

/** Test helper: wipes the account table. */
export function resetAccounts() {
  writeAccounts([])
}
