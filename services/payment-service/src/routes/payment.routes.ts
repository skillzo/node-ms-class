import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { PaymentService } from "../services/payment.service";
import { authenticate } from "../middleware/auth.middleware";

export function createPaymentRoutes(paymentService: PaymentService): Router {
  const router = Router();
  const paymentController = new PaymentController(paymentService);

  router.post(
    "/",
    authenticate,
    paymentController.createPayment.bind(paymentController)
  );

  router.get("/", authenticate, paymentController.getPayments.bind(paymentController));

  router.get("/:id", authenticate, paymentController.getPayment.bind(paymentController));

  router.get(
    "/order/:orderId",
    authenticate,
    paymentController.getPaymentsByOrder.bind(paymentController)
  );

  router.post(
    "/:id/refund",
    authenticate,
    paymentController.refundPayment.bind(paymentController)
  );

  return router;
}


