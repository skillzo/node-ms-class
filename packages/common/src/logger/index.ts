import winston from "winston";
import path from "path";
import fs from "fs";

export interface LoggerContext {
  correlationId?: string;
  service?: string;
  userId?: string;
  [key: string]: any;
}

class Logger {
  private logger: winston.Logger;

  constructor(serviceName: string = "unknown") {
    // Create logs directory if it doesn't exist
    const logsDir = process.env.LOGS_DIR || path.join(process.cwd(), "logs");
    const serviceLogsDir = path.join(logsDir, serviceName);

    if (!fs.existsSync(serviceLogsDir)) {
      fs.mkdirSync(serviceLogsDir, { recursive: true });
    }

    const transports: winston.transport[] = [
      // Console transport (always enabled)
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length
              ? JSON.stringify(meta, null, 2)
              : "";
            return `${timestamp} [${level}]: ${message} ${metaStr}`;
          })
        ),
      }),
    ];

    // File transports (if enabled)
    if (process.env.LOG_TO_FILE !== "false") {
      // Combined log file (all levels)
      transports.push(
        new winston.transports.File({
          filename: path.join(serviceLogsDir, "combined.log"),
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          ),
        })
      );

      // Error log file (errors only)
      transports.push(
        new winston.transports.File({
          filename: path.join(serviceLogsDir, "error.log"),
          level: "error",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json()
          ),
        })
      );
    }

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: serviceName },
      transports,
      // Handle exceptions and rejections
      exceptionHandlers:
        process.env.LOG_TO_FILE !== "false"
          ? [
              new winston.transports.File({
                filename: path.join(serviceLogsDir, "exceptions.log"),
              }),
            ]
          : [],
      rejectionHandlers:
        process.env.LOG_TO_FILE !== "false"
          ? [
              new winston.transports.File({
                filename: path.join(serviceLogsDir, "rejections.log"),
              }),
            ]
          : [],
    });
  }

  info(message: string, context?: LoggerContext) {
    this.logger.info(message, context);
  }

  error(message: string, error?: Error | any, context?: LoggerContext) {
    this.logger.error(message, {
      ...context,
      error:
        error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error,
    });
  }

  warn(message: string, context?: LoggerContext) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: LoggerContext) {
    this.logger.debug(message, context);
  }

  child(context: LoggerContext): Logger {
    const childLogger = new Logger(this.logger.defaultMeta?.service as string);
    childLogger.logger = this.logger.child(context);
    return childLogger;
  }
}

export default Logger;
