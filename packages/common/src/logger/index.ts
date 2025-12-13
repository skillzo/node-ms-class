import winston from "winston";

export interface LoggerContext {
  correlationId?: string;
  service?: string;
  userId?: string;
  [key: string]: any;
}

class Logger {
  private logger: winston.Logger;

  constructor(serviceName: string = "unknown") {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: serviceName },
      transports: [
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
      ],
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
