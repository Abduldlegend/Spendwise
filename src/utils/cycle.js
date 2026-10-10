/**
 * Calendar-month cycle helpers.
 *
 * A "cycle" is a calendar month. Every budget, flow comparison and policy
 * evaluation is scoped to one, so the boundary logic lives here rather than
 * being re-derived inside components.
 */

/** @param {string|number|Date} value */
export function toDate(value) {
  return value instanceof Date ? value : new Date(value)
}

/**
 * @param {string|number|Date} value
 * @returns {{ year: number, month: number }} month is 1-12
 */
export function getCycle(value = new Date()) {
  const date = toDate(value)
  return { year: date.getFullYear(), month: date.getMonth() + 1 }
}

/**
 * @param {string|number|Date} value
 * @returns {number} e.g. 202609
 */
export function cycleKey(value = new Date()) {
  const { year, month } = getCycle(value)
  return `${year}${String(month).padStart(2, '0')}`
}

/**
 * @param {string|number|Date} value
 * @returns {boolean}
 */
export function isInCurrentCycle(value, reference = new Date()) {
  return cycleKey(value) === cycleKey(reference)
}

/** @param {string|number|Date} value */
export function getPreviousCycle(value = new Date()) {
  const date = toDate(value)
  return new Date(date.getFullYear(), date.getMonth() - 1, 1)
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** @param {string|number|Date} value */
export function getPeriodLabel(value = new Date()) {
  const { year, month } = getCycle(value)
  return `${MONTH_NAMES[month - 1]} ${year}`
}

/** @param {string|number|Date} value */
export function getShortPeriodLabel(value = new Date()) {
  const { year, month } = getCycle(value)
  return `${MONTH_NAMES[month - 1].slice(0, 3)} ${year}`
}

/** @param {string|number|Date} value */
export function daysInCycle(value = new Date()) {
  const date = toDate(value)
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/**
 * Days elapsed in the cycle, counting today. Clamped to >= 1 so burn-rate
 * division never hits zero on the first of the month.
 * @param {string|number|Date} value
 */
export function getDaysElapsed(value = new Date()) {
  const date = toDate(value)
  return Math.min(date.getDate(), daysInCycle(date)) || 1
}

/**
 * @param {string|number|Date} value
 * @returns {number} whole days remaining, 0 on the final day
 */
export function getDaysLeft(value = new Date()) {
  const date = toDate(value)
  return Math.max(0, daysInCycle(date) - date.getDate())
}

/** @param {string|number|Date} value */
export function getMonthStart(value = new Date()) {
  const date = toDate(value)
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/** @param {string|number|Date} value */
export function getMonthEnd(value = new Date()) {
  const date = toDate(value)
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}

/**
 * Ordered list of cycles to render in the period selector, newest first.
 * @param {number} count
 * @param {string|number|Date} [from]
 * @returns {string[]} cycle keys, e.g. ['202609', '202608']
 */
export function getRecentCycles(count = 12, from = new Date()) {
  const start = getCycle(from)
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start.year, start.month - 1 - index, 1)
    return cycleKey(date)
  })
}

/** @param {string} key cycle key, e.g. '202609' */
export function cycleKeyToDate(key) {
  const year = Number(key.slice(0, 4))
  const month = Number(key.slice(4, 6))
  return new Date(year, month - 1, 1)
}
