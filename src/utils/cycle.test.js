import { describe, expect, it } from 'vitest'
import {
  cycleKey,
  cycleKeyToDate,
  daysInCycle,
  getCycle,
  getDaysElapsed,
  getDaysLeft,
  getPeriodLabel,
  getPreviousCycle,
  getRecentCycles,
  isInCurrentCycle,
} from './cycle'

describe('getCycle / cycleKey', () => {
  it('extracts a year and 1-indexed month', () => {
    expect(getCycle('2026-09-14T12:00:00Z')).toEqual({ year: 2026, month: 9 })
  })

  it('zero-pads the cycle key', () => {
    expect(cycleKey('2026-01-05T00:00:00Z')).toBe('202601')
    expect(cycleKey('2026-12-31T00:00:00Z')).toBe('202612')
  })

  it('handles a year boundary', () => {
    expect(cycleKey('2027-01-01T00:00:00Z')).toBe('202701')
  })
})

describe('isInCurrentCycle', () => {
  it('is true for the same month', () => {
    expect(isInCurrentCycle('2026-09-01', '2026-09-28')).toBe(true)
  })

  it('is false across a month boundary', () => {
    expect(isInCurrentCycle('2026-08-31', '2026-09-01')).toBe(false)
  })
})

describe('getPreviousCycle', () => {
  it('steps back one month', () => {
    expect(cycleKey(getPreviousCycle('2026-09-14T00:00:00Z'))).toBe('202608')
  })

  it('rolls back across a year boundary', () => {
    expect(cycleKey(getPreviousCycle('2026-01-15T00:00:00Z'))).toBe('202512')
  })
})

describe('daysInCycle', () => {
  it('handles a 31-day month', () => {
    expect(daysInCycle('2026-09-10T00:00:00Z')).toBe(30)
    expect(daysInCycle('2026-12-10T00:00:00Z')).toBe(31)
  })

  it('handles February in a leap year', () => {
    expect(daysInCycle('2028-02-10T00:00:00Z')).toBe(29)
  })
})

describe('getDaysElapsed / getDaysLeft', () => {
  it('counts elapsed days, never below 1', () => {
    expect(getDaysElapsed('2026-09-01T00:00:00Z')).toBe(1)
    expect(getDaysElapsed('2026-09-15T00:00:00Z')).toBe(15)
  })

  it('counts remaining days and clamps at zero', () => {
    expect(getDaysLeft('2026-09-01T00:00:00Z')).toBe(29)
    expect(getDaysLeft('2026-09-30T00:00:00Z')).toBe(0)
  })
})

describe('getPeriodLabel', () => {
  it('renders a human month and year', () => {
    expect(getPeriodLabel('2024-10-04T00:00:00Z')).toBe('October 2024')
  })
})

describe('getRecentCycles', () => {
  it('returns the requested number of keys, newest first', () => {
    const keys = getRecentCycles(3, '2026-09-14T00:00:00Z')
    expect(keys).toEqual(['202609', '202608', '202607'])
  })

  it('crosses a year boundary', () => {
    const keys = getRecentCycles(3, '2026-01-10T00:00:00Z')
    expect(keys).toEqual(['202601', '202512', '202511'])
  })
})

describe('cycleKeyToDate', () => {
  it('round-trips with cycleKey', () => {
    expect(cycleKey(cycleKeyToDate('202609'))).toBe('202609')
  })
})
