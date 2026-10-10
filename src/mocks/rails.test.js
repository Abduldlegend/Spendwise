import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest'
import { server } from './server'
import { resetDb } from './db'
import * as api from '../services/api'
import { createAccount, publicProfile } from './accounts'
import { remove, save, STORAGE_KEYS } from '../utils/storage'
import { MAX_RAILS } from '../schemas/enums'

/**
 * Verifies the rails REST contract end-to-end: connect, the per-account limit,
 * and disconnect — all through `services/api.js` over MSW.
 */

let account

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(async () => {
  resetDb()
  for (const key of Object.values(STORAGE_KEYS)) remove(key)
  account = await createAccount({ name: 'Rail Tester', email: 'rails@example.com', password: 'password123' })
  save(STORAGE_KEYS.session, { token: account.id, user: publicProfile(account) })
})
afterAll(() => server.close())

const rail = (overrides = {}) => ({ name: 'GTBank', kind: 'bank', currency: 'NGN', ...overrides })

describe('rails API', () => {
  it('connects a rail and returns a server id', async () => {
    const before = await api.fetchRails()
    const created = await api.connectRail(rail({ last4: '4196' }))

    expect(created.id).toMatch(/^rail_/)
    expect(created.status).toBe('connected')

    const after = await api.fetchRails()
    expect(after).toHaveLength(before.length + 1)
    expect(after.some((row) => row.id === created.id)).toBe(true)
  })

  it('rejects a connection once the account holds the maximum', async () => {
    const current = await api.fetchRails()
    for (let i = current.length; i < MAX_RAILS; i += 1) {
      await api.connectRail(rail({ name: `Rail ${i}` }))
    }

    await expect(api.connectRail(rail({ name: 'One too many' }))).rejects.toThrow(
      new RegExp(`up to ${MAX_RAILS} rails`),
    )

    await expect(api.fetchRails()).resolves.toHaveLength(MAX_RAILS)
  })

  it('disconnects an existing rail', async () => {
    const created = await api.connectRail(rail())
    await api.disconnectRail(created.id)

    const after = await api.fetchRails()
    expect(after.some((row) => row.id === created.id)).toBe(false)
  })

  it('requires authentication', async () => {
    remove(STORAGE_KEYS.session)
    await expect(api.connectRail(rail())).rejects.toThrow(/not authenticated/i)
  })
})
