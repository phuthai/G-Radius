FROM freeradius/freeradius-server:latest

# Install MySQL client
RUN apt-get update && \
    apt-get install -y default-mysql-client && \
    rm -rf /var/lib/apt/lists/*

# Copy configuration files
COPY raddb /etc/raddb
RUN chmod -R 755 /etc/raddb

# Expose ports (only accessible via VPN)
EXPOSE 1812/udp 1813/udp

# Start FreeRADIUS
CMD ["freeradius", "-X"]
