import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { validate } from "@ecommerce/common";
import {
  createProductSchema,
  updateProductSchema,
  updateInventorySchema,
  productQuerySchema,
  CreateProductDto,
  UpdateProductDto,
  UpdateInventoryDto,
  ProductQueryDto,
} from "../dto/product.dto";

export class ProductController {
  constructor(private productService: ProductService) {}

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const data = validate(createProductSchema, req.body) as CreateProductDto;
      const correlationId = req.headers["x-correlation-id"] as string;
      const product = await this.productService.createProduct(
        data,
        correlationId
      );
      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const query = validate(productQuerySchema, req.query) as ProductQueryDto;
      const result = await this.productService.getProducts(query);
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);
      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = validate(updateProductSchema, req.body) as UpdateProductDto;
      const correlationId = req.headers["x-correlation-id"] as string;
      const product = await this.productService.updateProduct(
        id,
        data,
        correlationId
      );
      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const correlationId = req.headers["x-correlation-id"] as string;
      await this.productService.deleteProduct(id, correlationId);
      res.json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = validate(
        updateInventorySchema,
        req.body
      ) as UpdateInventoryDto;
      const correlationId = req.headers["x-correlation-id"] as string;
      const product = await this.productService.updateInventory(
        id,
        data,
        correlationId
      );
      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
}
