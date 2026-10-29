import { describe, expect, it } from 'vitest'
import { transactionSchema, toTransactionRecord } from './transaction'

const valid = {
  type: 'expense',
  amount: 48320,
  currency: 'NGN',
  category: 'food',
  description: 'Shoprite Ikeja Mall',
  railId: 'zenith',
  occurredAt: '2026-09-14T14:32:00.000Z',
}

describe('transactionSchema', () => {
  it('accepts a well-formed expense', () => {
    expect(transactionSchema.safeParse(valid).success).toBe(true)
  })

  it('coerces a numeric string amount from form input', () => {
    const result = transactionSchema.safeParse({ ...valid, amount: '1500.50' })
    expect(result.success).toBe(true)
    expect(result.data.amount).toBe(1500.5)
  })

  it('rejects a zero amount', () => {
    const result = transactionSchema.safeParse({ ...valid, amount: 0 })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].message).toMatch(/greater than zero/i)
  })

  it('rejects a negative amount', () => {
    expect(transactionSchema.safeParse({ ...valid, amount: -100 }).success).toBe(false)
  })

  it('rejects more than 2 decimal places', () => {
    const result = transactionSchema.safeParse({ ...valid, amount: 100.005 })
    expect(result.success).toBe(false)
    expect(result.error.issues[0].message).toMatch(/2 decimal places/i)
  })

  it('rejects a malformed category key', () => {
    expect(transactionSchema.safeParse({ ...valid, category: 'not a key' }).success).toBe(false)
    expect(transactionSchema.safeParse({ ...valid, category: '' }).success).toBe(false)
  })

  it('accepts a custom category key, since the taxonomy is runtime data', () => {
    expect(transactionSchema.safeParse({ ...valid, category: 'crypto' }).success).toBe(true)
  })

  it('accepts every seeded category', () => {
    for (const category of [
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
    ]) {
      expect(
        transactionSchema.safeParse({ ...valid, category }).success,
      ).toBe(true)
    }
  })

  it('rejects an unsupported currency', () => {
    expect(transactionSchema.safeParse({ ...valid, currency: 'EUR' }).success).toBe(false)
  })

  it('defaults currency to NGN', () => {
    const { currency: _drop, ...rest } = valid
    expect(transactionSchema.parse(rest).currency).toBe('NGN')
  })

  it('requires a description of at least 2 characters', () => {
    expect(transactionSchema.safeParse({ ...valid, description: 'a' }).success).toBe(false)
    expect(transactionSchema.safeParse({ ...valid, description: '   ' }).success).toBe(false)
  })

  it('rejects an invalid date', () => {
    expect(transactionSchema.safeParse({ ...valid, occurredAt: 'nope' }).success).toBe(false)
  })

  it('rejects a missing rail', () => {
    expect(transactionSchema.safeParse({ ...valid, railId: '' }).success).toBe(false)
  })

  it('treats income and expense as the sign source, not the amount', () => {
    const income = transactionSchema.parse({ ...valid, type: 'income' })
    expect(income.amount).toBeGreaterThan(0)
  })
})

describe('toTransactionRecord', () => {
  it('normalises dates to ISO strings', () => {
    const record = toTransactionRecord(transactionSchema.parse(valid), {
      id: 'tx_1',
      railName: 'Zenith Bank',
      now: new Date('2026-09-14T15:00:00.000Z'),
    })
    expect(record.occurredAt).toBe('2026-09-14T14:32:00.000Z')
    expect(record.createdAt).toBe('2026-09-14T15:00:00.000Z')
    expect(record.railName).toBe('Zenith Bank')
  })

  it('defaults a missing note to an empty string', () => {
    const record = toTransactionRecord(transactionSchema.parse(valid), {
      id: 'tx_1',
      railName: 'Kuda',
    })
    expect(record.note).toBe('')
  })
})
