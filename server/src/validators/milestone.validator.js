import { z } from "zod";
import { CURRENCIES } from "../constants/enums.js";

const optionalDate = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? undefined : value),
  z.coerce.date().optional()
);

const bodyCreate = z.object({
  title: z.string().trim().min(2).max(60),
  targetAmount: z.coerce.number().positive().multipleOf(0.01),
  savedAmount: z.coerce.number().min(0).default(0),
  currency: z.enum(CURRENCIES).default("NGN"),
  cadence: z.coerce.number().min(0).max(1_000_000).default(0),
  targetDate: optionalDate,
});

const bodyUpdate = z.object({
  title: z.string().trim().min(2).max(60).optional(),
  targetAmount: z.coerce.number().positive().multipleOf(0.01).optional(),
  savedAmount: z.coerce.number().min(0).optional(),
  currency: z.enum(CURRENCIES).optional(),
  cadence: z.coerce.number().min(0).max(1_000_000).optional(),
  targetDate: optionalDate,
});

const paramsId = z.object({ id: z.string().min(1) });

export const milestoneValidators = {
  create: { body: bodyCreate },
  update: { body: bodyUpdate, params: paramsId },
};
