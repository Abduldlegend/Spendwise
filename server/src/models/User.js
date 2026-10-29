import mongoose from "mongoose";
import { CURRENCIES, KYC_TIERS, PROVIDERS, USER_ROLES } from "../constants/enums.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, select: false },
    provider: { type: String, enum: PROVIDERS, default: "password", required: true },
    role: { type: String, enum: USER_ROLES, default: "user", required: true, index: true },
    avatarUrl: { type: String, default: null },
    baseCurrency: { type: String, enum: CURRENCIES, default: "NGN" },
    kycTier: { type: Number, enum: KYC_TIERS, default: 1 },
    kycLimitCents: { type: Number, default: 500_000_000 },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
