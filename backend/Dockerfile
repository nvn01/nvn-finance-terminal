# syntax=docker/dockerfile:1

# Build stage
FROM golang:1.23-alpine AS builder
WORKDIR /app

# Enable static build
ENV CGO_ENABLED=0
ENV GOTOOLCHAIN=auto

# Pre-cache depsz
COPY go.mod .
COPY go.sum .
RUN go mod download

# Copy source
COPY . .

# Build API
RUN go build -o /app/bin/api ./cmd/api

# Runtime stage (distroless-like using scratch for static binary)
FROM alpine:3.20
# Create non-root user
RUN apk add --no-cache ca-certificates curl && adduser -D -g '' appuser
WORKDIR /app
COPY --from=builder /app/bin/api /app/api
USER appuser

ENV PORT=8080
EXPOSE 8080

# DATABASE_URL is provided via environment at runtime
ENTRYPOINT ["/app/api"]
