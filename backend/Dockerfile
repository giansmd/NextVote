# Build stage
FROM node:20-bullseye-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate

# Production stage
FROM node:20-bullseye-slim

WORKDIR /usr/src/app

COPY package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/prisma ./prisma
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "src/index.js"]