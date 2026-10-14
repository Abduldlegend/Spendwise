import { z } from "zod";
import { CURRENCIES, RAIL_KINDS, RAIL_STATUSES } from "../constants/enums.js";

const bodyCreate = z.object({
  name: z.string().trim().min(2).max(48),
  kind: z.enum(RAIL_KINDS),
  currency: z.enum(CURRENCIES).default("NGN"),
  last4: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z
      .string()
      .trim()
      .regex(/^\d{4}$/, "Last four digits must be exactly 4 digits")
      .optional()
  ),
  latencyMs: z.coerce.number().int().min(0).default(0),
  status: z.enum(RAIL_STATUSES).default("connected"),
});

const paramsId = z.object({ id: z.string().min(1) });

export const railValidators = {
  create: { body: bodyCreate },
  remove: { params: paramsId },
};
