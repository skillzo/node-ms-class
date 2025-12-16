// Shared TypeScript types across all services

export * from "./events";

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

import type { EventName } from "./events";

export interface EventPayload {
  eventType: EventName;
  data: any;
  timestamp: string;
  correlationId: string;
  source: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  role: "customer" | "admin";
  profile?: UserProfile | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  totalAmount: number;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  transactionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: "email" | "sms" | "in-app";
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}
