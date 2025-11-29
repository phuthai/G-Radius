const mysql = require('mysql2/promise');
const logger = require('./logger');

// Database configuration
const dbConfig = {
    host: process.env.MYSQL_IP || '10.0.0.4',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'gradius',
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || 'gradius_db',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 10000
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Connection retry logic with capped exponential backoff
const connectWithRetry = async (retries = 15, initialDelay = 1000, maxDelay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const connection = await pool.getConnection();
            logger.info('✅ MySQL connected successfully', {
                host: dbConfig.host,
                database: dbConfig.database,
                attempt: i + 1
            });
            connection.release();
            return true;
        } catch (err) {
            // Capped exponential backoff: min(initialDelay * 2^i, maxDelay)
            const calculatedDelay = initialDelay * Math.pow(2, i);
            const nextDelay = Math.min(calculatedDelay, maxDelay);

            logger.warn(`❌ MySQL connection attempt ${i + 1}/${retries} failed`, {
                error: err.message,
                nextRetryIn: i < retries - 1 ? `${nextDelay}ms` : 'no more retries'
            });

            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, nextDelay));
            } else {
                logger.error('❌ MySQL connection failed after all retries', {
                    error: err.message,
                    stack: err.stack,
                    totalAttempts: retries
                });
                throw err;
            }
        }
    }
};

// Export connection function
pool.connect = connectWithRetry;

// Wrapper for queries with error handling and logging
pool.queryWithLogging = async (sql, params) => {
    const startTime = Date.now();
    try {
        const [results] = await pool.query(sql, params);
        const duration = Date.now() - startTime;

        if (duration > 1000) {
            logger.warn('Slow query detected', {
                sql: sql.substring(0, 100),
                duration: `${duration}ms`
            });
        }

        return [results];
    } catch (err) {
        logger.error('Database query error', {
            error: err.message,
            sql: sql.substring(0, 100),
            params: JSON.stringify(params).substring(0, 100)
        });
        throw err;
    }
};

module.exports = pool;
