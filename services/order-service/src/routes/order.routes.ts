import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { OrderService } from "../services/order.service";
import { authenticate } from "../middleware/auth.middleware";

export function createOrderRoutes(orderService: OrderService): Router {
  const router = Router();
  const orderController = new OrderController(orderService);

  router.post(
    "/",
    authenticate,
    orderController.createOrder.bind(orderController)
  );

  router.get(
    "/",
    authenticate,
    orderController.getOrders.bind(orderController)
  );

  router.get(
    "/:id",
    authenticate,
    orderController.getOrder.bind(orderController)
  );

  router.get(
    "/user/:userId",
    authenticate,
    orderController.getUserOrders.bind(orderController)
  );

  router.put(
    "/:id/status",
    orderController.updateOrderStatus.bind(orderController)
  );

  router.post(
    "/:id/cancel",
    authenticate,
    orderController.cancelOrder.bind(orderController)
  );

  return router;
}
