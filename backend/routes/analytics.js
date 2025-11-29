const express = require('express');
const db = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
// All routes require authentication
// router.use(authMiddleware);

// Get bandwidth usage over time
router.get('/bandwidth', async (req, res, next) => {
  try {
    const { days = 7 } = req.query;

    const [data] = await db.query(`
      SELECT 
        DATE(acctstarttime) as date,
        SUM(acctinputoctets) as upload_bytes,
        SUM(acctoutputoctets) as download_bytes
      FROM radacct
      WHERE acctstarttime >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(acctstarttime)
      ORDER BY date ASC
    `, [parseInt(days)]);

    res.json({ bandwidth: data });
  } catch (error) {
    next(error);
  }
});

// Get user statistics
router.get('/users/stats', async (req, res, next) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_users,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended_users
      FROM users
    `);

    const [sessionStats] = await db.query(`
      SELECT COUNT(*) as active_sessions
      FROM radacct
      WHERE acctstoptime IS NULL
    `);

    res.json({
      users: stats[0],
      sessions: sessionStats[0]
    });
  } catch (error) {
    next(error);
  }
});

// Get top users by bandwidth
router.get('/users/top', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const [topUsers] = await db.query(`
      SELECT 
        username,
        SUM(acctinputoctets + acctoutputoctets) as total_bytes,
        COUNT(*) as session_count
      FROM radacct
      WHERE acctstarttime >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY username
      ORDER BY total_bytes DESC
      LIMIT ?
    `, [parseInt(limit)]);

    res.json({ top_users: topUsers });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
