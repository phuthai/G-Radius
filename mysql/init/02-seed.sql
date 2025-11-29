-- Seed data for G-Radius

-- Create default admin user
-- Password: Admin@123 (CHANGE THIS IN PRODUCTION!)
INSERT INTO users (email, password_hash, name, role, status) VALUES
('admin@gradius.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyWPq7JkKq4e', 'Administrator', 'admin', 'active');

-- Create sample regular user
-- Password: User@123
INSERT INTO users (email, password_hash, name, role, status) VALUES
('user@gradius.local', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sample User', 'user', 'active');

-- Add VPN network to NAS (RADIUS clients)
INSERT INTO nas (nasname, shortname, type, secret, description) VALUES
('10.0.0.0/24', 'vpn_network', 'other', 'testing123', 'WireGuard VPN Network');

-- Sample RADIUS user (username: testuser, password: testpass)
INSERT INTO radcheck (username, attribute, op, value) VALUES
('testuser', 'Cleartext-Password', ':=', 'testpass');

INSERT INTO radreply (username, attribute, op, value) VALUES
('testuser', 'Framed-IP-Address', '=', '192.168.100.10'),
('testuser', 'Framed-Route', '+=', '192.168.100.0/24');
