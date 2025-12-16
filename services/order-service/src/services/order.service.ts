import { prisma } from "../config/database";
import { NotFoundError, ConflictError } from "@ecommerce/common";
import { EventBus, HttpClient } from "@ecommerce/common";
import { Events } from "@ecommerce/types";
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderQueryDto,
} from "../dto/order.dto";
import { OrderStatus } from "@prisma/client";

export class OrderService {
  private eventBus: EventBus | null = null;
  private productServiceClient: HttpClient;
  private paymentServiceClient: HttpClient;
  private userServiceClient: HttpClient;

  constructor() {
    const productServiceUrl =
      process.env.PRODUCT_SERVICE_URL || "http://localhost:3002";
    const paymentServiceUrl =
      process.env.PAYMENT_SERVICE_URL || "http://localhost:3004";
    const userServiceUrl =
      process.env.USER_SERVICE_URL || "http://localhost:3001";

    this.productServiceClient = new HttpClient({
      baseURL: productServiceUrl,
      apiKey: process.env.SERVICE_API_KEY,
    });

    this.paymentServiceClient = new HttpClient({
      baseURL: paymentServiceUrl,
      apiKey: process.env.SERVICE_API_KEY,
    });

    this.userServiceClient = new HttpClient({
      baseURL: userServiceUrl,
      apiKey: process.env.SERVICE_API_KEY,
    });
  }

  setEventBus(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  private async publishEvent(
    eventType: string,
    data: any,
    correlationId?: string
  ) {
    if (this.eventBus) {
      try {
        await this.eventBus.publish(
          eventType,
          data,
          correlationId,
          "order-service"
        );
      } catch (error) {
        console.error(`Failed to publish event ${eventType}:`, error);
      }
    }
  }

  async createOrder(
    userId: string,
    data: CreateOrderDto,
    correlationId?: string
  ) {
    await this.validateUser(userId);

    const orderItems = await Promise.all(
      data.items.map(async (item) => {
        const product = await this.productServiceClient.get<{
          success: boolean;
          data: { id: string; price: number; stock: number };
        }>(`/api/products/${item.productId}`);

        if (!product.success || !product.data) {
          throw new NotFoundError("Product");
        }

        if (product.data.stock < item.quantity) {
          throw new ConflictError(
            `Insufficient stock for product ${item.productId}`
          );
        }

        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product.data.price,
        };
      })
    );

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId,
        status: OrderStatus.PENDING,
        totalAmount,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await this.publishEvent(
      Events.ORDER.CREATED,
      {
        orderId: order.id,
        userId,
        totalAmount,
        items: orderItems,
      },
      correlationId
    );

    await this.processOrderSaga(order.id, correlationId);

    return order;
  }

  private async processOrderSaga(orderId: string, correlationId?: string) {
    try {
      const order = await this.getOrderById(orderId);

      for (const item of order.items) {
        await this.productServiceClient.post(
          `/api/products/${item.productId}/inventory`,
          {
            quantity: item.quantity,
            operation: "decrease",
          }
        );
      }

      const payment = await this.paymentServiceClient.post<{
        success: boolean;
        data: { id: string; status: string };
      }>("/api/payments", {
        orderId: order.id,
        amount: order.totalAmount,
        paymentMethod: "credit_card",
      });

      if (payment.success && payment.data.status === "COMPLETED") {
        await this.updateOrderStatus(orderId, {
          status: OrderStatus.CONFIRMED,
        });

        await this.publishEvent(
          Events.ORDER.CONFIRMED,
          { orderId, paymentId: payment.data.id },
          correlationId
        );
      } else {
        await this.cancelOrder(orderId, "Payment failed");
      }
    } catch (error) {
      await this.cancelOrder(
        orderId,
        error instanceof Error ? error.message : "Saga failed"
      );
      throw error;
    }
  }

  private async cancelOrder(orderId: string, reason: string) {
    const order = await this.getOrderById(orderId);

    for (const item of order.items) {
      try {
        await this.productServiceClient.post(
          `/api/products/${item.productId}/inventory`,
          {
            quantity: item.quantity,
            operation: "increase",
          }
        );
      } catch (error) {
        console.error(
          `Failed to restore inventory for product ${item.productId}:`,
          error
        );
      }
    }

    await this.updateOrderStatus(orderId, {
      status: OrderStatus.CANCELLED,
    });

    await this.publishEvent(Events.ORDER.CANCELLED, {
      orderId,
      reason,
    });
  }

  async getOrders(query: OrderQueryDto, userId?: string) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Order");
    }

    return order;
  }

  async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusDto,
    correlationId?: string
  ) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: data.status as OrderStatus },
      include: {
        items: true,
      },
    });

    await this.publishEvent(
      Events.ORDER.STATUS_UPDATED,
      { orderId, status: data.status },
      correlationId
    );

    return order;
  }

  async cancelOrderById(orderId: string, correlationId?: string) {
    const order = await this.getOrderById(orderId);

    if (order.status === OrderStatus.CANCELLED) {
      throw new ConflictError("Order is already cancelled");
    }

    if (
      order.status === OrderStatus.SHIPPED ||
      order.status === OrderStatus.DELIVERED
    ) {
      throw new ConflictError("Cannot cancel shipped or delivered order");
    }

    await this.cancelOrder(orderId, "Cancelled by user");

    return this.getOrderById(orderId);
  }

  private async validateUser(userId: string) {
    try {
      const user = await this.userServiceClient.get<{
        success: boolean;
        data: { id: string };
      }>(`/api/users/${userId}`);

      if (!user.success || !user.data) {
        throw new NotFoundError("User");
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new NotFoundError("User");
    }
  }
}
