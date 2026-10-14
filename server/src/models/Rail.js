import mongoose from "mongoose";
import { CURRENCIES, RAIL_KINDS, RAIL_STATUSES } from "../constants/enums.js";

const railSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 48 },
    kind: { type: String, enum: RAIL_KINDS, required: true },
    currency: { type: String, enum: CURRENCIES, default: "NGN", required: true },
    last4: { type: String, match: /^\d{4}$/ },
    latencyMs: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: RAIL_STATUSES, default: "connected" },
  },
  { timestamps: true }
);

export const Rail = mongoose.model("Rail", railSchema);
