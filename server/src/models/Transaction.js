import mongoose from "mongoose";
import { CATEGORIES, CURRENCIES, TRANSACTION_TYPES } from "../constants/enums.js";

const transactionSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    amountCents: { type: Number, required: true, min: 1 },
    currency: { type: String, enum: CURRENCIES, default: "NGN", required: true },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 120 },
    note: { type: String, trim: true, maxlength: 280, default: "" },
    railId: { type: String, required: true },
    railName: { type: String, required: true, trim: true },
    occurredAt: { type: Date, required: true },
  },
  { timestamps: true }
);

transactionSchema.index({ accountId: 1, occurredAt: -1 });

export const Transaction = mongoose.model("Transaction", transactionSchema);
