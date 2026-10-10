import { http, HttpResponse } from 'msw'
import { MAX_RAILS } from '../schemas/enums'
import { cycleKey } from '../utils/cycle'
import { delay, getUserData, nextId, persistDb, resetDb } from './db'
import {
  createAccount,
  findById,
  publicProfile,
  updateAccountProfile,
  upsertGoogleAccount,
  verifyCredentials,
} from './accounts'

/**
 * MSW handlers.
 *
 * These implement the REST contract exactly as documented in AGENTS.md so the
 * mock can be swapped for a real backend without touching Context or any
 * component. Endpoints added beyond the base contract (milestones, rails,
 * profile, auth) are mirrored one-for-one in `services/api.js`.
 *
 * Every data endpoint is account-scoped: the bearer token carries the account id,
 * and each account only ever sees its own rows.
 */

/** Simulated failure mode, toggled by the Settings page or a test. */
const failNext = { armed: false }

/** @param {number} status @param {string} message */
function error(status, message) {
  return HttpResponse.json({ message }, { status })
}

/**
 * Resolves the signed-in account from the `Authorization: Bearer <id>` header.
 * @param {Request} request
 */
function authenticate(request) {
  const header = request.headers.get('authorization') ?? ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? findById(match[1].trim()) : null
}

/** 401 response shared by every account-scoped endpoint. */
function unauthenticated() {
  return error(401, 'Not authenticated')
}

