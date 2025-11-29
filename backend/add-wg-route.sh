#!/bin/sh
# Add route to WireGuard network via WireGuard container
# This allows backend to communicate with WireGuard clients

echo "🔧 Adding route to WireGuard network (192.168.55.0/24)..."

# Wait for network to be ready
sleep 2

# Add IPv4 route to WireGuard network via WireGuard container
ip route add 192.168.55.0/24 via 10.0.0.6 2>/dev/null || echo "IPv4 route already exists"

# Add IPv6 route to WireGuard network via WireGuard container
ip -6 route add fd00:192:168:55::/64 via fd00:10::6 2>/dev/null || echo "IPv6 route already exists"

echo "✅ Routes configured successfully!"
echo "📊 Current IPv4 routes:"
ip route show
echo "📊 Current IPv6 routes:"
ip -6 route show

# Execute the original command
exec "$@"
