#!/bin/bash
# WireGuard Routing Setup Script
# This script configures routing between WireGuard VPN network (192.168.55.0/24)
# and Docker services network (10.0.0.0/24)

set -e

echo "🔧 Configuring WireGuard routing..."

# Enable IP forwarding (should already be enabled via sysctls)
echo 1 > /proc/sys/net/ipv4/ip_forward
echo "✅ IP forwarding enabled"

# Get the WireGuard interface name (usually wg0)
WG_INTERFACE="wg0"

# Wait for WireGuard interface to be ready
for i in {1..30}; do
    if ip link show $WG_INTERFACE &>/dev/null; then
        echo "✅ WireGuard interface $WG_INTERFACE is ready"
        break
    fi
    echo "⏳ Waiting for WireGuard interface... ($i/30)"
    sleep 1
done

# Add iptables rules for NAT and forwarding between networks
echo "🔧 Configuring iptables rules..."

# Allow forwarding between WireGuard clients and Docker network (eth0)
iptables -A FORWARD -i $WG_INTERFACE -o eth0 -j ACCEPT
iptables -A FORWARD -i eth0 -o $WG_INTERFACE -j ACCEPT

# NAT for WireGuard clients accessing Docker network
iptables -t nat -A POSTROUTING -s 192.168.55.0/24 -d 10.0.0.0/24 -j MASQUERADE

# Allow established connections
iptables -A FORWARD -m state --state RELATED,ESTABLISHED -j ACCEPT

echo "✅ Routing configuration complete!"
echo "📊 Current routing table:"
ip route show

echo "📊 Current iptables NAT rules:"
iptables -t nat -L POSTROUTING -n -v

echo "📊 Current iptables FORWARD rules:"
iptables -L FORWARD -n -v
