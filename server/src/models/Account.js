import mongoose from "mongoose";
import { CURRENCIES, KYC_TIERS, PROVIDERS } from "../constants/enums.js";

/**
 * Account is the 1:1 anchor every ledger resource is scoped to (`req.accountId`).
 * Keeping it separate from `User` means resources never reference credentials.
 */
const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    baseCurrency: { type: String, enum: CURRENCIES, default: "NGN" },
    kycTier: { type: Number, enum: KYC_TIERS, default: 1 },
    kycLimitCents: { type: Number, default: 500_000_000 },
    provider: { type: String, enum: PROVIDERS, default: "password" },
  },
  { timestamps: true }
);

export const Account = mongoose.model("Account", accountSchema);
