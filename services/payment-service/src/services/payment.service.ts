import { prisma } from "../config/database";
import { NotFoundError, ConflictError } from "@ecommerce/common";
import { EventBus } from "@ecommerce/common";
import { Events } from "@ecommerce/types";
import {
  CreatePaymentDto,
  RefundPaymentDto,
  PaymentQueryDto,
} from "../dto/payment.dto";
import { PaymentStatus } from "@prisma/client";

export class PaymentService {
  private eventBus: EventBus | null = null;

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
          "payment-service"
        );
      } catch (error) {
        console.error(`Failed to publish event ${eventType}:`, error);
      }
    }
  }

  private async processPaymentMock(
    amount: number,
    paymentMethod: string
  ): Promise<{ success: boolean; transactionId: string }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const success = Math.random() > 0.1;
    const transactionId = `txn_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      success,
      transactionId,
    };
  }

  async createPayment(data: CreatePaymentDto, correlationId?: string) {
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId: data.orderId },
    });

    if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
      throw new ConflictError("Payment already completed for this order");
    }

    const payment = await prisma.payment.create({
      data: {
        orderId: data.orderId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        status: PaymentStatus.PENDING,
      },
    });

    await this.publishEvent(
      Events.PAYMENT.INITIATED,
      {
        paymentId: payment.id,
        orderId: data.orderId,
        amount: data.amount,
      },
      correlationId
    );

    const result = await this.processPaymentMock(
      data.amount,
      data.paymentMethod
    );

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: result.success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
        transactionId: result.transactionId,
      },
    });

    if (result.success) {
      await this.publishEvent(
        Events.PAYMENT.COMPLETED,
        {
          paymentId: updatedPayment.id,
          orderId: data.orderId,
          amount: data.amount,
          transactionId: result.transactionId,
        },
        correlationId
      );
    } else {
      await this.publishEvent(
        Events.PAYMENT.FAILED,
        {
          paymentId: updatedPayment.id,
          orderId: data.orderId,
          amount: data.amount,
        },
        correlationId
      );
    }

    return updatedPayment;
  }

  async getPayments(query: PaymentQueryDto) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPaymentById(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundError("Payment");
    }

    return payment;
  }

  async getPaymentsByOrderId(orderId: string) {
    const payments = await prisma.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    return payments;
  }

  async refundPayment(
    paymentId: string,
    data: RefundPaymentDto,
    correlationId?: string
  ) {
    const payment = await this.getPaymentById(paymentId);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new ConflictError("Only completed payments can be refunded");
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new ConflictError("Payment already refunded");
    }

    const refundAmount = data.amount || payment.amount;

    if (refundAmount > payment.amount) {
      throw new ConflictError("Refund amount cannot exceed payment amount");
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    });

    await this.publishEvent(
      Events.PAYMENT.REFUNDED,
      {
        paymentId: updatedPayment.id,
        orderId: payment.orderId,
        amount: refundAmount,
        reason: data.reason,
      },
      correlationId
    );

    return updatedPayment;
  }
}
