import { Request, Response, NextFunction } from "express";
import { AppError } from "@ecommerce/common";
import { Logger } from "@ecommerce/common";

const logger = new Logger("notification-service");

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Request error", err, {
    path: req.path,
    method: req.method,
    correlationId: req.headers["x-correlation-id"] as string,
  });

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


