import { prisma } from "../config/database";
import { NotFoundError, ConflictError } from "@ecommerce/common";
import { EventBus } from "@ecommerce/common";
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateInventoryDto,
  ProductQueryDto,
} from "../dto/product.dto";
import { Prisma } from "@prisma/client";

export class ProductService {
  private eventBus: EventBus | null = null;

  setEventBus(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  private async publishEvent(
    eventType: string,
    data: any,
    correlationId?: string
  ) {
    if (this.eventBus) {
      try {
        await this.eventBus.publish(
          eventType,
          data,
          correlationId,
          "product-service"
        );
      } catch (error) {
        console.error(`Failed to publish event ${eventType}:`, error);
      }
    }
  }

  async createProduct(data: CreateProductDto, correlationId?: string) {
    const product = await prisma.product.create({
      data,
    });

    await this.publishEvent(
      "product.created",
      { productId: product.id, ...data },
      correlationId
    );

    return product;
  }

  async getProducts(query: ProductQueryDto) {
    const { page, limit, category, minPrice, maxPrice, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundError("Product");
    }
    return product;
  }

  async updateProduct(
    productId: string,
    data: UpdateProductDto,
    correlationId?: string
  ) {
    const product = await prisma.product.update({
      where: { id: productId },
      data,
    });

    await this.publishEvent(
      "product.updated",
      { productId, ...data },
      correlationId
    );

    return product;
  }

  async deleteProduct(productId: string, correlationId?: string) {
    try {
      const product = await prisma.product.delete({
        where: { id: productId },
      });

      await this.publishEvent("product.deleted", { productId }, correlationId);

      return product;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Record to delete does not exist")
      ) {
        throw new NotFoundError("Product");
      }
      throw error;
    }
  }

  async updateInventory(
    productId: string,
    data: UpdateInventoryDto,
    correlationId?: string
  ) {
    const product = await this.getProductById(productId);
    const oldStock = product.stock;
    let newStock: number;

    switch (data.operation) {
      case "increase":
        newStock = oldStock + data.quantity;
        break;
      case "decrease":
        if (oldStock < data.quantity) {
          throw new ConflictError("Insufficient stock");
        }
        newStock = oldStock - data.quantity;
        break;
      case "set":
        newStock = data.quantity;
        break;
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });

    const stockChanged = oldStock !== newStock;
    if (stockChanged) {
      const eventType =
        newStock < oldStock
          ? "product.stock.decreased"
          : "product.stock.increased";
      await this.publishEvent(
        eventType,
        {
          productId,
          oldStock,
          newStock,
          quantity: data.quantity,
          operation: data.operation,
        },
        correlationId
      );
    }

    return updatedProduct;
  }

  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.getProductById(productId);
    return product.stock >= quantity;
  }

  async reserveStock(productId: string, quantity: number) {
    return this.updateInventory(productId, {
      quantity,
      operation: "decrease",
    });
  }
}
