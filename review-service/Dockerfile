# Use an official Node.js runtime as a parent image
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

#Runtime stage
FROM node:20-alpine AS runtime

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install wget for healthcheck
RUN apk add --no-cache wget

COPY --from=builder --chown=appuser:appgroup /app ./

EXPOSE 4002

USER appuser

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4002/health || exit 1

CMD ["node", "index.js"]