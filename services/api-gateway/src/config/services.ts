// Service configuration for API Gateway
export interface ServiceConfig {
  name: string;
  url: string;
  port: number;
  path: string;
}

function parsePort(envVar: string | undefined, defaultValue: number): number {
  if (!envVar || envVar.trim() === "") {
    return defaultValue;
  }
  const parsed = parseInt(envVar, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export const services: Record<string, ServiceConfig> = {
  user: {
    name: "user-service",
    url: process.env.USER_SERVICE_URL || "http://localhost",
    port: parsePort(process.env.USER_SERVICE_PORT, 3001),
    path: "/api/users",
  },
  product: {
    name: "product-service",
    url: process.env.PRODUCT_SERVICE_URL || "http://localhost",
    port: parsePort(process.env.PRODUCT_SERVICE_PORT, 3002),
    path: "/api/products",
  },
  order: {
    name: "order-service",
    url: process.env.ORDER_SERVICE_URL || "http://localhost",
    port: parsePort(process.env.ORDER_SERVICE_PORT, 3003),
    path: "/api/orders",
  },
  payment: {
    name: "payment-service",
    url: process.env.PAYMENT_SERVICE_URL || "http://localhost",
    port: parsePort(process.env.PAYMENT_SERVICE_PORT, 3004),
    path: "/api/payments",
  },
  notification: {
    name: "notification-service",
    url: process.env.NOTIFICATION_SERVICE_URL || "http://localhost",
    port: parsePort(process.env.NOTIFICATION_SERVICE_PORT, 3005),
    path: "/api/notifications",
  },
};

export function getServiceUrl(service: ServiceConfig): string {
  if (!service.url || !service.port || isNaN(service.port)) {
    throw new Error(
      `Invalid service configuration for ${service.name}: url=${service.url}, port=${service.port}`
    );
  }
  return `${service.url}:${service.port}`;
}
