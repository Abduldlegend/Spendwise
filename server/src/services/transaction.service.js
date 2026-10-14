import mongoose from "mongoose";

import { Transaction } from "../models/Transaction.js";
import { Rail } from "../models/Rail.js";
import { ApiError } from "../utils/ApiError.js";
import { httpStatus } from "../constants/httpStatus.js";
import { toCents } from "../utils/money.js";
import { cycleRange } from "../utils/cycle.js";
import { serializeTransaction } from "../utils/serialize.js";

async function railNameFor(accountId, railId, fallback) {
  if (!railId) return fallback ?? "Unknown rail";
  const rail = await Rail.findOne({ _id: safeId(railId), accountId });
  return rail?.name ?? fallback ?? "Unknown rail";
}

function safeId(id) {
  return mongoose.isValidObjectId(id) ? id : null;
}

export const transactionService = {
  async list(accountId, { cycle, category } = {}) {
    const filter = { accountId };
    if (category) filter.category = category;
    if (cycle) {
      const { start, end } = cycleRange(cycle);
      filter.occurredAt = { $gte: start, $lt: end };
    }
    const rows = await Transaction.find(filter).sort({ occurredAt: -1, createdAt: -1 });
    return rows.map(serializeTransaction);
  },

  async create(accountId, body) {
    const doc = await Transaction.create({
      accountId,
      type: body.type,
      amountCents: toCents(body.amount),
      currency: body.currency,
      category: body.category,
      description: body.description,
      note: body.note ?? "",
      railId: body.railId,
      railName: await railNameFor(accountId, body.railId, body.railName),
      occurredAt: body.occurredAt,
    });
    return serializeTransaction(doc);
  },

  async update(accountId, id, body) {
    const doc = await Transaction.findOne({ _id: safeId(id), accountId });
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");

    if (body.type !== undefined) doc.type = body.type;
    if (body.amount !== undefined) doc.amountCents = toCents(body.amount);
    if (body.currency !== undefined) doc.currency = body.currency;
    if (body.category !== undefined) doc.category = body.category;
    if (body.description !== undefined) doc.description = body.description;
    if (body.note !== undefined) doc.note = body.note;
    if (body.railId !== undefined) {
      doc.railId = body.railId;
      doc.railName = await railNameFor(accountId, body.railId, body.railName);
    } else if (body.railName !== undefined) {
      doc.railName = body.railName;
    }
    if (body.occurredAt !== undefined) doc.occurredAt = body.occurredAt;

    await doc.save();
    return serializeTransaction(doc);
  },

  async remove(accountId, id) {
    const result = await Transaction.deleteOne({ _id: safeId(id), accountId });
    if (result.deletedCount === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
    }
  },
};
