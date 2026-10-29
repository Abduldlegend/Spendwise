import mongoose from "mongoose";
import { CATEGORY_KEY_PATTERN, CURRENCIES } from "../constants/enums.js";

const policySchema = new mongoose.Schema(
  {
    autoSweep: {
      enabled: { type: Boolean, default: false },
      thresholdCents: { type: Number, default: 0, min: 0 },
    },
    hardLimitPct: { type: Number, default: 105, min: 100, max: 200 },
  },
  { _id: false }
);

const budgetSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    category: { type: String, match: CATEGORY_KEY_PATTERN, required: true },
    allocatedCents: { type: Number, required: true, min: 1 },
    currency: { type: String, enum: CURRENCIES, default: "NGN", required: true },
    cadence: { type: String, enum: ["monthly"], default: "monthly", required: true },
    isLocked: { type: Boolean, default: false },
    policy: { type: policySchema, default: () => ({}) },
  },
  { timestamps: true }
);

budgetSchema.index({ accountId: 1, category: 1 }, { unique: true });

export const Budget = mongoose.model("Budget", budgetSchema);
