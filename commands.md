run neccessary containers in docker

# PostgreSQL - User Service

docker run -d --name postgres-user -p 5432:5432 \
 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=userdb \
 postgres:16-alpine

# PostgreSQL - Order Service

docker run -d --name postgres-order -p 5433:5432 \
 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=orderdb \
 postgres:16-alpine

# PostgreSQL - Payment Service

docker run -d --name postgres-payment -p 5434:5432 \
 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=paymentdb \
 postgres:16-alpine

# Redis

docker run -d --name redis -p 6379:6379 redis:7-alpine

# RabbitMQ

docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 \
 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin \
 rabbitmq:3-management-alpine

# MongoDB - Product

docker run -d --name mongodb-product -p 27017:27017 \
 -e MONGO_INITDB_ROOT_USERNAME=admin \
 -e MONGO_INITDB_ROOT_PASSWORD=admin \
 -e MONGO_INITDB_DATABASE=productdb \
 mongo:7

# MongoDB - Notification

docker run -d --name mongodb-notification -p 27018:27017 \
 -e MONGO_INITDB_ROOT_USERNAME=admin \
 -e MONGO_INITDB_ROOT_PASSWORD=admin \
 -e MONGO_INITDB_DATABASE=notificationdb \
 mongo:7
