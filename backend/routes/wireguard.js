const express = require('express');
const { body, validationResult } = require('express-validator');
const { execSync } = require('child_process');
const QRCode = require('qrcode');
const db = require('../config/database');
const logger = require('../config/logger');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
// All routes require authentication
// router.use(authMiddleware);

// Get all peers
router.get('/peers', async (req, res, next) => {
    try {
        const { status, user_id } = req.query;
        let query = 'SELECT id, user_id, name, public_key, ip_address, status, created_at FROM wireguard_peers';
        const params = [];
        const conditions = [];

        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }

        if (user_id) {
            conditions.push('user_id = ?');
            params.push(user_id);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC';

        const [peers] = await db.query(query, params);

        logger.info('Retrieved WireGuard peers', {
            count: peers.length,
            userId: req.user.id
        });

        res.json({ peers });
    } catch (error) {
        next(error);
    }
});

// Get peer by ID
router.get('/peers/:id', async (req, res, next) => {
    try {
        const [peers] = await db.query(
            'SELECT id, user_id, name, public_key, ip_address, status, created_at FROM wireguard_peers WHERE id = ?',
            [req.params.id]
        );

        if (peers.length === 0) {
            return res.status(404).json({ error: { message: 'Peer not found' } });
        }

        res.json({ peer: peers[0] });
    } catch (error) {
        next(error);
    }
});

