const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin role
router.use(authMiddleware, adminOnly);

// Get all users
router.get('/', async (req, res, next) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT id, email, name, role, status, created_at, updated_at FROM users';
        let countQuery = 'SELECT COUNT(*) as total FROM users';
        const params = [];
        const conditions = [];

        if (search) {
            conditions.push('(email LIKE ? OR name LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

        const [users] = await db.query(query, [...params, parseInt(limit), offset]);
        const [countResult] = await db.query(countQuery, params);

        res.json({
            users,
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

// Get user by ID
router.get('/:id', async (req, res, next) => {
    try {
        const [users] = await db.query(
            'SELECT id, email, name, role, status, created_at, updated_at FROM users WHERE id = ?',
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: { message: 'User not found' } });
        }

        // Get user's WireGuard peers
        const [peers] = await db.query(
            'SELECT id, name, ip_address, status, created_at FROM wireguard_peers WHERE user_id = ?',
            [req.params.id]
        );

        res.json({
            user: users[0],
            wireguard_peers: peers
        });
    } catch (error) {
        next(error);
    }
});

// Create user
router.post('/',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 8 }),
        body('name').trim().notEmpty(),
        body('role').isIn(['admin', 'user']).optional()
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
            }

            const { email, password, name, role = 'user' } = req.body;

            // Check if user exists
            const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
            if (existing.length > 0) {
                return res.status(409).json({ error: { message: 'Email already exists' } });
            }

            const passwordHash = await bcrypt.hash(password, 12);

            const [result] = await db.query(
                'INSERT INTO users (email, password_hash, name, role, status) VALUES (?, ?, ?, ?, ?)',
                [email, passwordHash, name, role, 'active']
            );

            res.status(201).json({
                message: 'User created successfully',
                user: {
                    id: result.insertId,
                    email,
                    name,
                    role
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// Update user
router.put('/:id',
    [
        body('name').trim().notEmpty().optional(),
        body('role').isIn(['admin', 'user']).optional(),
        body('status').isIn(['active', 'inactive', 'suspended']).optional()
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: { message: 'Validation failed', errors: errors.array() } });
            }

            const { name, role, status } = req.body;
            const updates = [];
            const params = [];

            if (name) {
                updates.push('name = ?');
                params.push(name);
            }
            if (role) {
                updates.push('role = ?');
                params.push(role);
            }
            if (status) {
                updates.push('status = ?');
                params.push(status);
            }

            if (updates.length === 0) {
                return res.status(400).json({ error: { message: 'No fields to update' } });
            }

            params.push(req.params.id);

            const [result] = await db.query(
                `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
                params
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: { message: 'User not found' } });
            }

            res.json({ message: 'User updated successfully' });
        } catch (error) {
            next(error);
        }
    }
);

// Delete user
router.delete('/:id', async (req, res, next) => {
    try {
        // Don't allow deleting yourself
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ error: { message: 'Cannot delete your own account' } });
        }

        const [result] = await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: { message: 'User not found' } });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
