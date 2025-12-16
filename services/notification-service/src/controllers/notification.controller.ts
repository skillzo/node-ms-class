import { Request, Response, NextFunction } from "express";
import { NotificationService } from "../services/notification.service";
import { validate } from "@ecommerce/common";
import {
  notificationQuerySchema,
  markAsReadSchema,
  NotificationQueryDto,
  MarkAsReadDto,
} from "../dto/notification.dto";

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const query = validate(
        notificationQuerySchema,
        req.query
      ) as NotificationQueryDto;
      const result = await this.notificationService.getNotifications(
        query,
        userId
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notification = await this.notificationService.getNotificationById(id);

      res.json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const query = validate(
        notificationQuerySchema,
        req.query
      ) as NotificationQueryDto;
      const result = await this.notificationService.getNotifications(
        query,
        userId
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      const data = validate(markAsReadSchema, req.body) as MarkAsReadDto;

      if (!data.notificationIds || data.notificationIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "notificationIds array is required",
          },
        });
      }

      const result = await this.notificationService.markAsRead(
        data.notificationIds,
        userId
      );

      res.json({
        success: true,
        data: { count: result.count },
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
      }

      const result = await this.notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        data: { count: result.count },
      });
    } catch (error) {
      next(error);
    }
  }
}


