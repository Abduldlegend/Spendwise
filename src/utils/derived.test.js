import { describe, expect, it } from 'vitest'
import {
  convertAmount,
  getBalance,
  getBudgetProgress,
  getBurnRate,
  getCategoryBreakdown,
  getCategoryTotals,
  getFlowTotals,
  getHealthState,
  getMilestoneProgress,
  getPolicyAlerts,
  getProjectedBalance,
  getProjectedSweep,
  getTransactionsForCycle,
  round2,
  selectTransactions,
  signedAmount,
} from './derived'

/** Builders keep the fixtures readable. */
const tx = (overrides = {}) => ({
  id: 'tx_1',
  type: 'expense',
  amount: 1000,
  currency: 'NGN',
  category: 'food',
  description: 'Test',
  note: '',
  railId: 'zenith',
  railName: 'Zenith Bank',
  occurredAt: '2026-09-14T12:00:00.000Z',
  createdAt: '2026-09-14T12:00:00.000Z',
  ...overrides,
})

describe('round2', () => {
  it('rounds to cents', () => {
    expect(round2(1.005)).toBe(1.01)
    expect(round2(0.1 + 0.2)).toBe(0.3)
  })
})

describe('convertAmount', () => {
  it('is a no-op for the same currency', () => {
    expect(convertAmount(100, 'NGN', 'NGN')).toBe(100)
  })

  it('converts USD to NGN at the seeded rate', () => {
    expect(convertAmount(100, 'USD', 'NGN')).toBe(154025)
  })

  it('converts NGN back down to USD', () => {
    expect(convertAmount(154025, 'NGN', 'USD')).toBe(100)
  })

  it('handles GBP', () => {
    expect(convertAmount(1, 'GBP', 'NGN')).toBe(1950.4)
  })

  it('returns 0 for non-finite input', () => {
    expect(convertAmount(NaN, 'USD', 'NGN')).toBe(0)
  })
})

describe('signedAmount', () => {
  it('derives sign from type, not from the amount', () => {
    expect(signedAmount(tx({ type: 'expense', amount: 500 }))).toBe(-500)
    expect(signedAmount(tx({ type: 'income', amount: 500 }))).toBe(500)
  })

  it('converts into the target currency first', () => {
    expect(signedAmount(tx({ type: 'expense', amount: 100, currency: 'USD' }), 'NGN')).toBe(
      -154025,
    )
  })
})

describe('getBalance', () => {
  it('returns 0 for an empty ledger', () => {
    expect(getBalance([])).toBe(0)
  })

  it('handles a single transaction', () => {
    expect(getBalance([tx({ type: 'income', amount: 500 })])).toBe(500)
  })

  it('nets inflows against outflows', () => {
    const result = getBalance([
      tx({ id: 'a', type: 'income', amount: 5000 }),
      tx({ id: 'b', type: 'expense', amount: 2000 }),
    ])
    expect(result).toBe(3000)
  })

  it('aggregates across mixed currencies', () => {
    const result = getBalance([
      tx({ id: 'a', type: 'income', amount: 1000, currency: 'NGN' }),
      tx({ id: 'b', type: 'income', amount: 100, currency: 'USD' }),
    ])
    expect(result).toBe(155025)
  })
})

