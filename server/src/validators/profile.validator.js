import { z } from "zod";
import { CURRENCIES } from "../constants/enums.js";

const bodyUpdate = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  baseCurrency: z.enum(CURRENCIES).optional(),
  kycTier: z.coerce.number().int().min(1).max(3).optional(),
  kycLimit: z.coerce.number().min(0).optional(),
});

export const profileValidators = {
  update: { body: bodyUpdate },
};