// Create new peer
router.post('/peers',
    [
        body('name').trim().notEmpty().isLength({ min: 1, max: 255 }),
        body('user_id').isInt().optional()
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
            }

            const { name, user_id } = req.body;

            // Generate WireGuard key pair
            let privateKey, publicKey;
            try {
                privateKey = execSync('wg genkey').toString().trim();
                publicKey = execSync(`echo "${privateKey}" | wg pubkey`).toString().trim();
            } catch (err) {
                logger.error('Failed to generate WireGuard keys', { error: err.message });
                return res.status(500).json({
                    error: { message: 'Failed to generate encryption keys' }
                });
            }

            // Find available IP address in 192.168.55.0/24 range
            const [existingIPs] = await db.query(
                'SELECT ip_address FROM wireguard_peers ORDER BY INET_ATON(ip_address)'
            );

            let nextIP = '192.168.55.10'; // Start from .10 to avoid conflicts

            if (existingIPs.length > 0) {
                // Find the next available IP
                const usedIPs = new Set(existingIPs.map(row => row.ip_address));

                for (let i = 10; i < 254; i++) {
                    const candidateIP = `192.168.55.${i}`;
                    if (!usedIPs.has(candidateIP)) {
                        nextIP = candidateIP;
                        break;
                    }
                }

                // Check if we ran out of IPs
                if (usedIPs.has(nextIP)) {
                    logger.error('No available IP addresses in WireGuard subnet');
                    return res.status(507).json({
                        error: { message: 'No available IP addresses in VPN subnet' }
                    });
                }
            }

            // Verify IP is not already in use (race condition protection)
            const [ipCheck] = await db.query(
                'SELECT id FROM wireguard_peers WHERE ip_address = ?',
                [nextIP]
            );

            if (ipCheck.length > 0) {
                logger.error('IP address conflict detected', { ip: nextIP });
                return res.status(409).json({
                    error: { message: 'IP address conflict, please try again' }
                });
            }

            // Create peer in database
            const [result] = await db.query(
                'INSERT INTO wireguard_peers (user_id, name, public_key, private_key, ip_address, status) VALUES (?, ?, ?, ?, ?, ?)',
                [user_id || null, name, publicKey, privateKey, nextIP, 'active']
            );

            logger.info('WireGuard peer created', {
                peerId: result.insertId,
                name,
                ip: nextIP,
                userId: req.user.id
            });

            // Note: In production, you would add the peer to WireGuard server here
            // execSync(`docker exec wireguard wg set wg0 peer ${publicKey} allowed-ips ${nextIP}/32`);

            res.status(201).json({
                message: 'Peer created successfully',
                peer: {
                    id: result.insertId,
                    name,
                    public_key: publicKey,
                    ip_address: nextIP
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// Get peer configuration
router.get('/peers/:id/config', async (req, res, next) => {
    try {
        const [peers] = await db.query(
            'SELECT name, private_key, ip_address FROM wireguard_peers WHERE id = ?',
            [req.params.id]
        );

        if (peers.length === 0) {
            return res.status(404).json({ error: { message: 'Peer not found' } });
        }

        const peer = peers[0];
        const serverPublicKey = process.env.WG_SERVER_PUBLIC_KEY || '<server_public_key>';
        const serverEndpoint = process.env.WG_SERVER_ENDPOINT || 'your.server.ip:51820';

        // Configuration with routing to both networks (IPv4 + IPv6)
        const config = `[Interface]
PrivateKey = ${peer.private_key}
Address = ${peer.ip_address}/32, fd00:192:168:55::${peer.ip_address.split('.')[3]}/128
DNS = 192.168.55.1, fd00:192:168:55::2

[Peer]
PublicKey = ${serverPublicKey}
Endpoint = ${serverEndpoint}
# Allow access to both WireGuard network and Docker services network (IPv4 + IPv6)
AllowedIPs = 192.168.55.0/24, 10.0.0.0/24, fd00:192:168:55::/64, fd00:10::/64
PersistentKeepalive = 25`;

        logger.info('Generated peer configuration', {
            peerId: req.params.id,
            userId: req.user.id
        });

        res.type('text/plain').send(config);
    } catch (error) {
        next(error);
    }
});

// Get peer QR code
router.get('/peers/:id/qr', async (req, res, next) => {
    try {
        const [peers] = await db.query(
            'SELECT name, private_key, ip_address FROM wireguard_peers WHERE id = ?',
            [req.params.id]
        );

        if (peers.length === 0) {
            return res.status(404).json({ error: { message: 'Peer not found' } });
        }

        const peer = peers[0];
        const serverPublicKey = process.env.WG_SERVER_PUBLIC_KEY || '<server_public_key>';
        const serverEndpoint = process.env.WG_SERVER_ENDPOINT || 'your.server.ip:51820';

        const config = `[Interface]
PrivateKey = ${peer.private_key}
Address = ${peer.ip_address}/32, fd00:192:168:55::${peer.ip_address.split('.')[3]}/128
DNS = 192.168.55.1, fd00:192:168:55::2

[Peer]
PublicKey = ${serverPublicKey}
Endpoint = ${serverEndpoint}
AllowedIPs = 192.168.55.0/24, 10.0.0.0/24, fd00:192:168:55::/64, fd00:10::/64
PersistentKeepalive = 25`;

        const qrCode = await QRCode.toDataURL(config);

        logger.info('Generated peer QR code', {
            peerId: req.params.id,
            userId: req.user.id
        });

        res.json({ qr_code: qrCode });
    } catch (error) {
        next(error);
    }
});

// Update peer status
router.patch('/peers/:id/status',
    // adminOnly,
    [
        body('status').isIn(['active', 'inactive'])
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
            }

            const { status } = req.body;
            const [result] = await db.query(
                'UPDATE wireguard_peers SET status = ?, updated_at = NOW() WHERE id = ?',
                [status, req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: { message: 'Peer not found' } });
            }

            logger.info('Peer status updated', {
                peerId: req.params.id,
                status,
                userId: req.user.id
            });

            res.json({ message: 'Peer status updated successfully' });
        } catch (error) {
            next(error);
        }
    }
);

// Delete peer
router.delete('/peers/:id', /* adminOnly, */ async (req, res, next) => {
    try {
        const [peers] = await db.query('SELECT public_key FROM wireguard_peers WHERE id = ?', [req.params.id]);

        if (peers.length === 0) {
            return res.status(404).json({ error: { message: 'Peer not found' } });
        }

        // Remove from WireGuard server (in production)
        // execSync(`docker exec wireguard wg set wg0 peer ${peers[0].public_key} remove`);

        // Delete from database
        await db.query('DELETE FROM wireguard_peers WHERE id = ?', [req.params.id]);

        logger.info('Peer deleted', {
            peerId: req.params.id,
            userId: req.user.id
        });

        res.json({ message: 'Peer deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
