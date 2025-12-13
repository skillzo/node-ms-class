import { Request, Response, NextFunction } from "express";
import { AppError, Logger } from "@ecommerce/common";

const logger = new Logger("user-service");

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error("Request error", err, {
    path: req.path,
    method: req.method,
    correlationId: req.headers["x-correlation-id"] as string,
  });

  // Handle known AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof Error && "details" in err
          ? { details: (err as any).details }
          : {}),
      },
    });
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    },
  });
};