describe('getFlowTotals', () => {
  it('returns zeroed totals for an empty ledger', () => {
    const result = getFlowTotals([], { cycle: '202609' })
    expect(result.inflow).toBe(0)
    expect(result.spend).toBe(0)
    expect(result.net).toBe(0)
  })

  it('separates inflow from spend within a cycle', () => {
    const result = getFlowTotals(
      [
        tx({ id: 'a', type: 'income', amount: 1_250_000, occurredAt: '2026-09-01' }),
        tx({ id: 'b', type: 'expense', amount: 680_450, occurredAt: '2026-09-20' }),
      ],
      { cycle: '202609' },
    )
    expect(result.inflow).toBe(1_250_000)
    expect(result.spend).toBe(680_450)
    expect(result.net).toBe(569_550)
  })

  it('compares against the prior cycle', () => {
    const result = getFlowTotals(
      [
        tx({ id: 'a', type: 'income', amount: 1_080_000, occurredAt: '2026-09-01' }),
        tx({ id: 'b', type: 'income', amount: 1_000_000, occurredAt: '2026-08-01' }),
      ],
      { cycle: '202609' },
    )
    expect(result.priorInflow).toBe(1_000_000)
    expect(result.inflowDelta).toBe(0.08)
  })

  it('returns a null delta when the prior cycle is empty (no Infinity)', () => {
    const result = getFlowTotals(
      [tx({ type: 'income', amount: 500, occurredAt: '2026-09-01' })],
      { cycle: '202609' },
    )
    expect(result.inflowDelta).toBeNull()
  })

  it('excludes transactions outside the requested cycle', () => {
    const result = getFlowTotals(
      [tx({ type: 'expense', amount: 999, occurredAt: '2026-07-04' })],
      { cycle: '202609' },
    )
    expect(result.spend).toBe(0)
  })
})

describe('getCategoryTotals', () => {
  it('returns an empty object for an empty ledger', () => {
    expect(getCategoryTotals([], { cycle: '202609' })).toEqual({})
  })

  it('groups spend by category', () => {
    const result = getCategoryTotals(
      [
        tx({ id: 'a', amount: 100, category: 'food' }),
        tx({ id: 'b', amount: 50, category: 'food' }),
        tx({ id: 'c', amount: 20, category: 'transport' }),
      ],
      { cycle: '202609' },
    )
    expect(result).toEqual({ food: 150, transport: 20 })
  })

  it('ignores income', () => {
    const result = getCategoryTotals(
      [tx({ type: 'income', amount: 900, category: 'income' })],
      { cycle: '202609' },
    )
    expect(result).toEqual({})
  })

  it('normalises foreign-currency spend', () => {
    const result = getCategoryTotals(
      [tx({ amount: 100, currency: 'USD', category: 'tech' })],
      { cycle: '202609', currency: 'NGN' },
    )
    expect(result.tech).toBe(154025)
  })
})

describe('getCategoryBreakdown', () => {
  it('returns an empty array when nothing was spent', () => {
    expect(getCategoryBreakdown([], { cycle: '202609' })).toEqual([])
  })

  it('computes shares that sum to 1', () => {
    const result = getCategoryBreakdown(
      [
        tx({ id: 'a', amount: 300, category: 'housing' }),
        tx({ id: 'b', amount: 100, category: 'food' }),
      ],
      { cycle: '202609' },
    )
    expect(result[0]).toMatchObject({ category: 'housing', share: 0.75 })
    expect(result[1]).toMatchObject({ category: 'food', share: 0.25 })
  })

  it('orders segments by spend descending', () => {
    const result = getCategoryBreakdown(
      [
        tx({ id: 'a', amount: 100, category: 'food' }),
        tx({ id: 'b', amount: 900, category: 'housing' }),
      ],
      { cycle: '202609' },
    )
    expect(result.map((entry) => entry.category)).toEqual(['housing', 'food'])
  })

  it('drops zero-amount categories when an explicit order is supplied', () => {
    const result = getCategoryBreakdown(
      [tx({ amount: 100, category: 'food' })],
      { cycle: '202609', categories: ['housing', 'food', 'leisure'] },
    )
    expect(result.map((entry) => entry.category)).toEqual(['food'])
  })
})

describe('getBudgetProgress', () => {
  it('handles a zero cap without dividing by zero', () => {
    const result = getBudgetProgress(0, 500)
    expect(result.ratio).toBe(0)
    expect(result.remaining).toBe(0)
  })

  it('computes a healthy ratio', () => {
    expect(getBudgetProgress(160_000, 40_000).ratio).toBe(0.25)
  })

  it('reports a negative remainder when over budget', () => {
    const result = getBudgetProgress(160_000, 200_000)
    expect(result.remaining).toBe(-40_000)
    expect(result.over).toBe(true)
  })
})

