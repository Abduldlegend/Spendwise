import { z } from "zod";
import { CURRENCIES, KYC_TIERS, USER_ROLES } from "../constants/enums.js";
import { categoryValidators } from "./category.validator.js";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");

const overview = {
  query: z.object({
    window: z.enum(["7d", "30d", "90d"]).default("30d"),
  }),
};

const listUsers = {
  query: z.object({
    search: z.string().trim().max(80).optional(),
    status: z.enum(["active", "suspended"]).optional(),
    role: z.enum(USER_ROLES).optional(),
    kycTier: z.coerce.number().int().refine((value) => KYC_TIERS.includes(value), "Unknown KYC tier").optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(["newest", "oldest", "name", "last_login"]).default("newest"),
  }),
};

const userParams = {
  params: z.object({ id: objectId }),
};

const updateUser = {
  params: z.object({ id: objectId }),
  body: z
    .object({
      action: z.enum(["suspend", "reinstate", "role", "kycTier"]),
      reason: z.string().trim().min(3).max(280),
      role: z.enum(USER_ROLES).optional(),
      kycTier: z.coerce.number().int().min(1).max(3).optional(),
    })
    .superRefine((value, context) => {
      if (value.action === "role" && !value.role) {
        context.addIssue({
          code: "custom",
          path: ["role"],
          message: "Choose the role to assign",
        });
      }
      if (value.action === "kycTier" && value.kycTier === undefined) {
        context.addIssue({
          code: "custom",
          path: ["kycTier"],
          message: "Choose the KYC tier to assign",
        });
      }
    }),
};

const listAudit = {
  query: z.object({
    action: z.string().trim().max(64).optional(),
    actorId: objectId.optional(),
    actorEmail: z.string().trim().max(120).optional(),
    targetType: z.enum(["user", "category", "rail", "credential", "system"]).optional(),
    targetId: z.string().trim().max(64).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  }),
};

const analytics = {
  query: z.object({
    granularity: z.enum(["day", "week"]).default("day"),
    window: z.enum(["30d", "90d"]).default("30d"),
    currency: z.enum(CURRENCIES).optional(),
  }),
};

const createCategory = {
  body: categoryValidators.create.body.extend({
    reason: z.string().trim().min(3).max(280),
  }),
};

const updateCategory = {
  params: categoryValidators.update.params,
  body: categoryValidators.update.body.extend({
    reason: z.string().trim().min(3).max(280),
  }),
};

const rotateCredential = {
  body: z.object({
    reason: z.string().trim().min(3).max(280),
  }),
};

export const adminValidators = {
  overview,
  listUsers,
  userParams,
  updateUser,
  listAudit,
  analytics,
  createCategory,
  updateCategory,
  rotateCredential,
};
