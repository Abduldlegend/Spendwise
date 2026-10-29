import { Category } from "../models/Category.js";

/**
 * The taxonomy the product shipped with before categories became runtime data.
 * These are seeded on boot with `$setOnInsert`, so admin edits (renames,
 * disabling, reordering) survive restarts.
 */
export const DEFAULT_CATEGORIES = [
  { key: "income", label: "Income / Wire", icon: "payments", accent: "positive", kind: "income", sortOrder: 0 },
  { key: "housing", label: "Housing & Rent", icon: "home", accent: "brand", kind: "expense", sortOrder: 10 },
  { key: "food", label: "Food & Dining", icon: "restaurant", accent: "brand-accent-soft", kind: "expense", sortOrder: 20 },
  { key: "groceries", label: "Groceries", icon: "shopping_basket", accent: "positive", kind: "expense", sortOrder: 30 },
  { key: "transport", label: "Transport", icon: "directions_car", accent: "warning", kind: "expense", sortOrder: 40 },
  { key: "utilities", label: "Utilities & Power", icon: "bolt", accent: "neutral-strong", kind: "expense", sortOrder: 50 },
  { key: "tech", label: "Tech & Cloud", icon: "cloud", accent: "info", kind: "expense", sortOrder: 60 },
  { key: "leisure", label: "Leisure & Personal", icon: "movie", accent: "neutral-soft", kind: "expense", sortOrder: 70 },
  { key: "subscriptions", label: "Subscriptions", icon: "autorenew", accent: "info", kind: "expense", sortOrder: 80 },
  { key: "health", label: "Health", icon: "favorite", accent: "negative", kind: "expense", sortOrder: 90 },
  { key: "education", label: "Education", icon: "school", accent: "info", kind: "expense", sortOrder: 100 },
  { key: "other", label: "Other", icon: "category", accent: "neutral-muted", kind: "expense", sortOrder: 110 },
];

/**
 * Idempotent seed keyed on the immutable category `key`.
 *
 * @param {{ force?: boolean }} [options] `force` overwrites the seed rows, which
 *   the `seed:categories` script uses to repair a broken taxonomy.
 */
export async function seedCategories({ force = false } = {}) {
  const operations = DEFAULT_CATEGORIES.map((category) => ({
    updateOne: {
      filter: { key: category.key },
      update: force
        ? { $set: { ...category, status: "enabled", isSystem: true } }
        : { $setOnInsert: { ...category, status: "enabled", isSystem: true } },
      upsert: true,
    },
  }));

  const result = await Category.bulkWrite(operations);
  return { created: result.upsertedCount ?? 0, total: DEFAULT_CATEGORIES.length };
}
