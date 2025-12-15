import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import { ProductService } from "../services/product.service";
import { authenticate, requireRole } from "../middleware/auth.middleware";

export function createProductRoutes(productService: ProductService): Router {
  const router = Router();
  const productController = new ProductController(productService);

  router.get("/", productController.getProducts.bind(productController));
  router.get("/:id", productController.getProduct.bind(productController));

  router.post(
    "/",
    authenticate,
    requireRole(["admin"]),
    productController.createProduct.bind(productController)
  );

  router.put(
    "/:id",
    authenticate,
    requireRole(["admin"]),
    productController.updateProduct.bind(productController)
  );

  router.delete(
    "/:id",
    authenticate,
    requireRole(["admin"]),
    productController.deleteProduct.bind(productController)
  );

  router.post(
    "/:id/inventory",
    productController.updateInventory.bind(productController)
  );

  return router;
}