describe('getHealthState', () => {
  it('is healthy below 70%', () => {
    expect(getHealthState(0)).toBe('healthy')
    expect(getHealthState(0.5)).toBe('healthy')
    expect(getHealthState(0.69)).toBe('healthy')
  })

  it('is warning from 70% to 89%', () => {
    expect(getHealthState(0.7)).toBe('warning')
    expect(getHealthState(0.89)).toBe('warning')
  })

  it('is critical from 90% to 99%', () => {
    expect(getHealthState(0.9)).toBe('critical')
    expect(getHealthState(0.99)).toBe('critical')
  })

  it('is locked at 100% and above', () => {
    expect(getHealthState(1)).toBe('locked')
    expect(getHealthState(1.4)).toBe('locked')
  })

  it('is healthy for non-finite input', () => {
    expect(getHealthState(NaN)).toBe('healthy')
  })
})

describe('getBurnRate', () => {
  it('returns 0 when nothing was spent', () => {
    expect(getBurnRate(0, new Date('2026-09-15'))).toBe(0)
  })

  it('divides by days elapsed', () => {
    expect(getBurnRate(283_520, new Date('2026-09-10T00:00:00'))).toBe(28_352)
  })
})

describe('getProjectedBalance', () => {
  it('surfaces a deficit rather than clamping at zero', () => {
    // 10 days elapsed, 20 left => burn 500/day => 1000 - 10000
    const value = getProjectedBalance(1000, 5000, new Date('2026-09-10T00:00:00'))
    expect(value).toBe(-9000)
  })

  it('subtracts the projected burn from the cap', () => {
    const value = getProjectedBalance(1_000_000, 283_520, new Date('2026-09-10T00:00:00'))
    expect(value).toBe(1_000_000 - 28_352 * 20)
  })
})

describe('getPolicyAlerts', () => {
  const budgets = [
    { id: 'b1', category: 'food', allocated: 160_000 },
    { id: 'b2', category: 'housing', allocated: 350_000 },
    { id: 'b3', category: 'transport', allocated: 50_000 },
  ]

  it('returns an empty array when every envelope is healthy', () => {
    const result = getPolicyAlerts(budgets, { food: 1000, housing: 1000, transport: 1000 })
    expect(result).toEqual([])
  })

  it('reports only the breaching envelope when the rest are healthy', () => {
    const result = getPolicyAlerts(budgets, { food: 150_000, transport: 30_000 })
    expect(result).toHaveLength(1)
    expect(result[0].category).toBe('food')
    expect(result[0].state).toBe('critical')
  })

  it('orders multiple breaching envelopes worst first', () => {
    const result = getPolicyAlerts(budgets, { food: 150_000, transport: 48_000, housing: 300_000 })
    expect(result.map((entry) => entry.category)).toEqual(['transport', 'food', 'housing'])
  })

  it('flags a fully consumed envelope as locked', () => {
    const result = getPolicyAlerts(budgets, { housing: 350_000 })
    expect(result[0].state).toBe('locked')
  })

  it('flags an over-budget envelope as locked with a negative remainder', () => {
    const result = getPolicyAlerts(budgets, { food: 200_000 })
    expect(result[0].progress.remaining).toBe(-40_000)
  })

  it('handles an empty budget list', () => {
    expect(getPolicyAlerts([], { food: 100 })).toEqual([])
  })
})

describe('getMilestoneProgress', () => {
  it('is complete when fully funded', () => {
    const result = getMilestoneProgress({ targetAmount: 1000, savedAmount: 1000 })
    expect(result.complete).toBe(true)
    expect(result.ratio).toBe(1)
  })

  it('reports no progress and no ETA for a corrupt zero target', () => {
    const result = getMilestoneProgress({ targetAmount: 0, savedAmount: 0 })
    expect(result.ratio).toBe(0)
    expect(result.complete).toBe(false)
    expect(result.eta).toBeNull()
  })

  it('has no ETA when there is no monthly contribution', () => {
    const result = getMilestoneProgress({ targetAmount: 1000, savedAmount: 100 })
    expect(result.eta).toBeNull()
    expect(result.monthsRemaining).toBeNull()
  })

  it('projects an ETA from the monthly contribution', () => {
    const result = getMilestoneProgress(
      { targetAmount: 1000, savedAmount: 100 },
      { monthlyContribution: 100 },
    )
    expect(result.monthsRemaining).toBe(9)
    expect(result.eta).toBeInstanceOf(Date)
  })
})

