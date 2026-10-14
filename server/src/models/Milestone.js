import mongoose from "mongoose";
import { CURRENCIES, MILESTONE_STATUSES } from "../constants/enums.js";

const milestoneSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 60 },
    targetAmountCents: { type: Number, required: true, min: 1 },
    savedAmountCents: { type: Number, default: 0, min: 0 },
    currency: { type: String, enum: CURRENCIES, default: "NGN", required: true },
    cadenceCents: { type: Number, default: 0, min: 0 },
    targetDate: { type: Date },
    status: { type: String, enum: MILESTONE_STATUSES, default: "active" },
  },
  { timestamps: true }
);

export const Milestone = mongoose.model("Milestone", milestoneSchema);
