/** Naira amounts cross the API boundary as decimals; persisted as integer cents. */

export function toCents(amount) {
  return Math.round(Number(amount) * 100);
}

export function toAmount(cents) {
  if (cents === null || cents === undefined) return 0;
  return Number((Number(cents) / 100).toFixed(2));
}
