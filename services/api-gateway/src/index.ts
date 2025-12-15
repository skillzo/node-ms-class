// Load environment variables from root .env
import dotenv from "dotenv";
import path from "path";

const rootEnvPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: rootEnvPath });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Logger } from "@ecommerce/common";
import { services } from "./config/services";
import { createServiceProxy } from "./middleware/proxy.middleware";

const app = express();
const logger = new Logger("api-gateway");
const PORT = process.env.API_GATEWAY_PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use("/api/", limiter);

// Request logging middleware
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

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
  });
});

// API Gateway info endpoint
app.get("/api", (_req, res) => {
  res.json({
    message: "E-Commerce Microservices API Gateway",
    version: "1.0.0",
    services: Object.values(services).map((s) => ({
      name: s.name,
      path: s.path,
    })),
  });
});

// Service proxy routes
// User Service
app.use(services.user.path, createServiceProxy(services.user));

// Product Service
app.use(services.product.path, createServiceProxy(services.product));

// Order Service
app.use(services.order.path, createServiceProxy(services.order));

// Payment Service
app.use(services.payment.path, createServiceProxy(services.payment));

// Notification Service
app.use(services.notification.path, createServiceProxy(services.notification));

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const headerValue = req.headers["x-correlation-id"];
    const correlationId = Array.isArray(headerValue)
      ? headerValue[0]
      : headerValue;

    logger.error("Unhandled error", err, {
      correlationId,
      path: req.path,
      method: req.method,
    });

    res.status(err.statusCode || 500).json({
      error: {
        message: err.message || "Internal server error",
        code: err.code || "INTERNAL_ERROR",
      },
    });
  }
);

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});
