import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Logger from '@ecommerce/common';

const app = express();
const logger = new Logger('api-gateway');
const PORT = process.env.API_GATEWAY_PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Request logging middleware
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);

  logger.info(`${req.method} ${req.path}`, {
    correlationId,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

// Routes will be added here
app.get('/api', (req, res) => {
  res.json({ message: 'E-Commerce Microservices API Gateway', version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', err, {
    correlationId: req.headers['x-correlation-id'],
    path: req.path,
    method: req.method,
  });

  res.status(err.statusCode || 500).json({
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR',
    },
  });
});

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

