#Builder stage
FROM golang:1.25 AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /docker-gs-ping

#Runtime stage
FROM alpine:3.20 AS runtime

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install wget for healthcheck
RUN apk add --no-cache wget

COPY --from=builder --chown=appuser:appgroup /docker-gs-ping /app/

USER appuser

EXPOSE 4007

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4007/health || exit 1

ENTRYPOINT ["./docker-gs-ping"]