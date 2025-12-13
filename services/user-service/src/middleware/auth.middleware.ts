import { Request, Response, NextFunction } from "express";
import { AuthUtils } from "@ecommerce/common";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const payload = AuthUtils.requireAuth(authHeader);

    // Attach user info to request
    (req as any).user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const payload = AuthUtils.requireRole(authHeader, allowedRoles);

      // Attach user info to request
      (req as any).user = payload;
      next();
    } catch (error) {
      next(error);
    }
  };
};
