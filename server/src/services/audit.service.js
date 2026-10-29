import { AuditLog } from "../models/AuditLog.js";

/**
 * Append-only admin audit trail.
 *
 * Writing an audit row must never turn a successful admin action into a failed
 * request, so failures are logged and swallowed. The trail is best-effort; the
 * mutation itself is the source of truth.
 */
export const auditService = {
  /**
   * @param {object} entry
   * @param {{ id?: string, email?: string }} entry.actor
   * @param {string} entry.action stable machine name, e.g. `user.suspend`
   * @param {string} entry.targetType
   * @param {string} [entry.targetId]
   * @param {string} [entry.reason]
   * @param {object} [entry.metadata]
   * @param {import("express").Request} [entry.req]
   */
  async record({ actor, action, targetType, targetId, reason, metadata, req }) {
    try {
      const doc = await AuditLog.create({
        actorId: actor.id,
        actorEmail: actor.email ?? "",
        action,
        targetType,
        targetId: targetId ? String(targetId) : "",
        reason: reason ?? "",
        metadata: metadata ?? {},
        ip: req?.ip ?? "",
        userAgent: req?.headers?.["user-agent"] ?? "",
      });
      return doc;
    } catch (error) {
      console.error("[audit] failed to record", action, error.message);
      return null;
    }
  },

  async list({ action, actorId, actorEmail, targetType, targetId, page = 1, limit = 50 } = {}) {
    const filter = {};
    if (action) filter.action = action;
    if (actorId) filter.actorId = actorId;
    if (actorEmail) {
      const pattern = String(actorEmail).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.actorEmail = { $regex: pattern, $options: "i" };
    }
    if (targetType) filter.targetType = targetType;
    if (targetId) filter.targetId = String(targetId);

    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const safePage = Math.max(Number(page) || 1, 1);
    const [items, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit),
      AuditLog.countDocuments(filter),
    ]);
    return {
      items,
      page: safePage,
      limit: safeLimit,
      total,
      pages: Math.max(1, Math.ceil(total / safeLimit)),
    };
  },
};
