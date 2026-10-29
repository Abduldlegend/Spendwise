/**
 * Deterministic formatters for financial display.
 *
 * Deliberately hand-rolled rather than Intl-based: the ledger must render
 * `₦1,250,000.00` identically in every environment, and monetary output is
 * asserted in tests. Locale-driven grouping can shift with ICU versions.
 */

const SYMBOLS = {
  NGN: '₦',
}

function groupThousands(intPart) {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Absolute value formatted to exactly 2 decimal places, comma grouped.
 * @param {number} value
 * @returns {string}
 */
export function formatAmount(value) {
  if (!Number.isFinite(value)) return '—'
  const negative = value < 0
  const [intPart, decimalPart] = Math.abs(value).toFixed(2).split('.')
  return `${negative ? '-' : ''}${groupThousands(intPart)}.${decimalPart}`
}

/**
 * @param {number} value
 * @returns {string} integer count with comma grouping, e.g. '12,480'
 */
export function formatCount(value) {
  if (!Number.isFinite(value)) return '—'
  return groupThousands(String(Math.round(value)))
}

/**
 * @param {number} value
 * @param {string} currency ISO code, e.g. 'NGN'
 * @returns {string} e.g. '₦1,250,000.00'
 */
export function formatCurrency(value, currency = 'NGN') {
  if (!Number.isFinite(value)) return '—'
  const symbol = SYMBOLS[currency]
  if (!symbol) return `${currency} ${formatAmount(value)}`
  return `${symbol}${formatAmount(value)}`
}

/**
 * Signed amount used in the ledger and on metric cards.
 * @param {number} value
 * @param {string} currency
 * @returns {string} e.g. '+₦450,000.00' or '-₦48,320.00'
 */
export function formatSignedAmount(value, currency = 'NGN') {
  if (!Number.isFinite(value)) return '—'
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${formatCurrency(Math.abs(value), currency)}`
}

/**
 * @param {number} value ratio, e.g. 0.082
 * @param {object} [options]
 * @param {boolean} [options.showSign=true]
 * @param {number} [options.decimals=1]
 * @returns {string} e.g. '+8.2%'
 */
export function formatPercent(value, { showSign = true, decimals = 1 } = {}) {
  if (!Number.isFinite(value)) return '—'
  const sign = showSign && value > 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(decimals)}%`
}

/**
 * @param {number} value
 * @param {string} currency
 * @returns {string} e.g. '₦1.25M'
 */
export function formatCompact(value, currency = 'NGN') {
  if (!Number.isFinite(value)) return '—'
  const symbol = SYMBOLS[currency] ?? ''
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  const units = [
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'K'],
  ]
  for (const [threshold, suffix] of units) {
    if (abs >= threshold) {
      const scaled = abs / threshold
      const digits = scaled >= 100 ? 0 : 2
      return `${sign}${symbol}${trimZeros(scaled.toFixed(digits))}${suffix}`
    }
  }
  return `${sign}${symbol}${abs.toFixed(2)}`
}

/**
 * Strips trailing zeros from the fractional part only. A naive `/\.?0+$/`
 * would turn "100" into "1", which silently corrupts round values like
 * ₦100,000 -> "1K".
 */
function trimZeros(text) {
  return text.includes('.') ? text.replace(/\.?0+$/, '') : text
}
