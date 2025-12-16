import { Request, Response, NextFunction } from "express";
import { AuthUtils } from "@ecommerce/common";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers["x-api-key"] as string;

    if (apiKey && AuthUtils.validateServiceApiKey(apiKey)) {
      (req as any).user = { role: "service" };
      return next();
    }

    const payload = AuthUtils.requireAuth(authHeader);
    (req as any).user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        });
      }

      if (user.role === "service" || allowedRoles.includes(user.role)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Insufficient permissions" },
      });
    } catch (error) {
      next(error);
    }
  };
};


