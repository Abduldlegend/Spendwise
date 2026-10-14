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

export const TRANSACTION_TYPES = ["income", "expense"];
export const CURRENCIES = [BASE_CURRENCY];
export const PROVIDERS = ["password", "google"];
export const RAIL_KINDS = ["bank", "digital", "international", "cash"];
export const RAIL_STATUSES = ["connected", "degraded", "offline"];
export const MILESTONE_STATUSES = ["active", "completed", "archived"];
export const MAX_RAILS = 5;
export const KYC_TIERS = [1, 2, 3];
