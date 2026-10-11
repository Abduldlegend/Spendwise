import { z } from 'zod'
import { BASE_CURRENCY, CURRENCY_SCHEMA } from './enums'

/** Milestone savings stash. */
export const milestoneSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Name the milestone')
    .max(60, 'Keep the name under 60 characters'),
  targetAmount: z.coerce
    .number({ message: 'Enter a target' })
    .positive('Target must be greater than zero')
    .multipleOf(0.01, 'Target cannot be more than 2 decimal places'),
  savedAmount: z.coerce
    .number()
    .min(0, 'Saved cannot be negative')
    .default(0),
  currency: CURRENCY_SCHEMA.default('NGN'),
  cadence: z.coerce
    .number({ message: 'Enter the monthly contribution' })
    .min(0, 'Contribution cannot be negative')
    .max(1_000_000, 'Contribution looks too large')
    .default(0),
  targetDate: z.coerce.date().optional(),
})

export const milestoneRecordSchema = milestoneSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
})

/** Linked clearing rail. */
export const railSchema = z.object({
  name: z.string().trim().min(2, 'Name the rail').max(48),
  kind: z.enum(['bank', 'digital', 'international', 'cash']),
  currency: CURRENCY_SCHEMA.default(BASE_CURRENCY),
  last4: z.preprocess(
    // The form submits an empty string when the field is left blank; treat that
    // as "no last4" rather than a regex failure.
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z
      .string()
      .trim()
      .regex(/^\d{4}$/, 'Last four digits must be exactly 4 digits')
      .optional(),
  ),
  latencyMs: z.coerce.number().int().min(0).default(0),
})

export const railRecordSchema = railSchema.extend({
  id: z.string().min(1),
  status: z.enum(['connected', 'degraded', 'offline']).default('connected'),
})

/** User preferences. Theme is deliberately excluded — it is local-only. */
export const userSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(60),
  email: z.email('Enter a valid email'),
  baseCurrency: CURRENCY_SCHEMA.default(BASE_CURRENCY),
  kycTier: z.coerce.number().int().min(1).max(3).default(1),
  kycLimit: z.coerce.number().min(0).default(5_000_000),
})
