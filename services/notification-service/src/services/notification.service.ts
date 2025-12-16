import { prisma } from "../config/database";
import { NotFoundError } from "@ecommerce/common";
import { EventBus, EventPayload } from "@ecommerce/common";
import { Events } from "@ecommerce/types";
import { NotificationQueryDto, MarkAsReadDto } from "../dto/notification.dto";

export class NotificationService {
  private eventBus: EventBus | null = null;

  setEventBus(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  private async sendEmail(email: string, subject: string, body: string) {
    console.log(`[MOCK EMAIL] To: ${email}, Subject: ${subject}`);
    console.log(`[MOCK EMAIL] Body: ${body}`);
  }

  private async sendSMS(phone: string, message: string) {
    console.log(`[MOCK SMS] To: ${phone}, Message: ${message}`);
  }

  async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata?: any
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        metadata: metadata ? (metadata as any) : null,
      },
    });

    return notification;
  }

  async getNotifications(query: NotificationQueryDto, userId?: string) {
    const { page, limit, read } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (read !== undefined) {
      where.read = read;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getNotificationById(notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundError("Notification");
    }

    return notification;
  }

  async markAsRead(notificationIds: string[], userId?: string) {
    const where: any = {
      id: { in: notificationIds },
    };

    if (userId) {
      where.userId = userId;
    }

    const updated = await prisma.notification.updateMany({
      where: {
        ...where,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return updated;
  }

  async markAllAsRead(userId: string) {
    const updated = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return updated;
  }

  async handleOrderCreated(payload: EventPayload) {
    const { orderId, userId, totalAmount } = payload.data;

    await this.createNotification(
      userId,
      "order.created",
      "Order Placed",
      `Your order #${orderId} has been placed successfully. Total: $${totalAmount}`,
      { orderId, totalAmount }
    );

    await this.sendEmail(
      `user-${userId}@example.com`,
      "Order Confirmation",
      `Your order #${orderId} has been placed. Total: $${totalAmount}`
    );
  }

  async handleOrderConfirmed(payload: EventPayload) {
    const { orderId, userId } = payload.data;

    await this.createNotification(
      userId,
      "order.confirmed",
      "Order Confirmed",
      `Your order #${orderId} has been confirmed and is being processed.`,
      { orderId }
    );

    await this.sendEmail(
      `user-${userId}@example.com`,
      "Order Confirmed",
      `Your order #${orderId} has been confirmed.`
    );
  }

  async handleOrderCancelled(payload: EventPayload) {
    const { orderId, userId, reason } = payload.data;

    await this.createNotification(
      userId,
      "order.cancelled",
      "Order Cancelled",
      `Your order #${orderId} has been cancelled.${
        reason ? ` Reason: ${reason}` : ""
      }`,
      { orderId, reason }
    );

    await this.sendEmail(
      `user-${userId}@example.com`,
      "Order Cancelled",
      `Your order #${orderId} has been cancelled.`
    );
  }

  async handlePaymentCompleted(payload: EventPayload) {
    const { orderId, paymentId, amount, userId } = payload.data;

    await this.createNotification(
      userId,
      "payment.completed",
      "Payment Successful",
      `Payment of $${amount} for order #${orderId} has been completed.`,
      { orderId, paymentId, amount }
    );

    await this.sendEmail(
      `user-${userId}@example.com`,
      "Payment Confirmation",
      `Your payment of $${amount} has been processed successfully.`
    );
  }

  async subscribeToEvents() {
    if (!this.eventBus) {
      throw new Error("EventBus not initialized");
    }

    await this.eventBus.subscribe(Events.ORDER.CREATED, async (payload) => {
      await this.handleOrderCreated(payload);
    });

    await this.eventBus.subscribe(Events.ORDER.CONFIRMED, async (payload) => {
      await this.handleOrderConfirmed(payload);
    });

    await this.eventBus.subscribe(Events.ORDER.CANCELLED, async (payload) => {
      await this.handleOrderCancelled(payload);
    });

    await this.eventBus.subscribe(Events.PAYMENT.COMPLETED, async (payload) => {
      await this.handlePaymentCompleted(payload);
    });
  }
}
