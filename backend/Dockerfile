FROM node:18-alpine

# Install iproute2 for network routing configuration and su-exec for user switching
RUN apk add --no-cache iproute2 su-exec

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production && \
    npm cache clean --force

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create log directory
RUN mkdir -p /var/log/gradius && \
    chown -R nodejs:nodejs /var/log/gradius

# Copy routing script (will be run as root via entrypoint)
COPY add-wg-route.sh /usr/local/bin/add-wg-route.sh
RUN chmod +x /usr/local/bin/add-wg-route.sh

# Expose port (only accessible via VPN)
EXPOSE 5000

# Health check (runs as root)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node healthcheck.js

# Use entrypoint to set up routing as root, then switch to nodejs user and start server
ENTRYPOINT ["/usr/local/bin/add-wg-route.sh"]
CMD ["su-exec", "nodejs", "node", "server.js"]
