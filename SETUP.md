# Setup Guide

## Prerequisites

- Node.js 18+
- npm 9+
- Docker and Docker Compose

## Initial Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start infrastructure services**

   ```bash
   docker-compose up -d
   ```

   This starts:

   - PostgreSQL (3 instances: user, order, payment)
   - MongoDB (2 instances: product, notification)
   - RabbitMQ
   - Redis

4. **Build shared packages**

   ```bash
   npm run build --workspace=@ecommerce/common
   npm run build --workspace=@ecommerce/types
   ```

5. **Set up Prisma for PostgreSQL services**

   ```bash
   # User Service
   cd services/user-service
   npx prisma migrate dev --name init
   npx prisma generate
   cd ../..

   # Order Service
   cd services/order-service
   npx prisma migrate dev --name init
   npx prisma generate
   cd ../..

   # Payment Service
   cd services/payment-service
   npx prisma migrate dev --name init
   npx prisma generate
   cd ../..
   ```

6. **Build all services**
   ```bash
   npm run build
   ```

## Running Services

### Development Mode

Each service can be run in development mode with hot reload:

```bash
# API Gateway
cd services/api-gateway && npm run dev

# User Service
cd services/user-service && npm run dev

# Product Service
cd services/product-service && npm run dev

# Order Service
cd services/order-service && npm run dev

# Payment Service
cd services/payment-service && npm run dev

# Notification Service
cd services/notification-service && npm run dev
```

### Production Mode

```bash
# Build all
npm run build

# Start services
cd services/api-gateway && npm start
# ... repeat for other services
```

## Service Ports

- API Gateway: 3000
- User Service: 3001
- Product Service: 3002
- Order Service: 3003
- Payment Service: 3004
- Notification Service: 3005

## Database Ports

- PostgreSQL User: 5432
- PostgreSQL Order: 5433
- PostgreSQL Payment: 5434
- MongoDB Product: 27017
- MongoDB Notification: 27018
- RabbitMQ: 5672 (AMQP), 15672 (Management UI)
- Redis: 6379

## Useful Commands

```bash
# Clean all build artifacts
npm run clean

# Run tests (when implemented)
npm test

# Lint code (when implemented)
npm run lint

# Prisma Studio (for database inspection)
cd services/user-service && npm run prisma:studio
```
