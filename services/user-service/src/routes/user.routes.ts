import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";

const router = Router();
const userController = new UserController();

// Public routes
router.post("/register", userController.register.bind(userController));
router.post("/login", userController.login.bind(userController));
router.post(
  "/validate-token",
  userController.validateToken.bind(userController)
);

// Protected routes (require authentication)
router.get(
  "/me",
  authenticate,
  userController.getCurrentUser.bind(userController)
);
router.put(
  "/me/profile",
  authenticate,
  userController.updateProfile.bind(userController)
);

// Admin routes
router.get("/:id", authenticate, userController.getUser.bind(userController));

export default router;
