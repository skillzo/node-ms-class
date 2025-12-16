import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { NotificationService } from "../services/notification.service";
import { authenticate } from "../middleware/auth.middleware";

export function createNotificationRoutes(
  notificationService: NotificationService
): Router {
  const router = Router();
  const notificationController = new NotificationController(
    notificationService
  );

  router.get(
    "/",
    authenticate,
    notificationController.getNotifications.bind(notificationController)
  );

  router.get(
    "/:id",
    authenticate,
    notificationController.getNotification.bind(notificationController)
  );

  router.get(
    "/user/:userId",
    authenticate,
    notificationController.getUserNotifications.bind(notificationController)
  );

  router.post(
    "/mark-read",
    authenticate,
    notificationController.markAsRead.bind(notificationController)
  );

  router.post(
    "/mark-all-read",
    authenticate,
    notificationController.markAllAsRead.bind(notificationController)
  );

  return router;
}


