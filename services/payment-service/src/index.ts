import dotenv from "dotenv";
import path from "path";

const rootEnvPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: rootEnvPath });

import express from "express";
import cors from "cors";
import { Logger, EventBus } from "@ecommerce/common";
import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/error.middleware";
import { createPaymentRoutes } from "./routes/payment.routes";
import { PaymentService } from "./services/payment.service";

const app = express();
const logger = new Logger("payment-service");
const PORT = process.env.PAYMENT_SERVICE_PORT || 3004;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const headerValue = req.headers["x-correlation-id"];
  const correlationId = Array.isArray(headerValue)
    ? headerValue[0]
    : headerValue ||
      `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.headers["x-correlation-id"] = correlationId;
  res.setHeader("x-correlation-id", correlationId);

  logger.info(`${req.method} ${req.path}`, {
    correlationId,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  next();
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "payment-service",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req, res) => {
  res.json({ message: "Payment Service", version: "1.0.0" });
});

app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabase();

    const paymentService = new PaymentService();
    const rabbitmqUrl = process.env.RABBITMQ_URL;
    if (rabbitmqUrl) {
      const eventBus = new EventBus({ url: rabbitmqUrl });
      await eventBus.connect();
      paymentService.setEventBus(eventBus);
      logger.info("Event bus connected");
    }

    app.use("/api/payments", createPaymentRoutes(paymentService));

    app.listen(PORT, () => {
      logger.info(`Payment Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
