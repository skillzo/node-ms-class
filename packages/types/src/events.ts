/**
 * Centralized event type definitions
 * Follows pattern: <domain>.<action> or <domain>.<entity>.<action>
 *
 * All event names used across microservices should be defined here
 * to ensure type safety and consistency.
 */

export const Events = {
  ORDER: {
    CREATED: "order.created",
    CONFIRMED: "order.confirmed",
    CANCELLED: "order.cancelled",
    STATUS_UPDATED: "order.status.updated",
  },
  PAYMENT: {
    INITIATED: "payment.initiated",
    COMPLETED: "payment.completed",
    FAILED: "payment.failed",
    REFUNDED: "payment.refunded",
  },
  PRODUCT: {
    CREATED: "product.created",
    UPDATED: "product.updated",
    DELETED: "product.deleted",
    STOCK_DECREASED: "product.stock.decreased",
    STOCK_INCREASED: "product.stock.increased",
  },
} as const;

/**
 * Type-safe event name
 * Union of all possible event names
 */
export type EventName =
  | (typeof Events.ORDER)[keyof typeof Events.ORDER]
  | (typeof Events.PAYMENT)[keyof typeof Events.PAYMENT]
  | (typeof Events.PRODUCT)[keyof typeof Events.PRODUCT];
