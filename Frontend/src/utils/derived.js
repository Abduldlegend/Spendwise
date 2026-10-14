/**
 * Derived value calculators.
 *
 * AGENTS.md: "derived values are never stored". Everything in this module is
 * computed from `transactions` / `budgets` at render time via `useMemo`. There
 * must be no `balance` field on any entity.
 */

import {
  cycleKey,
  cycleKeyToDate,
  getDaysElapsed,
  getDaysLeft,
  isInCurrentCycle,
} from './cycle'

/**
 * Budget health tiers. Single exported constant so thresholds can be retuned
 * without touching component code. See docs/DESIGN.md "Budget Health States".
 */
export const BUDGET_THRESHOLDS = {
  warning: 0.7,
  critical: 0.9,
  locked: 1,
}

/** @param {number} value */
export function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * Sign multiplier for a transaction. Sign comes from `type`, never from the
 * sign of `amount` — amounts are always stored positive.
 * @param {{ type: string, amount: number }} transaction
 */
export function signedAmount(transaction) {
  const amount = round2(transaction.amount)
  return transaction.type === 'income' ? amount : -amount
}

/**
 * Net liquid balance across every rail.
 * @param {Array<object>} transactions
 * @returns {number}
 */
export function getBalance(transactions = []) {
  return round2(
    transactions.reduce((total, tx) => total + signedAmount(tx), 0),
  )
}

/**
 * Net balance per connected rail, derived from that rail's transactions. A rail
 * with no activity is simply absent from the map; callers default it to 0.
 * @param {Array<object>} transactions
 * @returns {Record<string, number>} railId -> net balance
 */
export function getRailBalances(transactions = []) {
  const totals = {}
  for (const tx of transactions) {
    if (!tx.railId) continue
    totals[tx.railId] = round2((totals[tx.railId] ?? 0) + signedAmount(tx))
  }
  return totals
}

/**
 * Inflow / spend for a cycle, with the prior cycle for comparison.
 * @param {Array<object>} transactions
 * @param {object} [options]
 * @param {string} [options.cycle] cycle key; defaults to the current cycle
 * @returns {{ inflow: number, spend: number, net: number,
 *   priorInflow: number, priorSpend: number,
 *   inflowDelta: number|null, spendDelta: number|null }}
 */
export function getFlowTotals(transactions = [], { cycle } = {}) {
  const targetCycle = cycle ?? cycleKey()
  const priorCycle = previousCycleKey(targetCycle)

  let inflow = 0
  let spend = 0
  let priorInflow = 0
  let priorSpend = 0

  for (const tx of transactions) {
    const key = cycleKey(tx.occurredAt)
    if (key === targetCycle) {
      const value = signedAmount(tx)
      if (value >= 0) inflow += value
      else spend += -value
    } else if (key === priorCycle) {
      const value = signedAmount(tx)
      if (value >= 0) priorInflow += value
      else priorSpend += -value
    }
  }

  return {
    inflow: round2(inflow),
    spend: round2(spend),
    net: round2(inflow - spend),
    priorInflow: round2(priorInflow),
    priorSpend: round2(priorSpend),
    inflowDelta: ratioDelta(inflow, priorInflow),
    spendDelta: ratioDelta(spend, priorSpend),
  }
}

/**
 * Percentage change, or null when the baseline is zero (avoid Infinity/NaN
 * surfacing in the UI).
 */
function ratioDelta(current, prior) {
  if (!prior) return null
  return round2((current - prior) / prior)
}

/**
 * Spend per category for a cycle.
 * @returns {Record<string, number>} only non-zero categories are included
 */
export function getCategoryTotals(transactions = [], { cycle } = {}) {
  const targetCycle = cycle ?? cycleKey()
  const totals = {}

  for (const tx of transactions) {
    if (cycleKey(tx.occurredAt) !== targetCycle) continue
    if (tx.type !== 'expense') continue
    const value = round2(tx.amount)
    totals[tx.category] = round2((totals[tx.category] ?? 0) + value)
  }

  return totals
}

