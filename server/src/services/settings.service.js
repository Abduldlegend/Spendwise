import { createHash, randomBytes } from "node:crypto";

import { PlatformCredential } from "../models/PlatformCredential.js";
import { Rail } from "../models/Rail.js";
import { auditService } from "./audit.service.js";
import { dbState } from "../config/db.js";
import {
  BASE_CURRENCY,
  KYC_TIERS,
  KYC_TIER_LIMITS_CENTS,
  MAX_RAILS,
} from "../constants/enums.js";
import { toAmount } from "../utils/money.js";

const CREDENTIAL_NAME = "webhook-signing";

function serializeCredential(doc) {
  if (!doc) return { exists: false, name: CREDENTIAL_NAME };
  return {
    exists: true,
    name: doc.name,
    prefix: doc.prefix,
    lastFour: doc.lastFour,
    rotatedAt: doc.rotatedAt?.toISOString(),
    rotatedByEmail: doc.rotatedByEmail,
  };
}

export const settingsService = {
  async summary() {
    const [railRows, credential] = await Promise.all([
      Rail.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      PlatformCredential.findOne({ name: CREDENTIAL_NAME }),
    ]);

    return {
      currency: {
        code: BASE_CURRENCY,
        symbol: "₦",
        enabled: true,
        locked: true,
        note: "Single-currency v1. Adding another settlement currency requires a treasury policy change, not a console toggle.",
      },
      rails: {
        total: railRows.reduce((total, row) => total + row.count, 0),
        byStatus: railRows.map((row) => ({ status: row._id, count: row.count })),
      },
      limits: {
        maxRailsPerAccount: MAX_RAILS,
        kycTiers: KYC_TIERS.map((tier) => ({
          tier,
          limit: toAmount(KYC_TIER_LIMITS_CENTS[tier]),
        })),
      },
      credentials: serializeCredential(credential),
      environment: {
        db: dbState(),
        node: process.version,
        env: process.env.NODE_ENV ?? "development",
        uptimeSeconds: Math.round(process.uptime()),
      },
    };
  },

  async rotateCredential(actor, reason, req) {
    const secret = `vlt_live_${randomBytes(24).toString("hex")}`;
    const prefix = secret.slice(0, "vlt_live_".length + 6);
    const doc = await PlatformCredential.findOneAndUpdate(
      { name: CREDENTIAL_NAME },
      {
        name: CREDENTIAL_NAME,
        prefix,
        lastFour: secret.slice(-4),
        secretHash: createHash("sha256").update(secret).digest("hex"),
        rotatedAt: new Date(),
        rotatedBy: actor.id,
        rotatedByEmail: actor.email ?? "",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await auditService.record({
      actor,
      action: "credential.rotate",
      targetType: "credential",
      targetId: CREDENTIAL_NAME,
      reason,
      metadata: { prefix, lastFour: doc.lastFour },
      req,
    });

    // The plaintext leaves the server exactly once.
    return { secret, credential: serializeCredential(doc) };
  },
};
