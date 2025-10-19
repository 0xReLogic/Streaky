# Build stage
FROM rust:1.83-slim AS builder

WORKDIR /app

# Install dependencies for building
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Copy source code
COPY src ./src

# Build the application
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Copy the binary from builder stage
COPY --from=builder /app/target/release/streaky-server /app/

# Create non-root user
RUN useradd -r -s /bin/false appuser && chown appuser:appuser /app/streaky-server
USER appuser

# Expose port
EXPOSE 8000

# Environment variables (will be overridden by Koyeb)
ENV PORT=8000

# Run the application
CMD ["./streaky-server"]