import { describe, expect, it } from 'vitest'
import { budgetSchema } from './budget'

const valid = {
  category: 'food',
  allocated: 160000,
  currency: 'NGN',
  cadence: 'monthly',
  isLocked: false,
  policy: {
    autoSweep: { enabled: false, threshold: 0 },
    hardLimitPct: 105,
  },
}

describe('budgetSchema', () => {
  it('accepts a well-formed envelope', () => {
    expect(budgetSchema.safeParse(valid).success).toBe(true)
  })

  it('coerces string allocation from form input', () => {
    const result = budgetSchema.safeParse({ ...valid, allocated: '250000' })
    expect(result.success).toBe(true)
    expect(result.data.allocated).toBe(250000)
  })

  it('rejects a zero allocation', () => {
    expect(budgetSchema.safeParse({ ...valid, allocated: 0 }).success).toBe(false)
  })

  it('rejects a negative allocation', () => {
    expect(budgetSchema.safeParse({ ...valid, allocated: -1 }).success).toBe(false)
  })

  it('rejects more than 2 decimal places', () => {
    expect(budgetSchema.safeParse({ ...valid, allocated: 100.005 }).success).toBe(false)
  })

  it('rejects income as a budgetable category', () => {
    const result = budgetSchema.safeParse({ ...valid, category: 'income' })
    expect(result.success).toBe(false)
  })

  it('rejects a malformed category key', () => {
    expect(budgetSchema.safeParse({ ...valid, category: 'Not A Key' }).success).toBe(false)
  })

  it('accepts a custom expense key; the API checks its direction', () => {
    expect(budgetSchema.safeParse({ ...valid, category: 'crypto' }).success).toBe(true)
  })

  it('accepts every seeded budgetable category', () => {
    for (const category of [
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
      expect(budgetSchema.safeParse({ ...valid, category }).success).toBe(true)
    }
  })

  it('rejects a hard limit below 100%', () => {
    const result = budgetSchema.safeParse({
      ...valid,
      policy: { ...valid.policy, hardLimitPct: 99 },
    })
    expect(result.success).toBe(false)
  })

  it('rejects a negative auto-sweep threshold', () => {
    const result = budgetSchema.safeParse({
      ...valid,
      policy: { autoSweep: { enabled: true, threshold: -1 }, hardLimitPct: 105 },
    })
    expect(result.success).toBe(false)
  })

  it('rejects a locked envelope that also auto-sweeps', () => {
    const result = budgetSchema.safeParse({
      ...valid,
      isLocked: true,
      policy: { autoSweep: { enabled: true, threshold: 50000 }, hardLimitPct: 105 },
    })
    expect(result.success).toBe(false)
  })

  it('applies policy defaults when omitted', () => {
    const { policy: _drop, ...rest } = valid
    const parsed = budgetSchema.parse(rest)
    expect(parsed.policy.hardLimitPct).toBe(105)
    expect(parsed.policy.autoSweep.enabled).toBe(false)
  })
})
