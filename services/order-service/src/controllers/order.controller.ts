import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { validate } from "@ecommerce/common";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderQuerySchema,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderQueryDto,
} from "../dto/order.dto";

export class OrderController {
  constructor(private orderService: OrderService) {}

  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
      }

      const data = validate(createOrderSchema, req.body) as CreateOrderDto;
      const correlationId = req.headers["x-correlation-id"] as string;
      const order = await this.orderService.createOrder(
        userId,
        data,
        correlationId
      );

      res.status(201).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const query = validate(orderQuerySchema, req.query) as OrderQueryDto;
      const result = await this.orderService.getOrders(query, userId);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);

      const userId = (req as any).user?.userId;
      if (userId && order.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: { code: "FORBIDDEN", message: "Access denied" },
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const query = validate(orderQuerySchema, req.query) as OrderQueryDto;
      const result = await this.orderService.getOrders(query, userId);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = validate(
        updateOrderStatusSchema,
        req.body
      ) as UpdateOrderStatusDto;
      const correlationId = req.headers["x-correlation-id"] as string;
      const order = await this.orderService.updateOrderStatus(
        id,
        data,
        correlationId
      );

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const correlationId = req.headers["x-correlation-id"] as string;
      const order = await this.orderService.cancelOrderById(id, correlationId);

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }
}


