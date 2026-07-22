# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Add fallback routing for SPA
RUN sed -i 's/index  index.html index.htm;/index  index.html index.htm;\n        try_files $uri $uri\/ \/index.html;/' /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["sh", "-c", "sed -i 's/listen[[:space:]]*80;/listen '\"${PORT:-80}\"';/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
