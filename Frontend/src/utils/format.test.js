import { describe, expect, it } from 'vitest'
import {
  formatAmount,
  formatCompact,
  formatCount,
  formatCurrency,
  formatPercent,
  formatSignedAmount,
} from './format'

describe('formatCount', () => {
  it('groups integer counts', () => {
    expect(formatCount(12480)).toBe('12,480')
  })

  it('rounds fractional input', () => {
    expect(formatCount(12.6)).toBe('13')
  })

  it('formats zero', () => {
    expect(formatCount(0)).toBe('0')
  })

  it('returns an em dash for non-finite input', () => {
    expect(formatCount(NaN)).toBe('—')
  })
})

describe('formatAmount', () => {
  it('groups thousands and keeps 2 decimals', () => {
    expect(formatAmount(1250000)).toBe('1,250,000.00')
  })

  it('formats zero', () => {
    expect(formatAmount(0)).toBe('0.00')
  })

  it('keeps the minus sign ahead of the digits', () => {
    expect(formatAmount(-48320.5)).toBe('-48,320.50')
  })

  it('truncates a third decimal place', () => {
    // 1.005 is a float trap (it is stored as 1.00499...), so the assertion uses
    // a value whose rounding is unambiguous.
    expect(formatAmount(1234.567)).toBe('1,234.57')
  })

  it('returns an em dash for non-finite input', () => {
    expect(formatAmount(NaN)).toBe('—')
    expect(formatAmount(Infinity)).toBe('—')
  })
})

describe('formatCurrency', () => {
  it('prefixes the naira sign', () => {
    expect(formatCurrency(1250000, 'NGN')).toBe('₦1,250,000.00')
  })

  it('defaults to Naira when no currency is supplied', () => {
    expect(formatCurrency(1500)).toBe('₦1,500.00')
  })

  it('falls back to the code for an unknown currency', () => {
    expect(formatCurrency(10, 'EUR')).toBe('EUR 10.00')
  })
})

describe('formatSignedAmount', () => {
  it('signs positive values', () => {
    expect(formatSignedAmount(450000, 'NGN')).toBe('+₦450,000.00')
  })

  it('signs negative values', () => {
    expect(formatSignedAmount(-48320, 'NGN')).toBe('-₦48,320.00')
  })

  it('leaves zero unsigned', () => {
    expect(formatSignedAmount(0, 'NGN')).toBe('₦0.00')
  })
})

describe('formatPercent', () => {
  it('formats a signed ratio', () => {
    expect(formatPercent(0.082)).toBe('+8.2%')
  })

  it('formats a negative ratio', () => {
    expect(formatPercent(-0.031)).toBe('-3.1%')
  })

  it('can omit the sign', () => {
    expect(formatPercent(0.71, { showSign: false })).toBe('71.0%')
  })
})

describe('formatCompact', () => {
  it('abbreviates thousands and drops trailing zeros', () => {
    expect(formatCompact(258000, 'NGN')).toBe('₦258K')
    expect(formatCompact(258500, 'NGN')).toBe('₦259K')
  })

  it('keeps significant trailing zeros on round values', () => {
    expect(formatCompact(100000, 'NGN')).toBe('₦100K')
    expect(formatCompact(2000000, 'NGN')).toBe('₦2M')
  })

  it('abbreviates millions', () => {
    expect(formatCompact(1250000, 'NGN')).toBe('₦1.25M')
  })

  it('falls back to 2 decimals below a thousand', () => {
    expect(formatCompact(450.5, 'NGN')).toBe('₦450.50')
  })

  it('keeps the sign for a negative value', () => {
    expect(formatCompact(-258000, 'NGN')).toBe('-₦258K')
  })
})
