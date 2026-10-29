import mongoose from "mongoose";

/**
 * Non-user secrets used by platform integrations.
 *
 * Only a SHA-256 hash of the secret is stored, so a database read cannot reveal
 * a live credential. The plaintext is returned exactly once, at rotation time.
 */
const platformCredentialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    prefix: { type: String, required: true },
    lastFour: { type: String, required: true },
    secretHash: { type: String, required: true, select: false },
    rotatedAt: { type: Date, required: true },
    rotatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rotatedByEmail: { type: String, default: "" },
  },
  { timestamps: true }
);

export const PlatformCredential = mongoose.model("PlatformCredential", platformCredentialSchema);
