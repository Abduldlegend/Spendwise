import { z } from 'zod'
import { CATEGORY_SCHEMA, CURRENCY_SCHEMA, TRANSACTION_TYPE_SCHEMA } from './enums'

/**
 * Transaction resource.
 *
 * AGENTS.md validation conventions:
 *  - amounts use `z.coerce.number().positive().multipleOf(0.01)`
 *  - sign (income vs expense) is derived from `type`, never from the sign of
 *    the amount, so `amount` must be positive
 */
const amountField = z.coerce
  .number({ message: 'Enter an amount' })
  .positive('Amount must be greater than zero')
  .multipleOf(0.01, 'Amount cannot be more than 2 decimal places')

export const transactionSchema = z.object({
  type: TRANSACTION_TYPE_SCHEMA,
  amount: amountField,
  currency: CURRENCY_SCHEMA.default('NGN'),
  category: CATEGORY_SCHEMA,
  description: z
    .string()
    .trim()
    .min(2, 'Add a short description')
    .max(120, 'Keep the description under 120 characters'),
  note: z.string().trim().max(280, 'Note is limited to 280 characters').optional(),
  railId: z.string().min(1, 'Select a payment rail'),
  occurredAt: z.coerce.date({ message: 'Pick a valid date' }),
})

/**
 * Optimistic shape. `id` is absent on create, present on update; `pending` marks
 * a row the server has not confirmed yet.
 */
export const transactionRecordSchema = transactionSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  railName: z.string().min(1),
  pending: z.boolean().optional(),
})

/** Normalises a validated record into the shape stored in Context. */
export function toTransactionRecord(input, { id, railName, now = new Date() }) {
  return {
    id,
    type: input.type,
    amount: input.amount,
    currency: input.currency,
    category: input.category,
    description: input.description,
    note: input.note ?? '',
    railId: input.railId,
    railName,
    occurredAt: new Date(input.occurredAt).toISOString(),
    createdAt: now.toISOString(),
  }
}
