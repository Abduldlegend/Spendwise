export const BASE_CURRENCY = "NGN";

export const CATEGORIES = [
  "income",
  "housing",
  "food",
  "groceries",
  "transport",
  "utilities",
  "tech",
  "leisure",
  "subscriptions",
  "health",
  "education",
  "other",
];

export const BUDGETABLE_CATEGORIES = CATEGORIES.filter((value) => value !== "income");

export const CATEGORY_KINDS = ["income", "expense"];
export const CATEGORY_STATUSES = ["enabled", "disabled"];
export const CATEGORY_ACCENTS = [
  "brand",
  "brand-accent-soft",
  "neutral-strong",
  "neutral-soft",
  "neutral-muted",
  "info",
  "positive",
  "warning",
  "negative",
];
export const CATEGORY_KEY_PATTERN = /^[a-z][a-z0-9_]{0,31}$/;

export const TRANSACTION_TYPES = ["income", "expense"];
export const CURRENCIES = [BASE_CURRENCY];
export const PROVIDERS = ["password", "google"];
export const USER_ROLES = ["user", "admin"];
export const RAIL_KINDS = ["bank", "digital", "international", "cash"];
export const RAIL_STATUSES = ["connected", "degraded", "offline"];
export const MILESTONE_STATUSES = ["active", "completed", "archived"];
export const MAX_RAILS = 5;
export const KYC_TIERS = [1, 2, 3];

/**
 * Default exposure per KYC tier, in cents. Admin tier changes reset the user's
 * limit to the tier default; the consumer profile endpoint may still fine-tune it.
 */
export const KYC_TIER_LIMITS_CENTS = {
  1: 500_000_000,
  2: 2_000_000_000,
  3: 10_000_000_000,
};
