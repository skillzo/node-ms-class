import dotenv from "dotenv";
import path from "path";

const rootEnvPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: rootEnvPath });

import express from "express";
import cors from "cors";
import { Logger, EventBus } from "@ecommerce/common";
import { connectDatabase } from "./config/database";
import { errorHandler } from "./middleware/error.middleware";
import { createOrderRoutes } from "./routes/order.routes";
import { OrderService } from "./services/order.service";

const app = express();
const logger = new Logger("order-service");
const PORT = process.env.ORDER_SERVICE_PORT || 3003;

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
    service: "order-service",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req, res) => {
  res.json({ message: "Order Service", version: "1.0.0" });
});

app.use(errorHandler);

async function startServer() {
  try {
    await connectDatabase();

    const orderService = new OrderService();
    const rabbitmqUrl = process.env.RABBITMQ_URL;
    if (rabbitmqUrl) {
      const eventBus = new EventBus({ url: rabbitmqUrl });
      await eventBus.connect();
      orderService.setEventBus(eventBus);
      logger.info("Event bus connected");
    }

    app.use("/api/orders", createOrderRoutes(orderService));

    app.listen(PORT, () => {
      logger.info(`Order Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();

