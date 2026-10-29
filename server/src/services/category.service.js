import { Category } from "../models/Category.js";
import { ApiError } from "../utils/ApiError.js";
import { httpStatus } from "../constants/httpStatus.js";
import { CATEGORY_KEY_PATTERN } from "../constants/enums.js";
import { serializeCategory } from "../utils/serialize.js";
import { seedCategories } from "../seeds/categories.js";

const KEY_MESSAGE = "Category key must be lowercase letters, numbers or underscores";

function normalizeKey(key) {
  return String(key ?? "").trim().toLowerCase();
}

export const categoryService = {
  seedDefaults: seedCategories,

  async listEnabled() {
    const rows = await Category.find({ status: "enabled" }).sort({ sortOrder: 1, label: 1 });
    return rows.map(serializeCategory);
  },

  async listAll() {
    const rows = await Category.find({}).sort({ sortOrder: 1, label: 1 });
    return rows.map(serializeCategory);
  },

  async getByKey(key) {
    const doc = await Category.findOne({ key: normalizeKey(key) });
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
    return serializeCategory(doc);
  },

  /**
   * The services own taxonomy invariants: the key must exist, be enabled, and
   * match the ledger entry's direction (`income` vs `expense`). Zod only checks
   * the key's shape, so admins can add categories without a redeploy.
   */
  async assertUsable(key, { kind } = {}) {
    const doc = await Category.findOne({ key: normalizeKey(key) });
    if (!doc) throw new ApiError(httpStatus.BAD_REQUEST, `Unknown category "${key}"`);
    if (doc.status !== "enabled") {
      throw new ApiError(httpStatus.BAD_REQUEST, `Category "${doc.label}" is disabled`);
    }
    if (kind && doc.kind !== kind) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Category "${doc.label}" cannot be used for ${kind}`,
      );
    }
    return doc;
  },

  async create(body, userId = null) {
    const key = normalizeKey(body.key);
    if (!CATEGORY_KEY_PATTERN.test(key)) {
      throw new ApiError(httpStatus.BAD_REQUEST, KEY_MESSAGE);
    }

    const existing = await Category.findOne({ key });
    if (existing) throw new ApiError(httpStatus.CONFLICT, `Category "${key}" already exists`);

    const doc = await Category.create({
      key,
      label: body.label,
      icon: body.icon,
      accent: body.accent,
      kind: body.kind,
      status: body.status ?? "enabled",
      sortOrder: body.sortOrder ?? 0,
      isSystem: false,
      createdBy: userId,
      updatedBy: userId,
    });
    return serializeCategory(doc);
  },

  async update(key, body, userId = null) {
    const doc = await Category.findOne({ key: normalizeKey(key) });
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Category not found");

    if (body.kind !== undefined && body.kind !== doc.kind && doc.isSystem) {
      throw new ApiError(httpStatus.BAD_REQUEST, "A system category cannot change direction");
    }

    if (body.label !== undefined) doc.label = body.label;
    if (body.icon !== undefined) doc.icon = body.icon;
    if (body.accent !== undefined) doc.accent = body.accent;
    if (body.kind !== undefined) doc.kind = body.kind;
    if (body.status !== undefined) doc.status = body.status;
    if (body.sortOrder !== undefined) doc.sortOrder = body.sortOrder;
    doc.updatedBy = userId;

    await doc.save();
    return serializeCategory(doc);
  },
};
