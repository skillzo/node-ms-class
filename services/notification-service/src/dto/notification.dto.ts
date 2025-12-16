import { z } from "zod";

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  read: z.coerce.boolean().optional(),
});

export const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()).optional(),
});

export type NotificationQueryDto = z.infer<typeof notificationQuerySchema>;
export type MarkAsReadDto = z.infer<typeof markAsReadSchema>;
