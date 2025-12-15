import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string().url()).default([]),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).optional(),
});

export const updateInventorySchema = z.object({
  quantity: z.number().int(),
  operation: z.enum(["increase", "decrease", "set"]),
});

export const productQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type UpdateInventoryDto = z.infer<typeof updateInventorySchema>;
export type ProductQueryDto = z.infer<typeof productQuerySchema>;
