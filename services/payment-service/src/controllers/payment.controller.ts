import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service";
import { validate } from "@ecommerce/common";
import {
  createPaymentSchema,
  refundPaymentSchema,
  paymentQuerySchema,
  CreatePaymentDto,
  RefundPaymentDto,
  PaymentQueryDto,
} from "../dto/payment.dto";

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const data = validate(createPaymentSchema, req.body) as CreatePaymentDto;
      const correlationId = req.headers["x-correlation-id"] as string;
      const payment = await this.paymentService.createPayment(
        data,
        correlationId
      );

      res.status(201).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const query = validate(paymentQuerySchema, req.query) as PaymentQueryDto;
      const result = await this.paymentService.getPayments(query);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payment = await this.paymentService.getPaymentById(id);

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentsByOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const payments = await this.paymentService.getPaymentsByOrderId(orderId);

      res.json({
        success: true,
        data: payments,
      });
    } catch (error) {
      next(error);
    }
  }

  async refundPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = validate(refundPaymentSchema, req.body) as RefundPaymentDto;
      const correlationId = req.headers["x-correlation-id"] as string;
      const payment = await this.paymentService.refundPayment(
        id,
        data,
        correlationId
      );

      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      next(error);
    }
  }
}


