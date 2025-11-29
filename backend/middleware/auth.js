const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: { message: 'No token provided' } });
        }

        const token = authHeader.substring(7);

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if session exists and is valid
        const [sessions] = await db.query(
            'SELECT s.*, u.id, u.email, u.name, u.role, u.status FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > NOW()',
            [token]
        );

        if (sessions.length === 0) {
            return res.status(401).json({ error: { message: 'Invalid or expired token' } });
        }

        const session = sessions[0];

        if (session.status !== 'active') {
            return res.status(403).json({ error: { message: 'User account is not active' } });
        }

        // Attach user to request
        req.user = {
            id: session.id,
            email: session.email,
            name: session.name,
            role: session.role
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: { message: 'Invalid token' } });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: { message: 'Token expired' } });
        }
        next(error);
    }
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: { message: 'Admin access required' } });
    }
    next();
};

module.exports = { authMiddleware, adminOnly };
