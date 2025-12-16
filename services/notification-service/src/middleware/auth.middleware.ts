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


