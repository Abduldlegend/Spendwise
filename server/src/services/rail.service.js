import mongoose from "mongoose";

import { Rail } from "../models/Rail.js";
import { ApiError } from "../utils/ApiError.js";
import { httpStatus } from "../constants/httpStatus.js";
import { MAX_RAILS } from "../constants/enums.js";
import { serializeRail } from "../utils/serialize.js";

function safeId(id) {
  return mongoose.isValidObjectId(id) ? id : null;
}

export const railService = {
  async list(accountId) {
    const rows = await Rail.find({ accountId }).sort({ createdAt: 1 });
    return rows.map(serializeRail);
  },

  async create(accountId, body) {
    const count = await Rail.countDocuments({ accountId });
    if (count >= MAX_RAILS) {
      throw new ApiError(httpStatus.CONFLICT, `You can connect up to ${MAX_RAILS} rails`);
    }
    const doc = await Rail.create({
      accountId,
      name: body.name,
      kind: body.kind,
      currency: body.currency,
      last4: body.last4,
      latencyMs: body.latencyMs ?? 0,
      status: body.status ?? "connected",
    });
    return serializeRail(doc);
  },

  async remove(accountId, id) {
    const result = await Rail.deleteOne({ _id: safeId(id), accountId });
    if (result.deletedCount === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "Rail not found");
    }
  },
};
