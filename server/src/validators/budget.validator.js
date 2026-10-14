import { z } from "zod";
import { BUDGETABLE_CATEGORIES, CURRENCIES } from "../constants/enums.js";

const policy = z.object({
  autoSweep: z
    .object({
      enabled: z.boolean().default(false),
      threshold: z.coerce.number().min(0).default(0),
    })
    .default({ enabled: false, threshold: 0 }),
  hardLimitPct: z.coerce.number().min(100).max(200).default(105),
});

const bodyCreate = z
  .object({
    category: z.enum(BUDGETABLE_CATEGORIES),
    allocated: z.coerce
      .number()
      .positive("Allocation must be greater than zero")
      .multipleOf(0.01),
    currency: z.enum(CURRENCIES).default("NGN"),
    cadence: z.literal("monthly").default("monthly"),
    isLocked: z.boolean().default(false),
    policy: policy.default({ autoSweep: { enabled: false, threshold: 0 }, hardLimitPct: 105 }),
  })
  .refine((value) => !(value.isLocked && value.policy.autoSweep.enabled), {
    message: "A locked envelope cannot auto-sweep surplus",
    path: ["policy"],
  });

const bodyUpdate = z.object({
  category: z.enum(BUDGETABLE_CATEGORIES).optional(),
  allocated: z.coerce.number().positive().multipleOf(0.01).optional(),
  currency: z.enum(CURRENCIES).optional(),
  cadence: z.literal("monthly").optional(),
  isLocked: z.boolean().optional(),
  policy: policy.optional(),
});

const paramsId = z.object({ id: z.string().min(1) });

export const budgetValidators = {
  create: { body: bodyCreate },
  update: { body: bodyUpdate, params: paramsId },
  remove: { params: paramsId },
};
