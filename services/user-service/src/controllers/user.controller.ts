import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { validate } from "@ecommerce/common";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  RegisterDto,
  LoginDto,
  UpdateProfileDto,
} from "../dto/user.dto";

const userService = new UserService();

export class UserController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = validate(registerSchema, req.body) as RegisterDto;
      const result = await userService.register(data);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = validate(loginSchema, req.body) as LoginDto;
      const result = await userService.login(data.email, data.password);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      // User ID is set by auth middleware
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
      }

      const user = await userService.getUserById(userId);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
      }

      const data = validate(updateProfileSchema, req.body) as UpdateProfileDto;
      const profile = await userService.updateProfile(userId, data);
      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  async validateToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token =
        req.body.token || req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return res.status(400).json({
          success: false,
          error: { code: "VALIDATION_ERROR", message: "Token is required" },
        });
      }

      const result = await userService.validateToken(token);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
