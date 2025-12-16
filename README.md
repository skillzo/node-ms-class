# E-Commerce Microservices Platform

## Architecture

6 microservices: API Gateway, User, Product, Order, Payment, Notification. Services communicate via REST (sync) and message queues (async). Each service has its own database.

## Project Structure

```
node-ms/
├── packages/
│   ├── common/              # Shared utilities
│   └── types/               # Shared TypeScript types
├── services/
│   ├── api-gateway/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   └── notification-service/
├── docker-compose.yml
└── package.json
```

## Implementation Phases

### Phase 1: Foundation

- Monorepo setup (npm workspace, TypeScript)
- Shared libraries (logger, errors, events, http-client, auth, validation)
- Docker Compose (PostgreSQL x2, MongoDB x2, RabbitMQ/Redis, Redis cache)
- API Gateway foundation (routing, CORS, rate limiting)

### Phase 2: User Service

- PostgreSQL, Express, JWT
- Registration, login, profile management
- Endpoints: `/register`, `/login`, `/users/:id`, `/validate-token`

### Phase 3: Product Service

- MongoDB, Express
- Product CRUD, inventory, search/filtering
- Events: `product.created`, `product.updated`, `product.stock.*`
- Endpoints: `/products`, `/products/:id`, `/products/:id/inventory`

### Phase 4: Order Service

- PostgreSQL, Express
- Order creation, status management, Saga pattern
- Saga: Create Order → Reserve Inventory → Process Payment → Confirm
- Events: `order.created`, `order.confirmed`, `order.cancelled`
- Endpoints: `/orders`, `/orders/:id`, `/orders/user/:userId`

### Phase 5: Payment Service

- PostgreSQL, Express
- Payment processing (mock), refunds
- Events: `payment.initiated`, `payment.completed`, `payment.failed`
- Endpoints: `/payments`, `/payments/:id`, `/payments/order/:orderId`

### Phase 6: Notification Service

- MongoDB, Express
- Event subscriptions, email/SMS (mock)
- Subscribes to: `order.*`, `payment.completed`
- Endpoints: `/notifications`, `/notifications/user/:userId`

### Phase 7: Cross-Cutting

- Observability: Prometheus metrics, OpenTelemetry tracing, health checks
- Security: JWT validation, API keys, input validation, rate limiting
- Resilience: Circuit breaker, retry logic, timeouts

### Phase 8: Testing

- Unit tests (Jest), integration tests, E2E tests
- Test coverage > 70%

### Phase 9: Documentation

- OpenAPI/Swagger specs, architecture docs, setup guide

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Databases**: PostgreSQL (User, Order, Payment), MongoDB (Product, Notification)
- **Message Broker**: RabbitMQ or Redis Pub/Sub
- **Caching**: Redis
- **ORM/ODM**: Prisma/TypeORM (PostgreSQL), Mongoose (MongoDB)
- **Validation**: Zod
- **Testing**: Jest, Supertest
- **Logging**: Winston
- **Containerization**: Docker, Docker Compose

## Service Details

### API Gateway

- Single entry point, request routing, rate limiting, authentication

### User Service

- User registration/login, JWT generation, password hashing, profile management

### Product Service

- Product catalog, inventory management, search/filtering, stock updates

### Order Service

- Order creation, status management, Saga orchestration for distributed transactions

### Payment Service

- Payment processing (mock), refund handling, transaction tracking

### Notification Service

- Event-driven notifications, email/SMS (mock), notification history

## Key Patterns

- **Database per Service**: Each service owns its data
- **Event-Driven Architecture**: Async communication via message broker
- **Saga Pattern**: Distributed transaction orchestration
- **API Gateway**: Single entry point for clients
- **Circuit Breaker**: Fault tolerance for service calls
- **CQRS**: Separate read/write models where beneficial
