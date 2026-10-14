/**
 * Calendar-month cycle helpers, mirroring `src/utils/cycle.js`. A cycle key is
 * `YYYYMM`; a cycle range is `[start, end)` in local time.
 */

export function cycleRange(cycleKey) {
  const year = Number(cycleKey.slice(0, 4));
  const month = Number(cycleKey.slice(4, 6));
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 1),
  };
}

export function isValidCycleKey(value) {
  return typeof value === "string" && /^\d{6}$/.test(value);
}
