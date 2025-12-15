import { Request, Response } from "express";
import { createProxyMiddleware, Options } from "http-proxy-middleware";
import { Logger } from "@ecommerce/common";
import { ServiceConfig, getServiceUrl } from "../config/services";

const logger = new Logger("api-gateway");

export function createServiceProxy(service: ServiceConfig) {
  const target = getServiceUrl(service);

  const proxyOptions: Options = {
    target,
    changeOrigin: true,
    pathRewrite: {
      // Keep the path as-is (e.g., /api/users/login stays /api/users/login)
      [`^${service.path}`]: service.path,
    },
    on: {
      proxyReq: (proxyReq, req: Request) => {
        // Forward correlation ID
        const correlationId = req.headers["x-correlation-id"];
        if (correlationId) {
          proxyReq.setHeader("x-correlation-id", correlationId as string);
        }

        // Add service-to-service authentication header
        const serviceApiKey = process.env.SERVICE_API_KEY;
        if (serviceApiKey) {
          proxyReq.setHeader("x-api-key", serviceApiKey);
        }

        logger.debug(`Proxying ${req.method} ${req.path} to ${target}`, {
          correlationId,
          service: service.name,
          target,
        });
      },
      proxyRes: (proxyRes, req: Request) => {
        const correlationId = req.headers["x-correlation-id"];
        logger.debug(
          `Response from ${service.name}: ${proxyRes.statusCode}`,
          {
            correlationId,
            service: service.name,
            statusCode: proxyRes.statusCode,
          }
        );
      },
      error: (err, req: Request, res: Response) => {
        const correlationId = req.headers["x-correlation-id"];
        logger.error(`Proxy error for ${service.name}`, err, {
          correlationId,
          service: service.name,
          path: req.path,
        });

        if (!res.headersSent) {
          res.status(503).json({
            success: false,
            error: {
              code: "SERVICE_UNAVAILABLE",
              message: `${service.name} is currently unavailable`,
            },
          });
        }
      },
    },
    logLevel: "silent", // We handle logging ourselves
  };

  return createProxyMiddleware(service.path, proxyOptions);
}

