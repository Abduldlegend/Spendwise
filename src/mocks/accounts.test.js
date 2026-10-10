import { beforeEach, describe, expect, it } from 'vitest'
import {
  createAccount,
  findByEmail,
  findById,
  listAccounts,
  publicProfile,
  resetAccounts,
  updateAccountProfile,
  upsertGoogleAccount,
  verifyCredentials,
} from './accounts'
import { remove, STORAGE_KEYS } from '../utils/storage'

beforeEach(() => {
  for (const key of Object.values(STORAGE_KEYS)) remove(key)
  resetAccounts()
})

describe('account store', () => {
  it('hashes the password and never persists it in plaintext', async () => {
    const account = await createAccount({ name: 'Ada', email: 'Ada@Example.com', password: 'supersecret' })

    expect(account.email).toBe('ada@example.com')
    expect(account.passwordHash).toBeTruthy()
    expect(account.passwordHash).not.toBe('supersecret')
    expect(JSON.stringify(listAccounts())).not.toContain('supersecret')
  })

  it('salts the hash so identical passwords do not collide', async () => {
    const a = await createAccount({ name: 'A', email: 'a@example.com', password: 'supersecret' })
    const b = await createAccount({ name: 'B', email: 'b@example.com', password: 'supersecret' })

    expect(a.salt).not.toBe(b.salt)
    expect(a.passwordHash).not.toBe(b.passwordHash)
  })

  it('rejects a duplicate email with a 409', async () => {
    await createAccount({ name: 'Ada', email: 'ada@example.com', password: 'supersecret' })

    await expect(
      createAccount({ name: 'Ada 2', email: 'ada@example.com', password: 'anotherpass' }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('verifies correct credentials and rejects wrong ones', async () => {
    const account = await createAccount({ name: 'Ada', email: 'ada@example.com', password: 'supersecret' })

    await expect(verifyCredentials('ada@example.com', 'supersecret')).resolves.toMatchObject({ id: account.id })
    await expect(verifyCredentials('ada@example.com', 'wrong')).resolves.toBeNull()
    await expect(verifyCredentials('nobody@example.com', 'supersecret')).resolves.toBeNull()
  })

  it('strips credential material from the public profile', async () => {
    const account = await createAccount({ name: 'Ada', email: 'ada@example.com', password: 'supersecret' })
    const profile = publicProfile(account)

    expect(profile.passwordHash).toBeUndefined()
    expect(profile.salt).toBeUndefined()
    expect(profile.email).toBe('ada@example.com')
    expect(profile.id).toBe(account.id)
  })

  it('upserts Google accounts without a local password', async () => {
    const created = await upsertGoogleAccount({
      name: 'Grace Hopper',
      email: 'grace@example.com',
      avatarUrl: 'https://img/grace.png',
    })

    expect(created.provider).toBe('google')
    expect(created.passwordHash).toBeNull()
    expect(findByEmail('grace@example.com').name).toBe('Grace Hopper')

    const updated = await upsertGoogleAccount({ name: 'Grace H.', email: 'grace@example.com' })
    expect(updated.id).toBe(created.id)
    expect(updated.name).toBe('Grace H.')
    expect(updated.avatarUrl).toBe('https://img/grace.png')
    expect(listAccounts()).toHaveLength(1)
  })

  it('updates profile fields while preserving identity and credentials', async () => {
    const account = await createAccount({ name: 'Ada', email: 'ada@example.com', password: 'supersecret' })
    const updated = updateAccountProfile(account.id, { baseCurrency: 'USD', name: 'Ada Lovelace' })

    expect(updated.baseCurrency).toBe('USD')
    expect(updated.name).toBe('Ada Lovelace')
    expect(updated.email).toBe('ada@example.com')
    expect(updated.passwordHash).toBe(account.passwordHash)
    expect(findById(account.id).baseCurrency).toBe('USD')
    await expect(verifyCredentials('ada@example.com', 'supersecret')).resolves.toMatchObject({ id: account.id })
  })
})