export const handlers = [
  // ---------------------------------------------------------------- transactions
  http.get('/api/transactions', async ({ request }) => {
    await delay()
    const account = authenticate(request)
    if (!account) return unauthenticated()

    const url = new URL(request.url)
    const cycle = url.searchParams.get('cycle')
    const category = url.searchParams.get('category')

    let rows = getUserData(account.id).transactions
    if (cycle) rows = rows.filter((row) => cycleKey(row.occurredAt) === cycle)
    if (category) rows = rows.filter((row) => row.category === category)

    return HttpResponse.json(structuredClone(rows))
  }),

  http.post('/api/transactions', async ({ request }) => {
    await delay()
    const account = authenticate(request)
    if (!account) return unauthenticated()
    if (failNext.armed) return error(500, 'Ledger service unavailable')

    const data = getUserData(account.id)
    const body = await request.json()
    const now = new Date().toISOString()
    const record = {
      ...body,
      id: nextId('txn'),
      note: body.note ?? '',
      createdAt: now,
      occurredAt: body.occurredAt ?? now,
    }
    data.transactions = [...data.transactions, record]
    persistDb()
    return HttpResponse.json(structuredClone(record), { status: 201 })
  }),

  http.put('/api/transactions/:id', async ({ request, params }) => {
    await delay()
    const account = authenticate(request)
    if (!account) return unauthenticated()
    if (failNext.armed) return error(500, 'Ledger service unavailable')

    const data = getUserData(account.id)
    const index = data.transactions.findIndex((row) => row.id === params.id)
    if (index === -1) return error(404, 'Transaction not found')

    const body = await request.json()
    const updated = { ...data.transactions[index], ...body, id: params.id }
    data.transactions = data.transactions.map((row, i) => (i === index ? updated : row))
    persistDb()
    return HttpResponse.json(structuredClone(updated))
  }),

  http.delete('/api/transactions/:id', async ({ params, request }) => {
    await delay()
    const account = authenticate(request)
    if (!account) return unauthenticated()
    if (failNext.armed) return error(500, 'Ledger service unavailable')

    const data = getUserData(account.id)
    const before = data.transactions.length
    data.transactions = data.transactions.filter((row) => row.id !== params.id)
    if (data.transactions.length === before) return error(404, 'Transaction not found')
    persistDb()
    return new HttpResponse(null, { status: 204 })
  }),

  // --------------------------------------------------------------------- budgets
  http.get('/api/budgets', async ({ request }) => {
    await delay(180)
    const account = authenticate(request)
    if (!account) return unauthenticated()
    return HttpResponse.json(structuredClone(getUserData(account.id).budgets))
  }),

  http.post('/api/budgets', async ({ request }) => {
    await delay()
    const account = authenticate(request)
    if (!account) return unauthenticated()
    if (failNext.armed) return error(500, 'Budget service unavailable')

    const data = getUserData(account.id)
    const body = await request.json()
    const record = {
      ...body,
      id: nextId('bgt'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    data.budgets = [...data.budgets, record]
    persistDb()
    return HttpResponse.json(structuredClone(record), { status: 201 })
  }),

  http.put('/api/budgets/:id', async ({ request, params }) => {
    await delay()
    const account = authenticate(request)
    if (!account) return unauthenticated()
    if (failNext.armed) return error(500, 'Budget service unavailable')

    const data = getUserData(account.id)
    const index = data.budgets.findIndex((row) => row.id === params.id)
    if (index === -1) return error(404, 'Budget not found')

    const body = await request.json()
    const updated = { ...data.budgets[index], ...body, id: params.id, updatedAt: new Date().toISOString() }
    data.budgets = data.budgets.map((row, i) => (i === index ? updated : row))
    persistDb()
    return HttpResponse.json(structuredClone(updated))
  }),

  // ----------------------------------------------------------------- milestones
  http.get('/api/milestones', async ({ request }) => {
    await delay(160)
    const account = authenticate(request)
    if (!account) return unauthenticated()
    return HttpResponse.json(structuredClone(getUserData(account.id).milestones))
  }),

  http.post('/api/milestones', async ({ request }) => {
    await delay()
    const account = authenticate(request)
    if (!account) return unauthenticated()

    const data = getUserData(account.id)
    const body = await request.json()
    const record = { ...body, id: nextId('mls'), createdAt: new Date().toISOString() }
    data.milestones = [...data.milestones, record]
    persistDb()
    return HttpResponse.json(structuredClone(record), { status: 201 })
  }),

  http.put('/api/milestones/:id', async ({ request, params }) => {
    await delay()
    const account = authenticate(request)
    if (!account) return unauthenticated()

    const data = getUserData(account.id)
    const index = data.milestones.findIndex((row) => row.id === params.id)
    if (index === -1) return error(404, 'Milestone not found')
    const body = await request.json()
    const updated = { ...data.milestones[index], ...body, id: params.id }
    data.milestones = data.milestones.map((row, i) => (i === index ? updated : row))
    persistDb()
    return HttpResponse.json(structuredClone(updated))
  }),

  // ---------------------------------------------------------------------- rails
  http.get('/api/rails', async ({ request }) => {
    await delay(120)
    const account = authenticate(request)
    if (!account) return unauthenticated()
    return HttpResponse.json(structuredClone(getUserData(account.id).rails))
  }),

  http.post('/api/rails', async ({ request }) => {
    await delay()
    const account = authenticate(request)
    if (!account) return unauthenticated()
    if (failNext.armed) return error(500, 'Rails service unavailable')

    const data = getUserData(account.id)
    if (data.rails.length >= MAX_RAILS) {
      return error(409, `You can connect up to ${MAX_RAILS} rails`)
    }

    const body = await request.json()
    const record = {
      ...body,
      id: nextId('rail'),
      status: body.status ?? 'connected',
      latencyMs: body.latencyMs ?? 0,
    }
    data.rails = [...data.rails, record]
    persistDb()
    return HttpResponse.json(structuredClone(record), { status: 201 })
  }),

  http.delete('/api/rails/:id', async ({ request, params }) => {
    await delay()
    const account = authenticate(request)
    if (!account) return unauthenticated()
    if (failNext.armed) return error(500, 'Rails service unavailable')

    const data = getUserData(account.id)
    const before = data.rails.length
    data.rails = data.rails.filter((row) => row.id !== params.id)
    if (data.rails.length === before) return error(404, 'Rail not found')
    persistDb()
    return new HttpResponse(null, { status: 204 })
  }),

  // ------------------------------------------------------------------- profile
  http.get('/api/profile', async ({ request }) => {
    await delay(120)
    const account = authenticate(request)
    if (!account) return unauthenticated()
    return HttpResponse.json(publicProfile(account))
  }),

  http.put('/api/profile', async ({ request }) => {
    await delay()
    const account = authenticate(request)
    if (!account) return unauthenticated()

    const body = await request.json()
    const updated = updateAccountProfile(account.id, body)
    return HttpResponse.json(publicProfile(updated))
  }),

  // ---------------------------------------------------------------------- auth
  http.post('/api/auth/register', async ({ request }) => {
    await delay(520)
    const { email, password, fullName, name } = await request.json()
    if (!email) return error(400, 'Email is required')
    if (!password || password.length < 8) return error(400, 'Password must be at least 8 characters')

    try {
      const account = await createAccount({ name: name ?? fullName, email, password })
      return HttpResponse.json({ token: account.id, user: publicProfile(account) })
    } catch (cause) {
      return error(cause.status ?? 400, cause.message)
    }
  }),

  http.post('/api/auth/login', async ({ request }) => {
    await delay(420)
    const { email, password } = await request.json()
    if (!email || !password) return error(400, 'Email and password are required')

    const account = await verifyCredentials(email, password)
    if (!account) return error(401, 'Incorrect email or password')
    return HttpResponse.json({ token: account.id, user: publicProfile(account) })
  }),

  http.post('/api/auth/google', async ({ request }) => {
    await delay(320)
    const { credential } = await request.json()
    if (!credential) return error(400, 'Missing Google credential')

    const profile = decodeIdToken(credential)
    if (!profile?.email) return error(401, 'Invalid Google credential')

    // A real backend would verify the signature against Google's JWKS; the mock
    // decodes the claims and upserts the account.
    try {
      const account = await upsertGoogleAccount({
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.picture,
      })
      return HttpResponse.json({ token: account.id, user: publicProfile(account) })
    } catch (cause) {
      return error(cause.status ?? 400, cause.message)
    }
  }),

  http.post('/api/auth/logout', async () => {
    await delay(140)
    return new HttpResponse(null, { status: 204 })
  }),
]

/**
 * Decodes the payload segment of a JWT without verifying its signature.
 *
 * Stands in for the server-side Google token verification that a real backend
 * would perform before trusting the claims.
 *
 * @param {string} token
 * @returns {object|null}
 */
function decodeIdToken(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * Arms a one-shot failure so the optimistic-update rollback path can be
 * exercised from the UI or a test.
 */
export function armFailure() {
  failNext.armed = true
}

export function disarmFailure() {
  failNext.armed = false
}

export { resetDb }
