import { z } from "zod";

export const createPaymentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum([
    "credit_card",
    "debit_card",
    "flutterwave",
    "stripe",
    "paystack",
    "bank_transfer",
  ]),
});

export const refundPaymentSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().optional(),
});

export const paymentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]).optional(),
});

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>;
export type RefundPaymentDto = z.infer<typeof refundPaymentSchema>;
export type PaymentQueryDto = z.infer<typeof paymentQuerySchema>;
