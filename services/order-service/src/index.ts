import express from 'express';
import Logger from '@ecommerce/common';

const app = express();
const logger = new Logger('order-service');
const PORT = process.env.ORDER_SERVICE_PORT || 3003;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service', timestamp: new Date().toISOString() });
});

// Routes will be added here
app.get('/', (req, res) => {
  res.json({ message: 'Order Service', version: '1.0.0' });
});

app.listen(PORT, () => {
  logger.info(`Order Service running on port ${PORT}`);
});

