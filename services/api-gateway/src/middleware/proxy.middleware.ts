import { Logger } from "@ecommerce/common";
import { Request, Response } from "express";
import { ServiceConfig, getServiceUrl } from "../config/services";
import { createProxyMiddleware, Options } from "http-proxy-middleware";

const logger = new Logger("api-gateway");

function getCorrelationId(req: Request): string | undefined {
  const headerValue = req.headers["x-correlation-id"];
  if (!headerValue) return undefined;
  return Array.isArray(headerValue) ? headerValue[0] : headerValue;
}

export function createServiceProxy(service: ServiceConfig) {
  const target = getServiceUrl(service);

  if (!target || !target.startsWith("http")) {
    throw new Error(
      `Invalid target URL for service ${service.name}: ${target}. Check environment variables.`
    );
  }

  const proxyOptions: Options = {
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${service.path}`]: service.path,
    },
    on: {
      proxyReq: (proxyReq, req) => {
        const expressReq = req as unknown as Request;
        const correlationId = getCorrelationId(expressReq);
        if (correlationId) {
          proxyReq.setHeader("x-correlation-id", correlationId);
        }

        const serviceApiKey = process.env.SERVICE_API_KEY;
        if (serviceApiKey) {
          proxyReq.setHeader("x-api-key", serviceApiKey);
        }

        logger.debug(
          `Proxying ${expressReq.method} ${expressReq.path} to ${target}`,
          {
            correlationId,
            service: service.name,
            target,
          }
        );
      },
      proxyRes: (proxyRes, req) => {
        const expressReq = req as unknown as Request;
        const correlationId = getCorrelationId(expressReq);
        logger.debug(`Response from ${service.name}: ${proxyRes.statusCode}`, {
          correlationId,
          service: service.name,
          statusCode: proxyRes.statusCode,
        });
      },
      error: (err, req, res) => {
        const expressReq = req as unknown as Request;
        const expressRes = res as unknown as Response;
        const correlationId = getCorrelationId(expressReq);
        logger.error(`Proxy error for ${service.name}`, err, {
          correlationId,
          service: service.name,
          path: expressReq.path,
        });

        if (!expressRes.headersSent) {
          expressRes.status(503).json({
            success: false,
            error: {
              code: "SERVICE_UNAVAILABLE",
              message: `${service.name} is currently unavailable`,
            },
          });
        }
      },
    },
  };

  return createProxyMiddleware(proxyOptions);
}
