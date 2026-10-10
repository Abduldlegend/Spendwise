/**
 * Time-of-day greeting helpers for the header.
 *
 * The reference screen shows "Good morning, Dami"; the greeting is derived from
 * the local clock and the signed-in user's first name rather than hard-coded.
 */

/**
 * @param {Date} [date] defaults to now; injectable for deterministic tests
 * @returns {'Good morning'|'Good afternoon'|'Good evening'}
 */
export function getGreeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

/**
 * @param {string} [name]
 * @returns {string} the first whitespace-delimited token, or 'there'
 */
export function getFirstName(name) {
  return (name ?? '').trim().split(/\s+/)[0] || 'there'
}
