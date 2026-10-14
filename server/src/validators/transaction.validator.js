import { z } from "zod";
import { CATEGORIES, CURRENCIES, TRANSACTION_TYPES } from "../constants/enums.js";

const bodyCreate = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero")
    .multipleOf(0.01, "Amount cannot be more than 2 decimal places"),
  currency: z.enum(CURRENCIES).default("NGN"),
  category: z.enum(CATEGORIES),
  description: z.string().trim().min(2).max(120),
  note: z.string().trim().max(280).optional().or(z.literal("")),
  railId: z.string().min(1),
  railName: z.string().trim().min(1).optional(),
  occurredAt: z.coerce.date(),
});

const bodyUpdate = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),
  amount: z.coerce.number().positive().multipleOf(0.01).optional(),
  currency: z.enum(CURRENCIES).optional(),
  category: z.enum(CATEGORIES).optional(),
  description: z.string().trim().min(2).max(120).optional(),
  note: z.string().trim().max(280).optional().or(z.literal("")),
  railId: z.string().min(1).optional(),
  railName: z.string().trim().min(1).optional(),
  occurredAt: z.coerce.date().optional(),
});

const paramsId = z.object({ id: z.string().min(1) });

const query = z.object({
  cycle: z
    .string()
    .regex(/^\d{6}$/, "cycle must look like YYYYMM")
    .optional(),
  category: z.enum(CATEGORIES).optional(),
});

export const transactionValidators = {
  create: { body: bodyCreate },
  update: { body: bodyUpdate, params: paramsId },
  remove: { params: paramsId },
  list: { query },
};
