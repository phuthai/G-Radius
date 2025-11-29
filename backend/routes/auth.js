const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const googleAuth = require('../config/google-auth');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 8 }),
        body('name').trim().notEmpty()
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
            }

            const { email, password, name } = req.body;

            // Check if user exists
            const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(409).json({ error: { message: 'Email already registered' } });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 12);

            // Create user
            const [result] = await db.query(
                'INSERT INTO users (email, password_hash, name, role, status) VALUES (?, ?, ?, ?, ?)',
                [email, passwordHash, name, 'user', 'active']
            );

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: result.insertId,
                    email,
                    name,
                    role: 'user'
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// Login
router.post('/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty()
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
            }

            const { email, password } = req.body;

            // Find user
            const [users] = await db.query(
                'SELECT id, email, password_hash, name, role, status FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                return res.status(401).json({ error: { message: 'Invalid credentials' } });
            }

            const user = users[0];

            if (user.status !== 'active') {
                return res.status(403).json({ error: { message: 'Account is not active' } });
            }

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: { message: 'Invalid credentials' } });
            }

            // Generate JWT
            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Create session
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            await db.query(
                'INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)',
                [user.id, token, req.ip, req.get('user-agent'), expiresAt]
            );

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// Logout
router.post('/logout', authMiddleware, async (req, res, next) => {
    try {
        const token = req.headers.authorization.substring(7);
        await db.query('DELETE FROM sessions WHERE token = ?', [token]);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
});

// Get current user
router.get('/me', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

// ===== Google OAuth Routes =====

// Get Google auth status (public)
router.get('/google/status', async (req, res, next) => {
    try {
        await googleAuth.loadSettings();
        res.json({
            enabled: googleAuth.isEnabled(),
            configured: googleAuth.oauth2Client !== null
        });
    } catch (error) {
        next(error);
    }
});

// Get Google auth URL for login
router.get('/google/url', async (req, res, next) => {
    try {
        await googleAuth.loadSettings();

        if (!googleAuth.isEnabled()) {
            return res.status(400).json({ error: { message: 'Google authentication is not enabled' } });
        }

        const state = Math.random().toString(36).substring(7);
        const authUrl = googleAuth.getAuthUrl(state);

        res.json({ authUrl, state });
    } catch (error) {
        next(error);
    }
});

// Handle Google OAuth callback
router.get('/google/callback', async (req, res, next) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.redirect('http://10.0.0.2/login?error=no_code');
        }

        await googleAuth.loadSettings();

        // Exchange code for tokens
        const tokens = await googleAuth.getTokens(code);

        // Get user info from Google
        const userInfo = await googleAuth.getUserInfo(tokens);

        // Check if user exists
        let [users] = await db.query('SELECT * FROM users WHERE google_id = ?', [userInfo.id]);

        let userId;
        if (users.length === 0) {
            // Create new user
            const username = userInfo.email.split('@')[0];
            const [result] = await db.query(
                `INSERT INTO users (username, email, google_id, auth_provider, profile_picture, role, status, created_at)
                 VALUES (?, ?, ?, 'google', ?, 'user', 'active', NOW())`,
                [username, userInfo.email, userInfo.id, userInfo.picture]
            );
            userId = result.insertId;
        } else {
            // Update existing user
            userId = users[0].id;
            await db.query(
                'UPDATE users SET profile_picture = ?, updated_at = NOW() WHERE id = ?',
                [userInfo.picture, userId]
            );
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            { userId, email: userInfo.email, role: users.length > 0 ? users[0].role : 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Create session
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await db.query(
            'INSERT INTO sessions (user_id, token, ip_address, user_agent, expires_at) VALUES (?, ?, ?, ?, ?)',
            [userId, jwtToken, req.ip, req.get('user-agent'), expiresAt]
        );

        // Redirect to frontend with token
        res.redirect(`http://10.0.0.2/auth/callback?token=${jwtToken}`);
    } catch (error) {
        console.error('Google OAuth error:', error);
        res.redirect('http://10.0.0.2/login?error=auth_failed');
    }
});

// Update Google auth configuration (admin only)
router.post('/google/config',
    authMiddleware,
    [
        body('client_id').optional().isString().trim(),
        body('client_secret').optional().isString().trim(),
        body('enabled').isBoolean()
    ],
    async (req, res, next) => {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: { message: 'Admin access required' } });
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
            }

            const { client_id, client_secret, enabled } = req.body;

            const success = await googleAuth.updateSettings(
                client_id,
                client_secret,
                enabled,
                req.user.id
            );

            if (success) {
                res.json({ message: 'Google auth configuration updated successfully' });
            } else {
                res.status(500).json({ error: { message: 'Failed to update configuration' } });
            }
        } catch (error) {
            next(error);
        }
    }
);

// Get Google auth configuration (admin only)
router.get('/google/config', authMiddleware, async (req, res, next) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: { message: 'Admin access required' } });
        }

        const settings = await googleAuth.loadSettings();

        if (!settings) {
            return res.json({
                enabled: false,
                client_id: '',
                configured: false
            });
        }

        res.json({
            enabled: settings.enabled,
            client_id: settings.client_id,
            configured: !!(settings.client_id && settings.client_secret)
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
