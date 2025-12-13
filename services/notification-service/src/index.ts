// Load environment variables from root .env
import dotenv from "dotenv";
import path from "path";

const rootEnvPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: rootEnvPath });

import express from "express";
import { Logger } from "@ecommerce/common";

const app = express();
const logger = new Logger("notification-service");
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 3005;

app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "notification-service",
    timestamp: new Date().toISOString(),
  });
});

// Routes will be added here
app.get("/", (_req, res) => {
  res.json({ message: "Notification Service", version: "1.0.0" });
});

app.listen(PORT, () => {
  logger.info(`Notification Service running on port ${PORT}`);
});
