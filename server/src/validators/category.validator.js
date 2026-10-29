import { z } from "zod";
import {
  CATEGORY_ACCENTS,
  CATEGORY_KEY_PATTERN,
  CATEGORY_KINDS,
  CATEGORY_STATUSES,
} from "../constants/enums.js";

const key = z
  .string()
  .trim()
  .toLowerCase()
  .regex(CATEGORY_KEY_PATTERN, "Use lowercase letters, numbers or underscores");

const bodyCreate = z.object({
  key,
  label: z.string().trim().min(2).max(40),
  icon: z.string().trim().min(1).max(48),
  accent: z.enum(CATEGORY_ACCENTS),
  kind: z.enum(CATEGORY_KINDS),
  status: z.enum(CATEGORY_STATUSES).default("enabled"),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
});

const bodyUpdate = z.object({
  label: z.string().trim().min(2).max(40).optional(),
  icon: z.string().trim().min(1).max(48).optional(),
  accent: z.enum(CATEGORY_ACCENTS).optional(),
  kind: z.enum(CATEGORY_KINDS).optional(),
  status: z.enum(CATEGORY_STATUSES).optional(),
  sortOrder: z.coerce.number().int().min(0).max(10_000).optional(),
});

const paramsKey = z.object({ key: z.string().min(1) });

export const categoryValidators = {
  create: { body: bodyCreate },
  update: { body: bodyUpdate, params: paramsKey },
};
