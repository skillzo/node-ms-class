// Service configuration for API Gateway
export interface ServiceConfig {
  name: string;
  url: string;
  port: number;
  path: string;
}

export const services: Record<string, ServiceConfig> = {
  user: {
    name: "user-service",
    url: process.env.USER_SERVICE_URL || "http://localhost",
    port: parseInt(process.env.USER_SERVICE_PORT || "3001"),
    path: "/api/users",
  },
  product: {
    name: "product-service",
    url: process.env.PRODUCT_SERVICE_URL || "http://localhost",
    port: parseInt(process.env.PRODUCT_SERVICE_PORT || "3002"),
    path: "/api/products",
  },
  order: {
    name: "order-service",
    url: process.env.ORDER_SERVICE_URL || "http://localhost",
    port: parseInt(process.env.ORDER_SERVICE_PORT || "3003"),
    path: "/api/orders",
  },
  payment: {
    name: "payment-service",
    url: process.env.PAYMENT_SERVICE_URL || "http://localhost",
    port: parseInt(process.env.PAYMENT_SERVICE_PORT || "3004"),
    path: "/api/payments",
  },
  notification: {
    name: "notification-service",
    url: process.env.NOTIFICATION_SERVICE_URL || "http://localhost",
    port: parseInt(process.env.NOTIFICATION_SERVICE_PORT || "3005"),
    path: "/api/notifications",
  },
};

export function getServiceUrl(service: ServiceConfig): string {
  return `${service.url}:${service.port}`;
}
