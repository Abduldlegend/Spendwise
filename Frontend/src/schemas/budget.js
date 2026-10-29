import { z } from 'zod'
import { CATEGORY_SCHEMA, CURRENCY_SCHEMA } from './enums'

/**
 * Budget envelope resource.
 *
 * `category` is shape-validated here; the API rejects income-kind and disabled
 * categories. `income` is also blocked locally because it is the seeded inflow
 * key and the form never offers it.
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
    category: CATEGORY_SCHEMA.refine((value) => value !== 'income', 'Income cannot be budgeted'),
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
