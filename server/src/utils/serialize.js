import { toAmount } from "./money.js";

/**
 * Serializers map Mongoose documents onto the exact JSON the frontend contract
 * expects (see `src/mocks/handlers.js`). Amounts are stored as integer cents but
 * exposed as decimal naira, matching `src/schemas/*`.
 */

function iso(value) {
  return value ? new Date(value).toISOString() : undefined;
}

export function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    provider: user.provider,
    role: user.role ?? "user",
    avatarUrl: user.avatarUrl ?? null,
    baseCurrency: user.baseCurrency,
    kycTier: user.kycTier,
    kycLimit: toAmount(user.kycLimitCents),
    createdAt: iso(user.createdAt),
  };
}

export function serializeAuditLog(doc) {
  return {
    id: doc._id.toString(),
    actorId: doc.actorId?.toString?.() ?? String(doc.actorId),
    actorEmail: doc.actorEmail,
    action: doc.action,
    targetType: doc.targetType,
    targetId: doc.targetId,
    reason: doc.reason,
    metadata: doc.metadata ?? {},
    ip: doc.ip,
    userAgent: doc.userAgent,
    createdAt: iso(doc.createdAt),
  };
}

export function serializeCategory(doc) {
  return {
    id: doc._id.toString(),
    key: doc.key,
    label: doc.label,
    icon: doc.icon,
    accent: doc.accent,
    kind: doc.kind,
    status: doc.status,
    isSystem: doc.isSystem,
    sortOrder: doc.sortOrder,
  };
}

export function serializeTransaction(doc) {
  return {
    id: doc._id.toString(),
    type: doc.type,
    amount: toAmount(doc.amountCents),
    currency: doc.currency,
    category: doc.category,
    description: doc.description,
    note: doc.note ?? "",
    railId: doc.railId,
    railName: doc.railName,
    occurredAt: iso(doc.occurredAt),
    createdAt: iso(doc.createdAt),
  };
}

export function serializeBudget(doc) {
  return {
    id: doc._id.toString(),
    category: doc.category,
    allocated: toAmount(doc.allocatedCents),
    currency: doc.currency,
    cadence: doc.cadence,
    isLocked: doc.isLocked,
    policy: {
      autoSweep: {
        enabled: doc.policy?.autoSweep?.enabled ?? false,
        threshold: toAmount(doc.policy?.autoSweep?.thresholdCents ?? 0),
      },
      hardLimitPct: doc.policy?.hardLimitPct ?? 105,
    },
    createdAt: iso(doc.createdAt),
    updatedAt: iso(doc.updatedAt),
  };
}

export function serializeMilestone(doc) {
  const record = {
    id: doc._id.toString(),
    title: doc.title,
    targetAmount: toAmount(doc.targetAmountCents),
    savedAmount: toAmount(doc.savedAmountCents),
    currency: doc.currency,
    cadence: toAmount(doc.cadenceCents),
    createdAt: iso(doc.createdAt),
  };
  if (doc.targetDate) record.targetDate = iso(doc.targetDate);
  return record;
}

export function serializeRail(doc) {
  const record = {
    id: doc._id.toString(),
    name: doc.name,
    kind: doc.kind,
    currency: doc.currency,
    latencyMs: doc.latencyMs ?? 0,
    status: doc.status,
  };
  if (doc.last4) record.last4 = doc.last4;
  return record;
}
