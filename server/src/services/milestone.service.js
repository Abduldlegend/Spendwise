import mongoose from "mongoose";

import { Milestone } from "../models/Milestone.js";
import { ApiError } from "../utils/ApiError.js";
import { httpStatus } from "../constants/httpStatus.js";
import { toCents } from "../utils/money.js";
import { serializeMilestone } from "../utils/serialize.js";

function safeId(id) {
  return mongoose.isValidObjectId(id) ? id : null;
}

function applyBody(doc, body) {
  if (body.title !== undefined) doc.title = body.title;
  if (body.targetAmount !== undefined) doc.targetAmountCents = toCents(body.targetAmount);
  if (body.savedAmount !== undefined) doc.savedAmountCents = toCents(body.savedAmount);
  if (body.currency !== undefined) doc.currency = body.currency;
  if (body.cadence !== undefined) doc.cadenceCents = toCents(body.cadence);
  if (body.targetDate !== undefined) doc.targetDate = body.targetDate;
}

export const milestoneService = {
  async list(accountId) {
    const rows = await Milestone.find({ accountId }).sort({ createdAt: 1 });
    return rows.map(serializeMilestone);
  },

  async create(accountId, body) {
    const doc = new Milestone({ accountId, savedAmountCents: 0, cadenceCents: 0 });
    applyBody(doc, body);
    await doc.save();
    return serializeMilestone(doc);
  },

  async update(accountId, id, body) {
    const doc = await Milestone.findOne({ _id: safeId(id), accountId });
    if (!doc) throw new ApiError(httpStatus.NOT_FOUND, "Milestone not found");
    applyBody(doc, body);
    await doc.save();
    return serializeMilestone(doc);
  },
};
