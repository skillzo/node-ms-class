import express from 'express';
import Logger from '@ecommerce/common';

const app = express();
const logger = new Logger('user-service');
const PORT = process.env.USER_SERVICE_PORT || 3001;

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service', timestamp: new Date().toISOString() });
});

// Routes will be added here
app.get('/', (req, res) => {
  res.json({ message: 'User Service', version: '1.0.0' });
});

app.listen(PORT, () => {
  logger.info(`User Service running on port ${PORT}`);
});

