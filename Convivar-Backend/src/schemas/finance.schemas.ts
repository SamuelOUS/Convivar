import { z } from "zod";

const optionalDate = z.string().trim().date().optional();

export const createFinancialMovementSchema = z.object({
  accountId: z.string().uuid(),
  movementType: z.enum(["Cargo", "Pago", "Ajuste"]),
  concept: z.string().trim().min(3).max(120),
  amount: z.coerce.number().positive().max(999_999_999),
  movementDate: optionalDate,
  notes: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((value) => (value ? value : null)),
});

export const generateMonthlyChargesSchema = z.object({
  amount: z.coerce.number().positive().max(999_999_999),
  concept: z.string().trim().min(3).max(120),
  movementDate: optionalDate,
});
