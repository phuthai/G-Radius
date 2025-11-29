# G-Radius - Secure RADIUS & WireGuard Management Platform

![G-Radius](https://img.shields.io/badge/G--Radius-v1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen)

**G-Radius** is a modern, secure web application for managing FreeRADIUS authentication and WireGuard VPN infrastructure with a beautiful React frontend and robust Node.js backend.

## 🔒 Security Architecture

### Zero-Trust VPN-Only Access
- **ONLY port exposed**: WireGuard UDP 51820
- **All services** (MySQL, API, RADIUS, Frontend) accessible **ONLY through VPN**
- **Dual Network Architecture**:
  - **WireGuard VPN**: 192.168.55.0/24 (VPN clients)
  - **Docker Internal**: 10.0.0.0/24 (Services)
- **Zero public attack surface** except WireGuard itself
- **Enhanced Security**: Rate limiting, input sanitization, audit logging

### Network Topology
```
Internet → WireGuard (51820/udp) → VPN Network (192.168.55.0/24)
                                    ↓ (Routing enabled)
                                    Docker Network (10.0.0.0/24)
                                    ├── Nginx (10.0.0.2)
                                    ├── Backend API (10.0.0.3)
                                    ├── MySQL (10.0.0.4)
                                    └── FreeRADIUS (10.0.0.5)
```

📖 **[Detailed Network Architecture Documentation](docs/NETWORK_ARCHITECTURE.md)**

## 🚀 Features

- ✅ **Modern React Frontend** - Glassmorphism design, dark mode, responsive
- ✅ **Hardened Backend API** - Rate limiting, input sanitization, structured logging
- ✅ **Optimized MySQL** - Connection pooling, slow query logging, performance tuning
- ✅ **FreeRADIUS Integration** - Network authentication server
- ✅ **WireGuard Management** - Peer creation, config generation, QR codes
- ✅ **Real-time Analytics** - Bandwidth usage, user statistics, charts
- ✅ **VPN-Only Access** - Maximum security with zero public exposure
- ✅ **Dual Network Architecture** - Separate VPN and service networks with routing
- ✅ **Security Features** - Audit logging, failed login tracking, CSP headers
- ✅ **Docker Compose** - One-command deployment with resource limits

## 📋 Prerequisites

- Docker & Docker Compose
- WireGuard client (for admin access)
- Linux server with kernel 5.6+ (for WireGuard)

## 🛠️ Quick Start

### 1. Clone Repository
```bash
git clone <your-repo>
cd G-Radius
```

### 2. Generate WireGuard Keys
```bash
# Generate server keys
wg genkey | tee server_private.key | wg pubkey > server_public.key

# Generate admin peer keys
wg genkey | tee admin_private.key | wg pubkey > admin_public.key
```

### 3. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required changes in `.env`:**
- `MYSQL_ROOT_PASSWORD` - Strong MySQL root password
- `MYSQL_PASSWORD` - Strong MySQL user password
- `JWT_SECRET` - Random 32+ character string
- `RADIUS_SECRET` - RADIUS shared secret
- `WG_SERVER_ENDPOINT` - Your server's public IP:51820
- `WG_SERVER_PUBLIC_KEY` - From server_public.key

### 4. Start Services
```bash
# Start all containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Create Admin VPN Config

Create `admin.conf`:
```ini
[Interface]
PrivateKey = <admin_private_key>
Address = 192.168.55.10/32
DNS = 192.168.55.1

[Peer]
PublicKey = <server_public_key>
Endpoint = your.server.ip:51820
# Allow access to both VPN and Docker networks
AllowedIPs = 192.168.55.0/24, 10.0.0.0/24
PersistentKeepalive = 25
```

### 6. Connect via VPN
1. Import `admin.conf` to your WireGuard client
2. Activate the VPN connection
3. Access the application at **http://10.0.0.2**

### 7. Login
- **Email**: `admin@gradius.local`
- **Password**: `Admin@123` (⚠️ **CHANGE THIS IMMEDIATELY!**)

## 📁 Project Structure

```
G-Radius/
├── backend/                 # Node.js API
│   ├── config/             # Database config
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API routes
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── src/                    # React frontend
│   ├── components/        # Reusable components
│   ├── pages/             # Page components
│   ├── layouts/           # Layout components
│   └── App.jsx
├── mysql/
│   ├── init/              # Database schema & seeds
│   └── my.cnf             # MySQL config
├── freeradius/
│   ├── raddb/             # RADIUS configuration
│   └── Dockerfile
├── nginx/
│   └── nginx.conf         # Reverse proxy config
├── docker-compose.yml     # Orchestration
├── frontend.Dockerfile    # Frontend build
└── .env.example           # Environment template
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### WireGuard
- `GET /api/wireguard/peers` - List peers
- `POST /api/wireguard/peers` - Create peer
- `GET /api/wireguard/peers/:id/config` - Get config
- `GET /api/wireguard/peers/:id/qr` - Get QR code
- `DELETE /api/wireguard/peers/:id` - Delete peer

### Analytics
- `GET /api/analytics/bandwidth` - Bandwidth usage
- `GET /api/analytics/users/stats` - User statistics
- `GET /api/analytics/users/top` - Top users by bandwidth

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Restart service
docker-compose restart [service_name]

# Rebuild service
docker-compose up -d --build [service_name]

# Execute command in container
docker-compose exec [service_name] [command]

# Database backup
docker-compose exec mysql mysqldump -u root -p gradius_db > backup.sql
```

## 🔐 Security Best Practices

1. **Change default passwords** immediately after first login
2. **Use strong JWT secret** (32+ characters, random)
3. **Enable firewall** - Only allow UDP 51820
4. **Regular updates** - Keep Docker images updated
5. **Monitor logs** - Check for suspicious activity
6. **Backup database** - Regular automated backups
7. **Rotate secrets** - Periodically change passwords and secrets

## 🌐 Access Flow

1. **Admin connects** to WireGuard VPN (gets IP 192.168.55.x)
2. **Traffic routes** from VPN network (192.168.55.0/24) to Docker network (10.0.0.0/24)
3. **Admin accesses** web interface at http://10.0.0.2
4. **Frontend** proxies API calls to http://10.0.0.3:5000
5. **Backend** queries MySQL at 10.0.0.4:3306
6. **RADIUS clients** connect via VPN first, then authenticate at 10.0.0.5

**All connections require active WireGuard VPN!**

### Security Features in Action
- **Rate Limiting**: 100 req/15min global, 5 login attempts/15min
- **Input Sanitization**: Protection against NoSQL injection, XSS
- **Audit Logging**: All authentication events logged
- **CSP Headers**: Content Security Policy prevents XSS attacks

## 📊 Default Credentials

### Web Interface
- Email: `admin@gradius.local`
- Password: `Admin@123` ⚠️ **CHANGE THIS!**

### Database
- Root Password: Set in `.env`
- User: Set in `.env`

### RADIUS Test User
- Username: `testuser`
- Password: `testpass`

## 🐛 Troubleshooting

### Can't access web interface
- Ensure VPN is connected
- Check IP address: `ip addr show wg0`
- Ping services: `ping 10.0.0.2`

### Database connection failed
- Check MySQL is running: `docker-compose ps mysql`
- View logs: `docker-compose logs mysql`
- Verify credentials in `.env`

### WireGuard not working
- Check kernel modules: `lsmod | grep wireguard`
- View WireGuard logs: `docker-compose logs wireguard`
- Verify firewall allows UDP 51820

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📧 Support

For issues and questions, please open a GitHub issue.

---

**Built with ❤️ for secure network management**
