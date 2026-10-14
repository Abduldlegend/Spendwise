import { z } from 'zod'
import { BUDGETABLE_CATEGORIES, CATEGORY_SCHEMA, CURRENCY_SCHEMA } from './enums'

/**
 * Budget envelope resource.
 *
 * `category` is validated against `BUDGETABLE_CATEGORIES` (not the full
 * category list) so an income transaction can never be given a spending cap.
 */
const policySchema = z.object({
  autoSweep: z.object({
    enabled: z.boolean().default(false),
    threshold: z.coerce.number().min(0, 'Threshold cannot be negative'),
  }),
  hardLimitPct: z.coerce
    .number()
    .min(100, 'Hard limit cannot be below 100%')
    .max(200, 'Hard limit cannot exceed 200%')
    .default(105),
})

export const budgetSchema = z
  .object({
    category: z.enum(BUDGETABLE_CATEGORIES),
    allocated: z.coerce
      .number({ message: 'Enter an allocation' })
      .positive('Allocation must be greater than zero')
      .multipleOf(0.01, 'Allocation cannot be more than 2 decimal places'),
    currency: CURRENCY_SCHEMA.default('NGN'),
    cadence: z.literal('monthly').default('monthly'),
    isLocked: z.boolean().default(false),
    policy: policySchema.default({
      autoSweep: { enabled: false, threshold: 0 },
      hardLimitPct: 105,
    }),
  })
  .refine(
    (value) => !(value.isLocked && value.policy.autoSweep.enabled),
    { message: 'A locked envelope cannot auto-sweep surplus', path: ['policy'] },
  )

export const budgetRecordSchema = budgetSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
})

export { CATEGORY_SCHEMA }
