const express = require('express');
const db = require('../config/database');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication and admin role
// All routes require authentication and admin role
// router.use(authMiddleware, adminOnly);

// Get RADIUS accounting data
router.get('/accounting', async (req, res, next) => {
    try {
        const { username, limit = 100 } = req.query;
        let query = `
      SELECT acctsessionid, username, nasipaddress, acctstarttime, acctstoptime, 
             acctsessiontime, acctinputoctets, acctoutputoctets
      FROM radacct
    `;
        const params = [];

        if (username) {
            query += ' WHERE username = ?';
            params.push(username);
        }

        query += ' ORDER BY acctstarttime DESC LIMIT ?';
        params.push(parseInt(limit));

        const [sessions] = await db.query(query, params);
        res.json({ sessions });
    } catch (error) {
        next(error);
    }
});

// Get active sessions
router.get('/sessions/active', async (req, res, next) => {
    try {
        const [sessions] = await db.query(`
      SELECT acctsessionid, username, nasipaddress, acctstarttime, acctsessiontime
      FROM radacct
      WHERE acctstoptime IS NULL
      ORDER BY acctstarttime DESC
    `);
        res.json({ active_sessions: sessions });
    } catch (error) {
        next(error);
    }
});

// Get RADIUS users
router.get('/users', async (req, res, next) => {
    try {
        const [users] = await db.query(`
            SELECT id, username, attribute, op, value 
            FROM radcheck 
            ORDER BY username ASC
        `);
        res.json({ users });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
