import { describe, expect, it } from 'vitest'
import { milestoneSchema, railSchema, userSchema } from './milestone'

describe('milestoneSchema', () => {
  const valid = { title: 'MacBook Pro M3 upgrade', targetAmount: 2_400_000, savedAmount: 850_000 }

  it('accepts a well-formed milestone', () => {
    expect(milestoneSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects an empty title', () => {
    expect(milestoneSchema.safeParse({ ...valid, title: '  ' }).success).toBe(false)
  })

  it('rejects a non-positive target', () => {
    expect(milestoneSchema.safeParse({ ...valid, targetAmount: 0 }).success).toBe(false)
  })

  it('rejects a negative saved amount', () => {
    expect(milestoneSchema.safeParse({ ...valid, savedAmount: -1 }).success).toBe(false)
  })

  it('defaults savedAmount and cadence', () => {
    const parsed = milestoneSchema.parse({ title: 'Trip', targetAmount: 100 })
    expect(parsed.savedAmount).toBe(0)
    expect(parsed.cadence).toBe(0)
  })
})

describe('railSchema', () => {
  const valid = { name: 'Zenith Bank', kind: 'bank', currency: 'NGN' }

  it('accepts a rail without a last4', () => {
    expect(railSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects a last4 that is not exactly 4 digits', () => {
    expect(railSchema.safeParse({ ...valid, last4: '123' }).success).toBe(false)
    expect(railSchema.safeParse({ ...valid, last4: '12345' }).success).toBe(false)
    expect(railSchema.safeParse({ ...valid, last4: 'abcd' }).success).toBe(false)
  })

  it('accepts a valid last4', () => {
    expect(railSchema.safeParse({ ...valid, last4: '8201' }).success).toBe(true)
  })

  it('treats a blank last4 as omitted', () => {
    const parsed = railSchema.safeParse({ ...valid, last4: '' })
    expect(parsed.success).toBe(true)
    expect(parsed.data.last4).toBeUndefined()
  })

  it('rejects an unknown kind', () => {
    expect(railSchema.safeParse({ ...valid, kind: 'crypto' }).success).toBe(false)
  })
})

describe('userSchema', () => {
  const valid = { name: 'Damilola Adebayo', email: 'dami@example.com', baseCurrency: 'NGN' }

  it('accepts a well-formed user', () => {
    expect(userSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects an invalid email', () => {
    expect(userSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false)
  })

  it('rejects a short name', () => {
    expect(userSchema.safeParse({ ...valid, name: 'D' }).success).toBe(false)
  })
})
