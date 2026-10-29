import mongoose from "mongoose";

import { Budget } from "../models/Budget.js";
import { categoryService } from "./category.service.js";
import { ApiError } from "../utils/ApiError.js";
import { httpStatus } from "../constants/httpStatus.js";
import { toCents } from "../utils/money.js";
import { serializeBudget } from "../utils/serialize.js";

function safeId(id) {
  return mongoose.isValidObjectId(id) ? id : null;
}

function normalizePolicy(policy) {
  if (!policy) return undefined;
  const next = {};
  if (policy.autoSweep) {
    next.autoSweep = {};
    if (policy.autoSweep.enabled !== undefined) next.autoSweep.enabled = policy.autoSweep.enabled;
    if (policy.autoSweep.threshold !== undefined) {
      next.autoSweep.thresholdCents = toCents(policy.autoSweep.threshold);
    }
  }
  if (policy.hardLimitPct !== undefined) next.hardLimitPct = policy.hardLimitPct;
  return next;
}

function applyBody(doc, body) {
  if (body.category !== undefined) doc.category = body.category;
  if (body.allocated !== undefined) doc.allocatedCents = toCents(body.allocated);
  if (body.currency !== undefined) doc.currency = body.currency;
  if (body.cadence !== undefined) doc.cadence = body.cadence;
  if (body.isLocked !== undefined) doc.isLocked = body.isLocked;
  const policy = normalizePolicy(body.policy);
  if (policy) {
    const current = doc.policy ?? {};
    doc.policy = {
      autoSweep: {
        enabled: policy.autoSweep?.enabled ?? current.autoSweep?.enabled ?? false,
        thresholdCents: policy.autoSweep?.thresholdCents ?? current.autoSweep?.thresholdCents ?? 0,
      },
      hardLimitPct: policy.hardLimitPct ?? current.hardLimitPct ?? 105,
    };
  }
}

export const budgetService = {
  async list(accountId) {
    const rows = await Budget.find({ accountId }).sort({ createdAt: 1 });
    return rows.map(serializeBudget);
  },

  /** The mock POST behaves as an upsert keyed on category (see DataContext.upsertBudget). */
  async create(accountId, body) {
    await categoryService.assertUsable(body.category, { kind: "expense" });

    const existing = await Budget.findOne({ accountId, category: body.category });
    if (existing) {
      applyBody(existing, body);
      await existing.save();
      return serializeBudget(existing);
    }
    const doc = new Budget({ accountId });
    applyBody(doc, body);
    await doc.save();
    return serializeBudget(doc);
  },

  async update(accountId, id, body) {
    const doc = await Budget.findOne({ _id: safeId(id), accountId });
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Budget not found");
    if (body.category !== undefined) {
      await categoryService.assertUsable(body.category, { kind: "expense" });
    }
    applyBody(doc, body);
    await doc.save();
    return serializeBudget(doc);
  },
};