/**
 * Spend per category grouped by accent role, for the segmented distribution bar.
 * @returns {Array<{ category: string, amount: number, share: number }>}
 */
export function getCategoryBreakdown(
  transactions = [],
  { cycle, categories } = {},
) {
  const totals = getCategoryTotals(transactions, { cycle })
  const ordered = categories
    ? categories.map((category) => ({ category, amount: totals[category] ?? 0 }))
    : Object.entries(totals)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)

  const total = ordered.reduce((sum, entry) => sum + entry.amount, 0)
  return ordered
    .filter((entry) => entry.amount > 0)
    .map((entry) => ({
      ...entry,
      share: total > 0 ? round2(entry.amount / total) : 0,
    }))
}

/**
 * @param {number} allocated
 * @param {number} spent
 * @returns {{ allocated: number, spent: number, remaining: number,
 *   ratio: number, over: boolean }}
 */
export function getBudgetProgress(allocated, spent) {
  const cap = Math.max(0, allocated || 0)
  const used = Math.max(0, spent || 0)
  const ratio = cap > 0 ? used / cap : 0
  return {
    allocated: round2(cap),
    spent: round2(used),
    // A zero cap means "no envelope exists", so there is nothing left to spend
    // and `over` stays false. Reporting a negative remainder here would claim
    // an overage that cannot be attributed to any envelope.
    remaining: cap > 0 ? round2(cap - used) : 0,
    ratio,
    over: cap > 0 && used > cap,
  }
}

/**
 * @param {number} ratio spent / allocated
 * @returns {'healthy'|'warning'|'critical'|'locked'}
 */
export function getHealthState(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return 'healthy'
  if (ratio >= BUDGET_THRESHOLDS.locked) return 'locked'
  if (ratio >= BUDGET_THRESHOLDS.critical) return 'critical'
  if (ratio >= BUDGET_THRESHOLDS.warning) return 'warning'
  return 'healthy'
}

/**
 * Daily spend pace for the cycle so far.
 * @returns {number} 0 when nothing has been spent
 */
export function getBurnRate(spent, reference = new Date()) {
  if (!spent) return 0
  return round2(spent / getDaysElapsed(reference))
}

/**
 * Straight-line projection of where the envelope lands at cycle close.
 * Deliberately allowed to go negative: a deficit is the single most useful
 * thing this number can say, so it is surfaced rather than clamped to zero.
 * @returns {number} projected remainder, negative when the cap will be breached
 */
export function getProjectedBalance(allocated, spent, reference = new Date()) {
  const burn = getBurnRate(spent, reference)
  const remaining = getDaysLeft(reference)
  return round2(Math.max(0, allocated) - burn * remaining)
}

/**
 * Envelopes approaching or breaching their cap, worst first.
 * @param {Array<object>} budgets
 * @param {Record<string, number>} categoryTotals
 * @returns {Array<object>} alerts carry everything a PolicyAlert needs
 */
export function getPolicyAlerts(budgets = [], categoryTotals = {}) {
  return budgets
    .map((budget) => {
      const spent = categoryTotals[budget.category] ?? 0
      const progress = getBudgetProgress(budget.allocated, spent)
      return {
        budgetId: budget.id,
        category: budget.category,
        state: getHealthState(progress.ratio),
        progress,
      }
    })
    .filter((entry) => entry.state !== 'healthy')
    .sort((a, b) => b.progress.ratio - a.progress.ratio)
}

/**
 * Milestone completion and a linear ETA.
 * @param {object} milestone
 * @param {object} [options]
 * @param {number} [options.monthlyContribution] added to saved per month
 * @returns {{ ratio: number, remaining: number, monthsRemaining: number|null,
 *   eta: Date|null, complete: boolean }}
 */
