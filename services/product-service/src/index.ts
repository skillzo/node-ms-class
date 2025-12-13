// Load environment variables from root .env
import dotenv from 'dotenv';
import path from 'path';

const rootEnvPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: rootEnvPath });

import express from 'express';
import { Logger } from '@ecommerce/common';

const app = express();
const logger = new Logger('product-service');
const PORT = process.env.PRODUCT_SERVICE_PORT || 3002;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product-service', timestamp: new Date().toISOString() });
});

// Routes will be added here
app.get('/', (req, res) => {
  res.json({ message: 'Product Service', version: '1.0.0' });
});

app.listen(PORT, () => {
  logger.info(`Product Service running on port ${PORT}`);
});