describe('getProjectedSweep', () => {
  const budgets = [
    { category: 'food', allocated: 160_000 },
    { category: 'housing', allocated: 350_000 },
  ]

  it('is inert when disabled', () => {
    const result = getProjectedSweep(budgets, { food: 10_000 }, { enabled: false, threshold: 50_000 })
    expect(result.eligible).toBe(false)
    expect(result.swept).toBe(0)
  })

  it('sweeps the total unspent surplus above the threshold', () => {
    const result = getProjectedSweep(
      budgets,
      { food: 10_000, housing: 350_000 },
      { enabled: true, threshold: 50_000 },
    )
    expect(result.projectedSurplus).toBe(150_000)
    expect(result.swept).toBe(150_000)
  })

  it('does not sweep below the threshold', () => {
    const result = getProjectedSweep(
      budgets,
      { food: 159_000, housing: 350_000 },
      { enabled: true, threshold: 50_000 },
    )
    expect(result.swept).toBe(0)
  })
})

describe('getTransactionsForCycle', () => {
  const list = [
    tx({ id: 'a', occurredAt: '2026-09-01' }),
    tx({ id: 'b', occurredAt: '2026-08-01' }),
    tx({ id: 'c', occurredAt: '2026-09-20' }),
  ]

  it('filters to the cycle and sorts newest first', () => {
    const result = getTransactionsForCycle(list, '202609')
    expect(result.map((entry) => entry.id)).toEqual(['c', 'a'])
  })

  it('returns all time when no cycle is given', () => {
    expect(getTransactionsForCycle(list)).toHaveLength(3)
  })
})

describe('selectTransactions', () => {
  const list = [
    tx({ id: 'a', description: 'Shoprite Ikeja', category: 'groceries', amount: 40_000, occurredAt: '2026-09-01' }),
    tx({ id: 'b', description: 'Bolt Ride', category: 'transport', amount: 4_200, type: 'expense', occurredAt: '2026-09-10' }),
    tx({ id: 'c', description: 'Upwork payout', category: 'income', amount: 450_000, type: 'income', occurredAt: '2026-08-10' }),
  ]

  it('searches description, note and category', () => {
    expect(selectTransactions(list, { query: 'shoprite' }).map((e) => e.id)).toEqual(['a'])
    expect(selectTransactions(list, { query: 'Bolt' }).map((e) => e.id)).toEqual(['b'])
    expect(selectTransactions(list, { query: 'transport' }).map((e) => e.id)).toEqual(['b'])
  })

  it('filters by category', () => {
    expect(
      selectTransactions(list, { categories: ['groceries'] }).map((e) => e.id),
    ).toEqual(['a'])
  })

  it('filters by type', () => {
    expect(selectTransactions(list, { type: 'income' }).map((e) => e.id)).toEqual(['c'])
  })

  it('filters by cycle', () => {
    expect(selectTransactions(list, { cycle: '202608' }).map((e) => e.id)).toEqual(['c'])
  })

  it('sorts by amount ascending', () => {
    const result = selectTransactions(list, { sortBy: 'amount', sortDir: 'asc' })
    expect(result.map((e) => e.id)).toEqual(['b', 'a', 'c'])
  })

  it('sorts by date descending by default', () => {
    const result = selectTransactions(list)
    expect(result.map((e) => e.id)).toEqual(['b', 'a', 'c'])
  })

  it('combines filters conjunctively', () => {
    expect(
      selectTransactions(list, { query: 'ride', categories: ['groceries'] }),
    ).toEqual([])
  })

  it('returns an empty array for no matches', () => {
    expect(selectTransactions(list, { query: 'zzzz' })).toEqual([])
  })

  it('handles an empty ledger', () => {
    expect(selectTransactions([])).toEqual([])
  })
})