export function getMilestoneProgress(milestone, { monthlyContribution = 0 } = {}) {
  const target = Math.max(0, milestone.targetAmount || 0)
  const saved = Math.max(0, milestone.savedAmount || 0)

  // A non-positive target is rejected by the schema, so reaching here means
  // corrupt data. Report "no progress, no ETA" rather than pretending the
  // milestone is funded.
  if (target <= 0) {
    return { ratio: 0, remaining: 0, monthsRemaining: null, eta: null, complete: false }
  }

  const ratio = Math.min(1, saved / target)
  const remaining = round2(target - saved)

  if (remaining <= 0) {
    return { ratio: 1, remaining: 0, monthsRemaining: 0, eta: null, complete: true }
  }
  if (monthlyContribution <= 0) {
    return { ratio, remaining, monthsRemaining: null, eta: null, complete: false }
  }

  const monthsRemaining = Math.ceil(remaining / monthlyContribution)
  const eta = new Date()
  eta.setMonth(eta.getMonth() + monthsRemaining)
  return { ratio, remaining, monthsRemaining, eta, complete: false }
}

/**
 * Simulated month-close auto-sweep. No background scheduler exists in a
 * frontend-only build, so the policy is evaluated against the current cycle and
 * its result is displayed rather than executed.
 *
 * @param {Array<object>} budgets
 * @param {Record<string, number>} categoryTotals
 * @param {object} policy
 * @param {boolean} policy.enabled
 * @param {number} policy.threshold
 * @returns {{ eligible: boolean, projectedSurplus: number, swept: number }}
 */
export function getProjectedSweep(budgets = [], categoryTotals = {}, policy = {}) {
  if (!policy?.enabled) {
    return { eligible: false, projectedSurplus: 0, swept: 0 }
  }
  const surplus = round2(
    budgets.reduce(
      (total, budget) =>
        total +
        Math.max(
          0,
          budget.allocated - (categoryTotals[budget.category] ?? 0),
        ),
      0,
    ),
  )
  const threshold = Math.max(0, policy.threshold || 0)
  const swept = surplus > threshold ? surplus : 0
  return { eligible: swept > 0, projectedSurplus: surplus, swept }
}

function previousCycleKey(key) {
  const date = cycleKeyToDate(key)
  return cycleKey(new Date(date.getFullYear(), date.getMonth() - 1, 1))
}

/**
 * Transactions scoped to a cycle, newest first.
 * @param {Array<object>} transactions
 * @param {string} [cycle] omit for "all time"
 */
export function getTransactionsForCycle(transactions = [], cycle) {
  const list = cycle
    ? transactions.filter((tx) => cycleKey(tx.occurredAt) === cycle)
    : [...transactions]
  return list.sort(
    (a, b) => new Date(b.occurredAt) - new Date(a.occurredAt),
  )
}

/**
 * Local filter/sort for the ledger. Pure and local by design — AGENTS.md
 * requires search and filtering never to touch Context or the API.
 *
 * @param {Array<object>} transactions
 * @param {object} filters
 * @param {string} [filters.query]
 * @param {string[]} [filters.categories]
 * @param {'all'|'income'|'expense'} [filters.type]
 * @param {string} [filters.cycle]
 * @param {'date'|'amount'} [filters.sortBy]
 * @param {'asc'|'desc'} [filters.sortDir]
 * @returns {Array<object>}
 */
export function selectTransactions(transactions = [], filters = {}) {
  const {
    query = '',
    categories = [],
    type = 'all',
    cycle,
    sortBy = 'date',
    sortDir = 'desc',
  } = filters

  const needle = query.trim().toLowerCase()
  const wanted = new Set(categories)

  const result = transactions.filter((tx) => {
    if (cycle && cycleKey(tx.occurredAt) !== cycle) return false
    if (type !== 'all' && tx.type !== type) return false
    if (wanted.size > 0 && !wanted.has(tx.category)) return false
    if (needle) {
      const haystack = [tx.description, tx.note, tx.category, tx.railName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })

  const direction = sortDir === 'asc' ? 1 : -1
  return result.sort((a, b) => {
    if (sortBy === 'amount') {
      return (a.amount - b.amount) * direction
    }
    return (new Date(a.occurredAt) - new Date(b.occurredAt)) * direction
  })
}

export { isInCurrentCycle }
